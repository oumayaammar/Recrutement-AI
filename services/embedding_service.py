from __future__ import annotations

from functools import lru_cache
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    
    return SentenceTransformer(MODEL_NAME)


def generer_embedding(texte: str) -> List[float]:
    modele = _get_model()
    vecteur = modele.encode(texte, normalize_embeddings=True)
    return vecteur.tolist()


def similarite_cosinus(vecteur_a: List[float], vecteur_b: List[float]) -> float:
    a = np.array(vecteur_a, dtype=float)
    b = np.array(vecteur_b, dtype=float)
    norme = np.linalg.norm(a) * np.linalg.norm(b)
    if norme == 0:
        return 0.0
    return float(np.dot(a, b) / norme)


def score_matching_pourcentage(vecteur_cv: List[float], vecteur_offre: List[float]) -> float:
    """Convertit la similarite cosinus (-1..1) en score pourcentage (0..100)."""
    similarite = similarite_cosinus(vecteur_cv, vecteur_offre)
    # score = (similarite + 1) / 2 * 100 
    score = max(0.0, similarite) * 100
    return round(score, 2)