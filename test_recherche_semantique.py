from services.embedding_service import (
    generer_embedding,
    score_matching_pourcentage,
)

requete = """
Je cherche un développeur backend Python avec FastAPI,
PostgreSQL et expérience dans les API REST.
"""

cv1 = """
Développeur backend Python avec FastAPI, PostgreSQL,
SQLAlchemy et développement d'API REST.
"""

cv2 = """
Développeur frontend spécialisé en React, HTML, CSS
et JavaScript.
"""

cv3 = """
Ingénieur Java spécialisé dans Spring Boot,
microservices et MySQL.
"""

embedding_requete = generer_embedding(requete)

embedding_cv1 = generer_embedding(cv1)
embedding_cv2 = generer_embedding(cv2)
embedding_cv3 = generer_embedding(cv3)

score1 = score_matching_pourcentage(
    embedding_requete,
    embedding_cv1
)

score2 = score_matching_pourcentage(
    embedding_requete,
    embedding_cv2
)

score3 = score_matching_pourcentage(
    embedding_requete,
    embedding_cv3
)

print("CV 1 :", score1, "%")
print("CV 2 :", score2, "%")
print("CV 3 :", score3, "%")