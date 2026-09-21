from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from schemas.competence import CompetenceRead
from schemas.experience import ExperienceRead
from schemas.formation import FormationRead


class CVBase(BaseModel):
    fichier_url: str = Field(..., max_length=500)
    texte_brut: Optional[str] = None


class CVCreate(CVBase):
    candidat_id: int


class CVUpdate(BaseModel):
    fichier_url: Optional[str] = Field(None, max_length=500)
    texte_brut: Optional[str] = None


class CVRead(CVBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidat_id: int
    date_depot: datetime
    competences: List[CompetenceRead] = []
    experiences: List[ExperienceRead] = []
    formations: List[FormationRead] = []