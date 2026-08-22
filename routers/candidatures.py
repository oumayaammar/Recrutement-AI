from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import schemas
from controllers import candidature_controller as ctrl

router = APIRouter(prefix="/candidatures", tags=["Candidatures"])


@router.post("/", response_model=schemas.CandidatureRead, status_code=status.HTTP_201_CREATED)
def creer_candidature(candidature: schemas.CandidatureCreate, db: Session = Depends(get_db)):
    return ctrl.creer_candidature(db, candidature)


@router.get("/", response_model=List[schemas.CandidatureRead])
def lister_candidatures(
    candidat_id: Optional[int] = None,
    offre_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return ctrl.lister_candidatures(db, candidat_id, offre_id, skip, limit)


@router.get("/{candidature_id}", response_model=schemas.CandidatureRead)
def obtenir_candidature(candidature_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_candidature(db, candidature_id)


@router.patch("/{candidature_id}", response_model=schemas.CandidatureRead)
def mettre_a_jour_statut_candidature(
    candidature_id: int, candidature: schemas.CandidatureUpdate, db: Session = Depends(get_db)
):
    return ctrl.mettre_a_jour_statut_candidature(db, candidature_id, candidature)


@router.delete("/{candidature_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_candidature(candidature_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_candidature(db, candidature_id)
