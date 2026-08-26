from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import models
from controllers import embedding_controller
from controllers import candidature_controller
import schemas
from controllers import offre_controller as ctrl

router = APIRouter(prefix="/offres", tags=["Offres"])


@router.post("/", response_model=schemas.OffreRead, status_code=status.HTTP_201_CREATED)
def creer_offre(offre: schemas.OffreCreate, db: Session = Depends(get_db)):
    return ctrl.creer_offre(db, offre)


@router.get("/", response_model=List[schemas.OffreRead])
def lister_offres(
    skip: int = 0,
    limit: int = 100,
    statut: Optional[models.StatutOffre] = None,
    db: Session = Depends(get_db),
):
    return ctrl.lister_offres(db, skip, limit, statut)


@router.get("/{offre_id}", response_model=schemas.OffreRead)
def obtenir_offre(offre_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_offre(db, offre_id)


@router.patch("/{offre_id}", response_model=schemas.OffreRead)
def mettre_a_jour_offre(offre_id: int, offre: schemas.OffreUpdate, db: Session = Depends(get_db)):
    return ctrl.mettre_a_jour_offre(db, offre_id, offre)


@router.post("/{offre_id}/embedding", response_model=schemas.EmbeddingRead)
def generer_embedding_offre(offre_id: int, db: Session = Depends(get_db)):
    """Genere (ou regenere) l'embedding de l'offre a partir de son titre + description."""
    return embedding_controller.generer_embedding_offre(db, offre_id)
 
 
@router.get("/{offre_id}/classement", response_model=List[schemas.CandidatureRead])
def classer_candidatures(offre_id: int, db: Session = Depends(get_db)):
    """Classe les candidatures de l'offre par score de matching decroissant."""
    return candidature_controller.classer_candidatures_pour_offre(db, offre_id)
 

@router.delete("/{offre_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_offre(offre_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_offre(db, offre_id)
