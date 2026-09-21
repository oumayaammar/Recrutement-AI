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

    vecteur = modele.encode(
        texte,
        normalize_embeddings=True
    )

    return vecteur.tolist()


def similarite_cosinus(
    vecteur_a: List[float],
    vecteur_b: List[float]
) -> float:

    a = np.array(vecteur_a, dtype=float)
    b = np.array(vecteur_b, dtype=float)

    norme = np.linalg.norm(a) * np.linalg.norm(b)

    if norme == 0:
        return 0.0

    return float(np.dot(a, b) / norme)


# ============================================================
# SCORE SEMANTIQUE
# ============================================================

def score_semantique(
    vecteur_cv: List[float],
    vecteur_offre: List[float]
) -> float:

    similarite = similarite_cosinus(
        vecteur_cv,
        vecteur_offre
    )

    similarite = max(
        0.0,
        min(1.0, similarite)
    )

    return round(similarite * 100, 2)


# ============================================================
# NORMALISATION DES COMPETENCES
# ============================================================

def normaliser_competence(competence: str) -> str:

    if not competence:
        return ""

    c = competence.lower().strip()

    aliases = {
        # JavaScript
        "js": "javascript",
        "java script": "javascript",
        "javascript": "javascript",

        # Node.js
        "node": "node.js",
        "nodejs": "node.js",
        "node.js": "node.js",

        # MongoDB
        "mongo": "mongodb",
        "mongo db": "mongodb",
        "mongoodb": "mongodb",
        "mongodb": "mongodb",

        # Express
        "express": "express.js",
        "expressjs": "express.js",
        "express.js": "express.js",

        # Next.js
        "next": "next.js",
        "nextjs": "next.js",
        "next.js": "next.js",

        # PostgreSQL
        "postgres": "postgresql",
        "postgre": "postgresql",
        "postgresql": "postgresql",
    }

    return aliases.get(c, c)


# ============================================================
# SCORE DES COMPETENCES
# ============================================================

def score_competences(
    competences_cv: List[str],
    competences_offre: List[str]
) -> float:

    cv = {
        normaliser_competence(c)
        for c in competences_cv
        if c
    }

    offre = {
        normaliser_competence(c)
        for c in competences_offre
        if c
    }

    # Supprimer les valeurs vides
    cv.discard("")
    offre.discard("")

    if not offre:
        return 0.0

    matches = cv.intersection(offre)

    return round(
        (len(matches) / len(offre)) * 100,
        2
    )


# ============================================================
# NOUVEAU SCORE COMPLET
# ============================================================

def score_matching_final(
    vecteur_cv: List[float],
    vecteur_offre: List[float],
    competences_cv: List[str],
    competences_offre: List[str],
) -> float:

    score_sem = score_semantique(
        vecteur_cv,
        vecteur_offre
    )

    score_skills = score_competences(
        competences_cv,
        competences_offre
    )

    score_final = (
        0.60 * score_skills
        + 0.40 * score_sem
    )

    return round(score_final, 2)


# ============================================================
# COMPATIBILITE AVEC TON ANCIEN CONTROLLER
# ============================================================

def score_matching_pourcentage(
    vecteur_cv: List[float],
    vecteur_offre: List[float]
) -> float:

    """
    Ancienne fonction conservée pour ne pas modifier
    candidature_controller.py.

    Calcule uniquement le score sémantique à partir
    des deux embeddings.
    """

    return score_semantique(
        vecteur_cv,
        vecteur_offre
    )