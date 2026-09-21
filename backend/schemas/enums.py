import enum


class RoleUtilisateur(str, enum.Enum):
    ADMINISTRATEUR = "ADMINISTRATEUR"
    RECRUTEUR = "RECRUTEUR"
    CANDIDAT = "CANDIDAT"


class StatutOffre(str, enum.Enum):
    BROUILLON = "BROUILLON"
    PUBLIEE = "PUBLIEE"
    CLOTUREE = "CLOTUREE"
    ARCHIVEE = "ARCHIVEE"


class StatutCandidature(str, enum.Enum):
    SUGGEREE = "SUGGEREE"
    RECUE = "RECUE"
    PRESELECTIONNEE = "PRESELECTIONNEE"
    ENTRETIEN = "ENTRETIEN"
    ACCEPTEE = "ACCEPTEE"
    REFUSEE = "REFUSEE"
