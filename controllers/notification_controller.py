from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas


def creer_notification(
    db: Session, notification_in: schemas.NotificationCreate
) -> models.Notification:
    utilisateur = db.get(models.Utilisateur, notification_in.utilisateur_id)
    if not utilisateur:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Utilisateur introuvable.")

    notification = models.Notification(
        utilisateur_id=notification_in.utilisateur_id,
        message=notification_in.message,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def lister_notifications_par_utilisateur(
    db: Session, utilisateur_id: int, non_lues_seulement: bool = False
) -> List[models.Notification]:
    requete = select(models.Notification).where(
        models.Notification.utilisateur_id == utilisateur_id
    )
    if non_lues_seulement:
        requete = requete.where(models.Notification.lue.is_(False))
    return list(db.execute(requete).scalars().all())


def marquer_comme_lue(db: Session, notification_id: int) -> models.Notification:
    notification = db.get(models.Notification, notification_id)
    if not notification:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification introuvable.")
    notification.lue = True
    db.commit()
    db.refresh(notification)
    return notification
