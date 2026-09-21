from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
import schemas
from controllers import notification_controller as ctrl

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/", response_model=schemas.NotificationRead, status_code=status.HTTP_201_CREATED)
def creer_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    return ctrl.creer_notification(db, notification)


@router.get("/utilisateur/{utilisateur_id}", response_model=List[schemas.NotificationRead])
def lister_notifications(
    utilisateur_id: int, non_lues_seulement: bool = False, db: Session = Depends(get_db)
):
    return ctrl.lister_notifications_par_utilisateur(db, utilisateur_id, non_lues_seulement)


@router.patch("/{notification_id}/lue", response_model=schemas.NotificationRead)
def marquer_comme_lue(notification_id: int, db: Session = Depends(get_db)):
    return ctrl.marquer_comme_lue(db, notification_id)
