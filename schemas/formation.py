from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FormationBase(BaseModel):
    diplome: str = Field(..., max_length=150)
    etablissement: str = Field(..., max_length=150)
    annee: Optional[int] = None


class FormationCreate(FormationBase):
    cv_id: int


class FormationUpdate(BaseModel):
    diplome: Optional[str] = Field(None, max_length=150)
    etablissement: Optional[str] = Field(None, max_length=150)
    annee: Optional[int] = None


class FormationRead(FormationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cv_id: int
