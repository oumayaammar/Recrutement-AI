from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .enums import StatutOffre


class OffreBase(BaseModel):
    titre: str = Field(..., max_length=200)
    description: Optional[str] = None


class OffreCreate(OffreBase):
    recruteur_id: int
    statut: StatutOffre = StatutOffre.BROUILLON


class OffreUpdate(BaseModel):
    titre: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    statut: Optional[StatutOffre] = None


class OffreRead(OffreBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recruteur_id: int
    date_publication: datetime
    statut: StatutOffre
