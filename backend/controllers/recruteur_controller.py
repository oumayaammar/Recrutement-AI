from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from security import hash_password
from services import embedding_service
from typing import List, Tuple

def creer_recruteur(db: Session, recruteur_in: schemas.RecruteurCreate) -> models.Recruteur:
    existant = db.execute(
        select(models.Utilisateur).where(models.Utilisateur.email == recruteur_in.email)
    ).scalar_one_or_none()
    if existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe deja.",
        )

    recruteur = models.Recruteur(
        nom=recruteur_in.nom,
        prenom=recruteur_in.prenom,
        email=recruteur_in.email,
        mot_de_passe=hash_password(recruteur_in.mot_de_passe),
        role=models.RoleUtilisateur.RECRUTEUR,
        poste=recruteur_in.poste,
        departement=recruteur_in.departement,
    )
    db.add(recruteur)
    db.commit()
    db.refresh(recruteur)
    return recruteur


def obtenir_recruteur(db: Session, recruteur_id: int) -> models.Recruteur:
    recruteur = db.get(models.Recruteur, recruteur_id)
    if not recruteur:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Recruteur introuvable.")
    return recruteur


def lister_recruteurs(db: Session, skip: int = 0, limit: int = 100) -> List[models.Recruteur]:
    return list(
        db.execute(select(models.Recruteur).offset(skip).limit(limit)).scalars().all()
    )


def mettre_a_jour_recruteur(
    db: Session, recruteur_id: int, recruteur_in: schemas.RecruteurUpdate
) -> models.Recruteur:
    recruteur = obtenir_recruteur(db, recruteur_id)
    for champ, valeur in recruteur_in.model_dump(exclude_unset=True).items():
        setattr(recruteur, champ, valeur)
    db.commit()
    db.refresh(recruteur)
    return recruteur


def supprimer_recruteur(db: Session, recruteur_id: int) -> None:
    recruteur = obtenir_recruteur(db, recruteur_id)
    db.delete(recruteur)
    db.commit()

def rechercher_candidats(
    db: Session, requete: str, limite: int = 10
) -> List[Tuple[models.CV, float]]:
    """
    Recherche semantique: transforme la requete en langage naturel du recruteur
    en embedding, puis la compare a l'embedding de chaque CV deja indexe.
    Retourne les CVs les plus pertinents, du meilleur score au moins bon.
    """
    if not requete or not requete.strip():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "La requete de recherche ne peut pas etre vide."
        )
 
    vecteur_requete = embedding_service.generer_embedding(requete)
 
    cvs_indexes = list(
        db.execute(
            select(models.CV).join(
                models.Embedding, models.Embedding.cv_id == models.CV.id
            )
        ).scalars().all()
    )
 
    resultats = [
        (cv, embedding_service.score_matching_pourcentage(vecteur_requete, cv.embedding.vecteur))
        for cv in cvs_indexes
        if cv.embedding is not None
    ]
    resultats.sort(key=lambda paire: paire[1], reverse=True)
    return resultats[:limite]