from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas


def creer_offre(db: Session, offre_in: schemas.OffreCreate) -> models.Offre:
    recruteur = db.get(models.Recruteur, offre_in.recruteur_id)
    if not recruteur:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Recruteur introuvable.")

    offre = models.Offre(
        recruteur_id=offre_in.recruteur_id,
        titre=offre_in.titre,
        description=offre_in.description,
        statut=offre_in.statut,
    )
    db.add(offre)
    db.commit()
    db.refresh(offre)
    return offre


def obtenir_offre(db: Session, offre_id: int) -> models.Offre:
    offre = db.get(models.Offre, offre_id)
    if not offre:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offre introuvable.")
    return offre


def lister_offres(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    statut: Optional[models.StatutOffre] = None,
) -> List[models.Offre]:
    requete = select(models.Offre)
    if statut is not None:
        requete = requete.where(models.Offre.statut == statut)
    requete = requete.offset(skip).limit(limit)
    return list(db.execute(requete).scalars().all())


def mettre_a_jour_offre(db: Session, offre_id: int, offre_in: schemas.OffreUpdate) -> models.Offre:
    offre = obtenir_offre(db, offre_id)
    for champ, valeur in offre_in.model_dump(exclude_unset=True).items():
        setattr(offre, champ, valeur)
    db.commit()
    db.refresh(offre)
    return offre


def supprimer_offre(db: Session, offre_id: int) -> None:
    offre = obtenir_offre(db, offre_id)
    db.delete(offre)
    db.commit()


def obtenir_pipeline(db: Session, offre_id: int) -> dict:
    """
    Regroupe les candidatures d'une offre par statut, dans l'ordre du pipeline
    (Suggeree -> Recue -> Preselectionnee -> Entretien -> Acceptee/Refusee).
    Utile pour un affichage kanban cote recruteur.
    """
    offre = obtenir_offre(db, offre_id)
 
    candidatures = list(
        db.execute(
            select(models.Candidature).where(models.Candidature.offre_id == offre.id)
        ).scalars().all()
    )
 
    groupes: dict = {statut: [] for statut in models.StatutCandidature}
    for candidature in candidatures:
        groupes[candidature.statut].append(candidature)
 
    return {
        "offre_id": offre.id,
        "etapes": [
            {"statut": statut, "candidatures": groupes[statut]}
            for statut in models.StatutCandidature
        ],
    }