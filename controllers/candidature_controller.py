from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
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
