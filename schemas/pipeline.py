from typing import List
 
from pydantic import BaseModel
 
from schemas.candidature import CandidatureRead
from schemas.enums import StatutCandidature
 
 
class EtapePipeline(BaseModel):
    statut: StatutCandidature
    candidatures: List[CandidatureRead]
 
 
class PipelineOffre(BaseModel):
    offre_id: int
    etapes: List[EtapePipeline]
 