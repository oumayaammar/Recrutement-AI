# Réexporte le Base défini dans db.py (racine du projet recrutment_IA)
# pour que tous les modèles et create_tables() partagent le MEME registre.

from db import Base

__all__ = ["Base"]