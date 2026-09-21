from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import Utilisateur
from .Enums import RoleUtilisateur

if TYPE_CHECKING:
    from .offre import Offre
    from .cv import CV
    from .candidature import Candidature


class Recruteur(Utilisateur):
    __tablename__ = "recruteur"

    id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id", ondelete="CASCADE"), primary_key=True
    )
    poste: Mapped[Optional[str]] = mapped_column(String(150))
    departement: Mapped[Optional[str]] = mapped_column(String(150))

    offres: Mapped[List["Offre"]] = relationship(
        back_populates="recruteur", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_identity": RoleUtilisateur.RECRUTEUR,
    }

    def publier_offre(self, offre: "Offre") -> None:
        raise NotImplementedError

    def parser_cv(self, cv: "CV") -> None:
        raise NotImplementedError

    def calculer_matching(self, cv: "CV", offre: "Offre") -> float:
        raise NotImplementedError

    def rechercher_candidats(self, requete: str) -> List["CV"]:
        raise NotImplementedError

    def gerer_pipeline(self, candidature: "Candidature") -> None:
        raise NotImplementedError
