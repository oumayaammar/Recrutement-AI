from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .user import UtilisateurBase, UtilisateurCreate, UtilisateurRead


class RecruteurBase(UtilisateurBase):
    poste: Optional[str] = Field(None, max_length=150)
    departement: Optional[str] = Field(None, max_length=150)


class RecruteurCreate(UtilisateurCreate):
    poste: Optional[str] = Field(None, max_length=150)
    departement: Optional[str] = Field(None, max_length=150)


class RecruteurUpdate(BaseModel):
    poste: Optional[str] = Field(None, max_length=150)
    departement: Optional[str] = Field(None, max_length=150)


class RecruteurRead(UtilisateurRead):
    model_config = ConfigDict(from_attributes=True)

    poste: Optional[str] = None
    departement: Optional[str] = None
