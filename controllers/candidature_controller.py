from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
from services import embedding_service
import schemas


def creer_candidature(
    db: Session, candidature_in: schemas.CandidatureCreate
) -> models.Candidature:
    candidat = db.get(models.Candidat, candidature_in.candidat_id)
    if not candidat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidat introuvable.")

    offre = db.get(models.Offre, candidature_in.offre_id)
    if not offre:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offre introuvable.")

    candidature = models.Candidature(
        candidat_id=candidature_in.candidat_id,
        offre_id=candidature_in.offre_id,
    )
    db.add(candidature)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Ce candidat a deja postule a cette offre.",
        )
    db.refresh(candidature)
    return candidature


def obtenir_candidature(db: Session, candidature_id: int) -> models.Candidature:
    candidature = db.get(models.Candidature, candidature_id)
    if not candidature:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidature introuvable.")
    return candidature


def lister_candidatures(
    db: Session,
    candidat_id: Optional[int] = None,
    offre_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Candidature]:
    requete = select(models.Candidature)
    if candidat_id is not None:
        requete = requete.where(models.Candidature.candidat_id == candidat_id)
    if offre_id is not None:
        requete = requete.where(models.Candidature.offre_id == offre_id)
    requete = requete.offset(skip).limit(limit)
    return list(db.execute(requete).scalars().all())


def mettre_a_jour_statut_candidature(
    db: Session, candidature_id: int, candidature_in: schemas.CandidatureUpdate
) -> models.Candidature:
    candidature = obtenir_candidature(db, candidature_id)
    for champ, valeur in candidature_in.model_dump(exclude_unset=True).items():
        setattr(candidature, champ, valeur)
    db.commit()
    db.refresh(candidature)
    return candidature


def supprimer_candidature(db: Session, candidature_id: int) -> None:
    candidature = obtenir_candidature(db, candidature_id)
    db.delete(candidature)
    db.commit()



def calculer_score_matching(db: Session, candidature_id: int) -> models.Candidature:
    """
    Calcule le score de matching entre le CV le plus recent du candidat et
    l'offre visee, a partir de leurs embeddings deja generes.
    """
    candidature = obtenir_candidature(db, candidature_id)
 
    cv = (
        db.execute(
            select(models.CV)
            .where(models.CV.candidat_id == candidature.candidat_id)
            .order_by(models.CV.date_depot.desc())
        )
        .scalars()
        .first()
    )
    if not cv or not cv.embedding:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Aucun CV avec embedding pour ce candidat. Genere d'abord son embedding.",
        )
 
    offre = candidature.offre
    if not offre.embedding:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "L'offre n'a pas encore d'embedding genere.",
        )
 
    candidature.score_matching = embedding_service.score_matching_pourcentage(
        cv.embedding.vecteur, offre.embedding.vecteur
    )
    db.commit()
    db.refresh(candidature)
    return candidature
 
 
def classer_candidatures_pour_offre(db: Session, offre_id: int) -> List[models.Candidature]:
    """Recalcule le score de chaque candidature de l'offre et les retourne triees (meilleur en premier)."""
    offre = db.get(models.Offre, offre_id)
    if not offre:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offre introuvable.")
    if not offre.embedding:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "L'offre n'a pas encore d'embedding genere.",
        )
 
    candidatures = list(
        db.execute(
            select(models.Candidature).where(models.Candidature.offre_id == offre_id)
        ).scalars().all()
    )
 
    for candidature in candidatures:
        try:
            calculer_score_matching(db, candidature.id)
        except HTTPException:
            continue  # candidat sans CV/embedding: on le laisse sans score plutot que de tout bloquer
    
    
    candidatures_avec_score = [
        c for c in candidatures
        if c.score_matching is not None
    ]

    return sorted(
        candidatures_avec_score,
        key=lambda c: (c.score_matching is not None, c.score_matching or 0),
        reverse=True,
    )