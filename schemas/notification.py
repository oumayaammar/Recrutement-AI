from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    message: str


class NotificationCreate(NotificationBase):
    utilisateur_id: int


class NotificationUpdate(BaseModel):
    lue: bool = True


class NotificationRead(NotificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    utilisateur_id: int
    date: datetime
    lue: bool
