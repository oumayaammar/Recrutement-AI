from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import schemas
from controllers import recruteur_controller as ctrl

router = APIRouter(prefix="/recruteurs", tags=["Recruteurs"])


@router.post("/", response_model=schemas.RecruteurRead, status_code=status.HTTP_201_CREATED)
def creer_recruteur(recruteur: schemas.RecruteurCreate, db: Session = Depends(get_db)):
    return ctrl.creer_recruteur(db, recruteur)


@router.get("/", response_model=List[schemas.RecruteurRead])
def lister_recruteurs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ctrl.lister_recruteurs(db, skip, limit)


@router.get("/recherche/candidats", response_model=List[schemas.ResultatRecherche])
def rechercher_candidats(q: str, limite: int = 10, db: Session = Depends(get_db)):
    """Recherche semantique de CVs a partir d'une requete en langage naturel."""
    resultats = ctrl.rechercher_candidats(db, q, limite)
    return [{"cv": cv, "score_pertinence": score} for cv, score in resultats]
 
 
@router.get("/{recruteur_id}", response_model=schemas.RecruteurRead)
def obtenir_recruteur(recruteur_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_recruteur(db, recruteur_id)


@router.patch("/{recruteur_id}", response_model=schemas.RecruteurRead)
def mettre_a_jour_recruteur(
    recruteur_id: int, recruteur: schemas.RecruteurUpdate, db: Session = Depends(get_db)
):
    return ctrl.mettre_a_jour_recruteur(db, recruteur_id, recruteur)


@router.delete("/{recruteur_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_recruteur(recruteur_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_recruteur(db, recruteur_id)
