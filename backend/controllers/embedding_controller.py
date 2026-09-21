from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import models
from services import embedding_service



def _texte_cv_pour_embedding(cv: models.CV) -> str:
    """Concatene texte brut + entites extraites pour un embedding plus riche que le texte seul."""
    morceaux = [cv.texte_brut or ""]
    morceaux += [c.nom for c in cv.competences if c.nom]
    morceaux += [f"{e.poste} {e.entreprise}".strip() for e in cv.experiences]
    morceaux += [f"{f.diplome} {f.etablissement}".strip() for f in cv.formations]
    return " ".join(m for m in morceaux if m).strip()


def generer_embedding_cv(db: Session, cv_id: int) -> models.Embedding:
    cv = db.get(models.CV, cv_id)
    if not cv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "CV introuvable.")

    texte = _texte_cv_pour_embedding(cv)
    if not texte:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Aucun contenu disponible pour generer l'embedding (texte_brut vide).",
        )

    vecteur = embedding_service.generer_embedding(texte)

    embedding = cv.embedding
    if embedding:
        embedding.vecteur = vecteur
    else:
        embedding = models.Embedding(cv_id=cv_id, vecteur=vecteur)
        db.add(embedding)

    db.commit()
    db.refresh(embedding)
    return embedding


def generer_embedding_offre(db: Session, offre_id: int) -> models.Embedding:
    offre = db.get(models.Offre, offre_id)
    if not offre:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offre introuvable.")

    texte = f"{offre.titre} {offre.description or ''}".strip()
    vecteur = embedding_service.generer_embedding(texte)

    embedding = offre.embedding
    if embedding:
        embedding.vecteur = vecteur
    else:
        embedding = models.Embedding(offre_id=offre_id, vecteur=vecteur)
        db.add(embedding)

    db.commit()
    db.refresh(embedding)
    return embedding