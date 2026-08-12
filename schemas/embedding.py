from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, model_validator


class EmbeddingBase(BaseModel):
    vecteur: List[float]


class EmbeddingCreate(EmbeddingBase):
    cv_id: Optional[int] = None
    offre_id: Optional[int] = None

    @model_validator(mode="after")
    def verifier_source_unique(self) -> "EmbeddingCreate":
        if (self.cv_id is None) == (self.offre_id is None):
            raise ValueError(
                "Un embedding doit être lié soit à un cv_id, soit à un offre_id (jamais les deux ni aucun)."
            )
        return self


class EmbeddingRead(EmbeddingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cv_id: Optional[int] = None
    offre_id: Optional[int] = None
    date_generation: datetime
