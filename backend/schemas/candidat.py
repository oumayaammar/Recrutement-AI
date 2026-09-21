from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .user import UtilisateurBase, UtilisateurCreate, UtilisateurRead


class CandidatBase(UtilisateurBase):
    telephone: Optional[str] = Field(None, max_length=20)
    date_naissance: Optional[date] = None
    disponibilite: bool = True


class CandidatCreate(UtilisateurCreate):
    telephone: Optional[str] = Field(None, max_length=20)
    date_naissance: Optional[date] = None
    disponibilite: bool = True


class CandidatUpdate(BaseModel):
    telephone: Optional[str] = Field(None, max_length=20)
    date_naissance: Optional[date] = None
    disponibilite: Optional[bool] = None


class CandidatRead(UtilisateurRead):
    model_config = ConfigDict(from_attributes=True)

    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    disponibilite: bool
