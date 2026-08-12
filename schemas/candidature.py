from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .enums import StatutCandidature


class CandidatureBase(BaseModel):
    candidat_id: int
    offre_id: int


class CandidatureCreate(CandidatureBase):
    statut: StatutCandidature = StatutCandidature.SUGGEREE


class CandidatureUpdate(BaseModel):
    statut: Optional[StatutCandidature] = None
    score_matching: Optional[float] = Field(None, ge=0, le=1)


class CandidatureRead(CandidatureBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date_candidature: datetime
    statut: StatutCandidature
    score_matching: Optional[float] = None
