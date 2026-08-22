from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from security import hash_password


def creer_administrateur(
    db: Session, admin_in: schemas.AdministrateurCreate
) -> models.Administrateur:
    existant = db.execute(
        select(models.Utilisateur).where(models.Utilisateur.email == admin_in.email)
    ).scalar_one_or_none()
    if existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe deja.",
        )

    admin = models.Administrateur(
        nom=admin_in.nom,
        prenom=admin_in.prenom,
        email=admin_in.email,
        mot_de_passe=hash_password(admin_in.mot_de_passe),
        role=models.RoleUtilisateur.ADMINISTRATEUR,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def obtenir_administrateur(db: Session, admin_id: int) -> models.Administrateur:
    admin = db.get(models.Administrateur, admin_id)
    if not admin:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Administrateur introuvable.")
    return admin


def lister_administrateurs(db: Session, skip: int = 0, limit: int = 100) -> List[models.Administrateur]:
    return list(
        db.execute(select(models.Administrateur).offset(skip).limit(limit)).scalars().all()
    )


def supprimer_administrateur(db: Session, admin_id: int) -> None:
    admin = obtenir_administrateur(db, admin_id)
    db.delete(admin)
    db.commit()
