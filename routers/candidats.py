from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import schemas
from controllers import candidat_controller as ctrl

router = APIRouter(prefix="/candidats", tags=["Candidats"])


@router.post("/", response_model=schemas.CandidatRead, status_code=status.HTTP_201_CREATED)
def creer_candidat(candidat: schemas.CandidatCreate, db: Session = Depends(get_db)):
    return ctrl.creer_candidat(db, candidat)


@router.get("/", response_model=List[schemas.CandidatRead])
def lister_candidats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ctrl.lister_candidats(db, skip, limit)


@router.get("/{candidat_id}", response_model=schemas.CandidatRead)
def obtenir_candidat(candidat_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_candidat(db, candidat_id)


@router.patch("/{candidat_id}", response_model=schemas.CandidatRead)
def mettre_a_jour_candidat(
    candidat_id: int, candidat: schemas.CandidatUpdate, db: Session = Depends(get_db)
):
    return ctrl.mettre_a_jour_candidat(db, candidat_id, candidat)


@router.delete("/{candidat_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_candidat(candidat_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_candidat(db, candidat_id)
