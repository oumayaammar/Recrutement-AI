from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExperienceBase(BaseModel):
    poste: str = Field(..., max_length=150)
    entreprise: str = Field(..., max_length=150)
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None


class ExperienceCreate(ExperienceBase):
    cv_id: int


class ExperienceUpdate(BaseModel):
    poste: Optional[str] = Field(None, max_length=150)
    entreprise: Optional[str] = Field(None, max_length=150)
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None


class ExperienceRead(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cv_id: int
