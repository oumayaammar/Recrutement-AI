from pydantic import BaseModel, ConfigDict
 
from schemas.cv import CVRead
 
 
class ResultatRecherche(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    cv: CVRead
    score_pertinence: float
 