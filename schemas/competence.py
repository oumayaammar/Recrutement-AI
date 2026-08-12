from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CompetenceBase(BaseModel):
    nom: str = Field(..., max_length=150)
    niveau: Optional[str] = Field(None, max_length=50)


class CompetenceCreate(CompetenceBase):
    cv_id: int


class CompetenceUpdate(BaseModel):
    nom: Optional[str] = Field(None, max_length=150)
    niveau: Optional[str] = Field(None, max_length=50)


class CompetenceRead(CompetenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cv_id: int
