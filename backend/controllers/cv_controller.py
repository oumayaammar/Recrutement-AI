from typing import List
from pathlib import Path
import uuid
from fastapi import HTTPException, status ,UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from services import extraction_service

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def creer_cv(
    db: Session,
    cv_in: schemas.CVCreate
) -> models.CV:
    """Créer un CV pour un candidat."""

    candidat = db.get(models.Candidat, cv_in.candidat_id)

    if not candidat:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Candidat introuvable."
        )

    cv = models.CV(
        candidat_id=cv_in.candidat_id,
        fichier_url=cv_in.fichier_url,
        texte_brut=cv_in.texte_brut,
    )

    db.add(cv)
    db.commit()
    db.refresh(cv)

    return cv

async def upload_cv(
    db: Session,
    file: UploadFile,
    candidat_id: int
) -> models.CV:

    # Vérifier candidat
    candidat = db.get(models.Candidat, candidat_id)

    if not candidat:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Candidat introuvable."
        )

    # Vérifier extension
    if not file.filename:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Nom de fichier invalide."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in [".pdf", ".docx"]:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Format non supporté. Utilisez PDF ou DOCX."
        )

    # Générer nom unique
    filename = f"{uuid.uuid4()}{extension}"

    filepath = UPLOAD_DIR / filename

    # Sauvegarder fichier
    content = await file.read()

    if not content:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Le fichier est vide."
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Fichier trop volumineux. Maximum 10 Mo."
        )

    with open(filepath, "wb") as buffer:
        buffer.write(content)

    # Créer CV
    cv = models.CV(
        candidat_id=candidat_id,
        fichier_url=str(filepath),
        texte_brut=None
    )

    db.add(cv)
    db.commit()
    db.refresh(cv)

    return cv


def obtenir_cv(
    db: Session,
    cv_id: int
) -> models.CV:
    """Récupérer un CV par son identifiant."""

    cv = db.get(models.CV, cv_id)

    if not cv:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "CV introuvable."
        )

    return cv


def lister_cvs_par_candidat(
    db: Session,
    candidat_id: int
) -> List[models.CV]:
    """Lister les CV d'un candidat."""

    return list(
        db.execute(
            select(models.CV).where(
                models.CV.candidat_id == candidat_id
            )
        )
        .scalars()
        .all()
    )


def mettre_a_jour_cv(
    db: Session,
    cv_id: int,
    cv_in: schemas.CVUpdate
) -> models.CV:
    """Modifier les informations d'un CV."""

    cv = obtenir_cv(db, cv_id)

    for champ, valeur in cv_in.model_dump(
        exclude_unset=True
    ).items():
        setattr(cv, champ, valeur)

    db.commit()
    db.refresh(cv)

    return cv


def supprimer_cv(
    db: Session,
    cv_id: int
) -> None:
    """Supprimer un CV."""

    cv = obtenir_cv(db, cv_id)

    db.delete(cv)
    db.commit()


def extraire_texte_depuis_fichier(
    db: Session,
    cv_id: int,
    chemin_fichier: str
) -> models.CV:
    """
    Extraire le texte brut d'un fichier PDF/DOCX
    et le sauvegarder dans le CV.
    """

    cv = obtenir_cv(db, cv_id)

    try:
        texte = extraction_service.extraire_texte_fichier(
            chemin_fichier
        )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Impossible d'extraire le texte du fichier : {exc}",
        )

    if not texte.strip():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Le fichier ne contient aucun texte exploitable.",
        )

    cv.texte_brut = texte

    db.commit()
    db.refresh(cv)

    return cv


def extraire_cv(
    db: Session,
    cv_id: int
) -> models.CV:
    """
    Pipeline complet d'extraction d'un CV :

    1. Récupérer le CV.
    2. Récupérer le chemin du fichier.
    3. Extraire le texte du PDF/DOCX.
    4. Sauvegarder le texte brut.
    5. Envoyer le texte au LLM.
    6. Extraire compétences, expériences et formations.
    7. Sauvegarder les données dans PostgreSQL.
    """

    # ---------------------------------------------------------
    # 1. Récupérer le CV
    # ---------------------------------------------------------

    cv = obtenir_cv(db, cv_id)

    # ---------------------------------------------------------
    # 2. Vérifier le fichier
    # ---------------------------------------------------------

    chemin_fichier = cv.fichier_url

    if not chemin_fichier:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Aucun fichier associé à ce CV.",
        )

    # ---------------------------------------------------------
    # 3. Extraire le texte du PDF/DOCX
    # ---------------------------------------------------------

    try:
        texte = extraction_service.extraire_texte_fichier(
            chemin_fichier
        )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Impossible d'extraire le texte du fichier : {exc}",
        )

    # ---------------------------------------------------------
    # 4. Vérifier le texte
    # ---------------------------------------------------------

    if not texte or not texte.strip():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Le fichier ne contient aucun texte exploitable.",
        )

    # ---------------------------------------------------------
    # 5. Sauvegarder le texte brut
    # ---------------------------------------------------------

    cv.texte_brut = texte

    db.commit()
    db.refresh(cv)

    # ---------------------------------------------------------
    # 6. Envoyer le texte au LLM
    # ---------------------------------------------------------

    try:
        donnees = extraction_service.extraire_entites_llm(
            texte
        )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Erreur lors de l'analyse du CV par le LLM : {exc}",
        )

    # ---------------------------------------------------------
    # 7. Enregistrer les compétences
    # ---------------------------------------------------------

    for comp in donnees.get("competences") or []:

        nom = comp.get("nom")

        if not nom:
            continue

        db.add(
            models.Competence(
                cv_id=cv.id,
                nom=nom,
                niveau=comp.get("niveau"),
            )
        )

    # ---------------------------------------------------------
    # 8. Enregistrer les expériences
    # ---------------------------------------------------------

    for exp in donnees.get("experiences") or []:

        db.add(
            models.Experience(
                cv_id=cv.id,
                poste=exp.get("poste"),
                entreprise=exp.get("entreprise"),
                date_debut=extraction_service.parser_date(
                    exp.get("date_debut")
                ),
                date_fin=extraction_service.parser_date(
                    exp.get("date_fin")
                ),
            )
        )

    # ---------------------------------------------------------
    # 9. Enregistrer les formations
    # ---------------------------------------------------------

    for form in donnees.get("formations") or []:

        db.add(
            models.Formation(
                cv_id=cv.id,
                diplome=form.get("diplome"),
                etablissement=form.get("etablissement"),
                annee=form.get("annee"),
            )
        )

    # ---------------------------------------------------------
    # 10. Sauvegarder toutes les données
    # ---------------------------------------------------------

    db.commit()
    db.refresh(cv)

    return cv