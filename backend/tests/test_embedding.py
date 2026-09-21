from services.embedding_service import (
    generer_embedding,
    similarite_cosinus,
    score_matching_pourcentage,
)


texte_cv = """
Développeur Backend avec expérience en Python, FastAPI,
PostgreSQL, SQLAlchemy et développement d'API REST.
Expérience avec Docker et Git.
"""

# texte_cv= """Développement d'API backend avec Python et FastAPI."""

# texte_offre="""Recherche ingénieur spécialisé dans le développement
# de services web Python."""
texte_offre = """
Nous recherchons un développeur Backend Python.
Le candidat doit maîtriser FastAPI, PostgreSQL,
SQLAlchemy et les API REST.
Une connaissance de Docker et Git est souhaitée.
"""

#offre diff : 
# texte_offre = """
# Nous recherchons un graphiste spécialisé en design
# UI/UX, Photoshop, Illustrator et création de logos.
# """

# texte_offre = """
# Nous recherchons un graphiste spécialisé en UI/UX,
# Photoshop, Illustrator et création de logos.
# """

print("===== GENERATION EMBEDDING CV =====")

embedding_cv = generer_embedding(texte_cv)

print("Dimension :", len(embedding_cv))
print("Premiers éléments :", embedding_cv[:5])


print("\n===== GENERATION EMBEDDING OFFRE =====")

embedding_offre = generer_embedding(texte_offre)

print("Dimension :", len(embedding_offre))
print("Premiers éléments :", embedding_offre[:5])


print("\n===== SIMILARITE =====")

similarite = similarite_cosinus(
    embedding_cv,
    embedding_offre
)

print("Similarité cosinus :", similarite)


print("\n===== SCORE MATCHING =====")

score = score_matching_pourcentage(
    embedding_cv,
    embedding_offre
)

print("Score :", score, "%")