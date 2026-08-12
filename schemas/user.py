from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .enums import RoleUtilisateur


class UtilisateurBase(BaseModel):
    nom: str = Field(..., max_length=100)
    prenom: str = Field(..., max_length=100)
    email: EmailStr


class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str = Field(..., min_length=8)


class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = Field(None, max_length=100)
    prenom: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    mot_de_passe: Optional[str] = Field(None, min_length=8)


class UtilisateurRead(UtilisateurBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: RoleUtilisateur
    date_creation: datetime
