from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from services import extraction_service


def creer_cv(db: Session, cv_in: schemas.CVCreate) -> models.CV:
    candidat = db.get(models.Candidat, cv_in.candidat_id)
    if not candidat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidat introuvable.")

    cv = models.CV(
        candidat_id=cv_in.candidat_id,
        fichier_url=cv_in.fichier_url,
        texte_brut=cv_in.texte_brut,
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


def obtenir_cv(db: Session, cv_id: int) -> models.CV:
    cv = db.get(models.CV, cv_id)
    if not cv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "CV introuvable.")
    return cv


def lister_cvs_par_candidat(db: Session, candidat_id: int) -> List[models.CV]:
    return list(
        db.execute(
            select(models.CV).where(models.CV.candidat_id == candidat_id)
        ).scalars().all()
    )


def mettre_a_jour_cv(db: Session, cv_id: int, cv_in: schemas.CVUpdate) -> models.CV:
    cv = obtenir_cv(db, cv_id)
    for champ, valeur in cv_in.model_dump(exclude_unset=True).items():
        setattr(cv, champ, valeur)
    db.commit()
    db.refresh(cv)
    return cv


def supprimer_cv(db: Session, cv_id: int) -> None:
    cv = obtenir_cv(db, cv_id)
    db.delete(cv)
    db.commit()


def extraire_texte_depuis_fichier(db: Session, cv_id: int, chemin_fichier: str) -> models.CV:
    """Extrait le texte brut d'un fichier PDF/DOCX local et le sauvegarde sur le CV."""
    cv = obtenir_cv(db, cv_id)
    cv.texte_brut = extraction_service.extraire_texte_fichier(chemin_fichier)
    db.commit()
    db.refresh(cv)
    return cv


def extraire_cv(db: Session, cv_id: int) -> models.CV:
    """
    Lance l'extraction d'entites (competences/experiences/formations) a partir
    du texte brut deja stocke sur le CV, via l'API Claude, et cree
    automatiquement les enregistrements correspondants.
    """
    cv = obtenir_cv(db, cv_id)

    if not cv.texte_brut:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Aucun texte brut disponible pour ce CV. "
            "Extrait d'abord le texte du fichier (extraire_texte_depuis_fichier).",
        )

    donnees = extraction_service.extraire_entites_llm(cv.texte_brut)

    for comp in donnees.get("competences") or []:
        db.add(
            models.Competence(
                cv_id=cv.id,
                nom=comp.get("nom"),
                niveau=comp.get("niveau"),
            )
        )

    for exp in donnees.get("experiences") or []:
        db.add(
            models.Experience(
                cv_id=cv.id,
                poste=exp.get("poste"),
                entreprise=exp.get("entreprise"),
                date_debut=extraction_service.parser_date(exp.get("date_debut")),
                date_fin=extraction_service.parser_date(exp.get("date_fin")),
            )
        )

    for form in donnees.get("formations") or []:
        db.add(
            models.Formation(
                cv_id=cv.id,
                diplome=form.get("diplome"),
                etablissement=form.get("etablissement"),
                annee=form.get("annee"),
            )
        )

    db.commit()
    db.refresh(cv)
    return cv