from __future__ import annotations

from datetime import datetime
from typing import List, TYPE_CHECKING

from sqlalchemy import String, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base
from .Enums import RoleUtilisateur

if TYPE_CHECKING:
    from .notification import Notification


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    mot_de_passe: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleUtilisateur] = mapped_column(
        SAEnum(RoleUtilisateur, name="role_utilisateur"), nullable=False
    )
    date_creation: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    notifications: Mapped[List["Notification"]] = relationship(
        back_populates="utilisateur", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_on": role,
        "polymorphic_identity": None,
    }

    def se_connecter(self, email: str, mot_de_passe: str) -> bool:
        raise NotImplementedError

    def se_deconnecter(self) -> None:
        raise NotImplementedError

    def modifier_profil(self, **champs) -> None:
        raise NotImplementedError

    def reinitialiser_mot_de_passe(self, nouveau_mot_de_passe: str) -> None:
        raise NotImplementedError
