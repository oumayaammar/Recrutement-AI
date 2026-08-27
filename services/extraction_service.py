
from __future__ import annotations

import json
import os
from datetime import date, datetime
from typing import Optional

import pdfplumber
from docx import Document
from groq import Groq

from dotenv import load_dotenv

load_dotenv()

GROQ_MODEL = "qwen/qwen3.6-27b"

_client: Optional[Groq] = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY manquante. Cree une cle gratuite sur "
                "console.groq.com puis mets-la dans tes variables d'environnement."
            )
        _client = Groq(api_key=api_key)
    return _client


# ---------------------------------------------------------------------------
# Extraction du texte brut (sans OCR)
# ---------------------------------------------------------------------------

def extraire_texte_pdf(chemin_fichier: str) -> str:
    morceaux = []
    with pdfplumber.open(chemin_fichier) as pdf:
        for page in pdf.pages:
            contenu = page.extract_text()
            if contenu:
                morceaux.append(contenu)
    return "\n".join(morceaux)


def extraire_texte_docx(chemin_fichier: str) -> str:
    document = Document(chemin_fichier)
    return "\n".join(p.text for p in document.paragraphs if p.text.strip())


def extraire_texte_fichier(chemin_fichier: str) -> str:
    extension = chemin_fichier.lower().rsplit(".", 1)[-1]
    if extension == "pdf":
        return extraire_texte_pdf(chemin_fichier)
    if extension in ("docx", "doc"):
        return extraire_texte_docx(chemin_fichier)
    raise ValueError(
        f"Format non supporte: .{extension}. "
        "Seuls .pdf et .docx sont geres (documents numeriques, pas de scan)."
    )


# ---------------------------------------------------------------------------
# Extraction d'entites structurees via Groq (LLM gratuit)
# ---------------------------------------------------------------------------

PROMPT_EXTRACTION = """Tu es un extracteur d'informations de CV. A partir du texte de CV \
ci-dessous, extrait les competences, experiences professionnelles et formations.

Reponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou apres, \
sans balises markdown, exactement dans ce format:

{{
  "competences": [{{"nom": "string", "niveau": "Debutant|Intermediaire|Avance|Expert"}}],
  "experiences": [{{"poste": "string", "entreprise": "string", "date_debut": "YYYY-MM-DD ou null", "date_fin": "YYYY-MM-DD ou null"}}],
  "formations": [{{"diplome": "string", "etablissement": "string", "annee": entier ou null}}]
}}

Si une information est absente ou incertaine, mets null. N'invente rien.

Texte du CV:
{texte_cv}
"""


def _nettoyer_reponse_json(texte: str) -> str:
    texte = texte.strip()
    if texte.startswith("```"):
        texte = texte.strip("`")
        if texte.lower().startswith("json"):
            texte = texte[4:]
    return texte.strip()


def extraire_entites_llm(texte_cv: str) -> dict:
    client = _get_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": PROMPT_EXTRACTION.format(texte_cv=texte_cv)}],
        temperature=0.2,
        response_format={"type": "json_object"},  # force une sortie JSON valide
        reasoning_effort="none",  # Qwen3: desactive le mode "thinking", inutile ici
    )
    contenu = completion.choices[0].message.content
    if contenu is None:
        raise ValueError(
            "Le modèle Groq n'a retourné aucun contenu."
        )
    contenu = _nettoyer_reponse_json(contenu)

    try: 
        return json.loads(contenu)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Reponse LLM non-JSON: {contenu[:300]}") from exc


def parser_date(valeur: Optional[str]) -> Optional[date]:
    """Convertit une date 'YYYY-MM-DD' (ou None) en objet date, sans planter."""
    if not valeur:
        return None
    try:
        return datetime.strptime(valeur, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None