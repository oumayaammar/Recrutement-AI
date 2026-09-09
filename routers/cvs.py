from typing import List

from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from db import get_db
from controllers import embedding_controller
import schemas
from controllers import cv_controller as ctrl

router = APIRouter(prefix="/cvs", tags=["CVs"])


@router.post("/", response_model=schemas.CVRead, status_code=status.HTTP_201_CREATED)
def creer_cv(cv: schemas.CVCreate, db: Session = Depends(get_db)):
    return ctrl.creer_cv(db, cv)

@router.post(
    "/upload",
    response_model=schemas.CVRead,
    status_code=status.HTTP_201_CREATED
)
async def upload_cv(
    file: UploadFile = File(...),
    candidat_id: int = Form(...),
    db: Session = Depends(get_db),
):
    return await ctrl.upload_cv(
        db=db,
        file=file,
        candidat_id=candidat_id
    )

@router.get("/{cv_id}", response_model=schemas.CVRead)
def obtenir_cv(cv_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_cv(db, cv_id)


@router.get("/candidat/{candidat_id}", response_model=List[schemas.CVRead])
def lister_cvs_par_candidat(candidat_id: int, db: Session = Depends(get_db)):
    return ctrl.lister_cvs_par_candidat(db, candidat_id)


@router.patch("/{cv_id}", response_model=schemas.CVRead)
def mettre_a_jour_cv(cv_id: int, cv: schemas.CVUpdate, db: Session = Depends(get_db)):
    return ctrl.mettre_a_jour_cv(db, cv_id, cv)


@router.post("/{cv_id}/extraire", response_model=schemas.CVRead)
def extraire_cv(cv_id: int, db: Session = Depends(get_db)):
    """Lance l'extraction IA des competences/experiences/formations depuis le texte du CV."""
    return ctrl.extraire_cv(db, cv_id)


@router.post("/{cv_id}/embedding", response_model=schemas.EmbeddingRead)
def generer_embedding_cv(cv_id: int, db: Session = Depends(get_db)):
    """Genere (ou regenere) l'embedding du CV a partir de son texte + entites extraites."""
    return embedding_controller.generer_embedding_cv(db, cv_id)
 

@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_cv(cv_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_cv(db, cv_id)