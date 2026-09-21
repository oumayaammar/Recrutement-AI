from __future__ import annotations

from datetime import date
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .user import Utilisateur
from .Enums import RoleUtilisateur

if TYPE_CHECKING:
    from .cv import CV
    from .offre import Offre
    from .candidature import Candidature


class Candidat(Utilisateur):
    __tablename__ = "candidat"

    id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id", ondelete="CASCADE"), primary_key=True
    )
    telephone: Mapped[Optional[str]] = mapped_column(String(20))
    date_naissance: Mapped[Optional[date]] = mapped_column(Date)
    disponibilite: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cvs: Mapped[List["CV"]] = relationship(
        back_populates="candidat", cascade="all, delete-orphan"
    )
    candidatures: Mapped[List["Candidature"]] = relationship(
        back_populates="candidat", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_identity": RoleUtilisateur.CANDIDAT,
    }

    def deposer_cv(self, fichier) -> "CV":
        raise NotImplementedError

    def consulter_offres(self) -> List["Offre"]:
        raise NotImplementedError

    def postuler_offre(self, offre: "Offre") -> "Candidature":
        raise NotImplementedError
