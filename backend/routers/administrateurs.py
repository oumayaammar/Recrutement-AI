from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import schemas
from controllers import administrateur_controller as ctrl

router = APIRouter(prefix="/administrateurs", tags=["Administrateurs"])


@router.post("/", response_model=schemas.AdministrateurRead, status_code=status.HTTP_201_CREATED)
def creer_administrateur(admin: schemas.AdministrateurCreate, db: Session = Depends(get_db)):
    return ctrl.creer_administrateur(db, admin)


@router.get("/", response_model=List[schemas.AdministrateurRead])
def lister_administrateurs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ctrl.lister_administrateurs(db, skip, limit)


@router.get("/{admin_id}", response_model=schemas.AdministrateurRead)
def obtenir_administrateur(admin_id: int, db: Session = Depends(get_db)):
    return ctrl.obtenir_administrateur(db, admin_id)


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_administrateur(admin_id: int, db: Session = Depends(get_db)):
    ctrl.supprimer_administrateur(db, admin_id)
