from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from security import hash_password


def creer_candidat(db: Session, candidat_in: schemas.CandidatCreate) -> models.Candidat:
    existant = db.execute(
        select(models.Utilisateur).where(models.Utilisateur.email == candidat_in.email)
    ).scalar_one_or_none()
    if existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe deja.",
        )

    candidat = models.Candidat(
        nom=candidat_in.nom,
        prenom=candidat_in.prenom,
        email=candidat_in.email,
        mot_de_passe=hash_password(candidat_in.mot_de_passe),
        role=models.RoleUtilisateur.CANDIDAT,
        telephone=candidat_in.telephone,
        date_naissance=candidat_in.date_naissance,
        disponibilite=candidat_in.disponibilite,
    )
    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat


def obtenir_candidat(db: Session, candidat_id: int) -> models.Candidat:
    candidat = db.get(models.Candidat, candidat_id)
    if not candidat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidat introuvable.")
    return candidat


def lister_candidats(db: Session, skip: int = 0, limit: int = 100) -> List[models.Candidat]:
    return list(
        db.execute(select(models.Candidat).offset(skip).limit(limit)).scalars().all()
    )


def mettre_a_jour_candidat(
    db: Session, candidat_id: int, candidat_in: schemas.CandidatUpdate
) -> models.Candidat:
    candidat = obtenir_candidat(db, candidat_id)
    for champ, valeur in candidat_in.model_dump(exclude_unset=True).items():
        setattr(candidat, champ, valeur)
    db.commit()
    db.refresh(candidat)
    return candidat


def supprimer_candidat(db: Session, candidat_id: int) -> None:
    candidat = obtenir_candidat(db, candidat_id)
    db.delete(candidat)
    db.commit()
