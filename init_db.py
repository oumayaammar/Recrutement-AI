"""
Script a executer une seule fois pour creer toutes les tables dans PostgreSQL.
A placer a la racine de recrutment_IA/, a cote de db.py.
Usage: python init_db.py
"""

# IMPORTANT: importer le package models AVANT create_tables()
# pour que tous les modeles (Utilisateur, CV, Offre, ...) soient
# enregistres dans Base.metadata.
import models  # noqa: F401  (declenche l'enregistrement des tables)

from db import create_tables


if __name__ == "__main__":
    print("Creation des tables dans PostgreSQL...")
    create_tables()
    print("Tables creees avec succes.")