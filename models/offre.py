from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base
from .Enums import StatutOffre

if TYPE_CHECKING:
    from .recruteur import Recruteur
    from .candidature import Candidature
    from .embedding import Embedding
    from .cv import CV


class Offre(Base):
    __tablename__ = "offre"

    id: Mapped[int] = mapped_column(primary_key=True)
    recruteur_id: Mapped[int] = mapped_column(
        ForeignKey("recruteur.id", ondelete="CASCADE"), nullable=False
    )
    titre: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    date_publication: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    statut: Mapped[StatutOffre] = mapped_column(
        SAEnum(StatutOffre, name="statut_offre"),
        default=StatutOffre.BROUILLON,
        nullable=False,
    )

    recruteur: Mapped["Recruteur"] = relationship(back_populates="offres")
    candidatures: Mapped[List["Candidature"]] = relationship(
        back_populates="offre", cascade="all, delete-orphan"
    )
    embedding: Mapped[Optional["Embedding"]] = relationship(
        back_populates="offre", uselist=False, cascade="all, delete-orphan"
    )

    def generer_embedding(self) -> "Embedding":
        raise NotImplementedError

    def matcher_cvtheque(self) -> List["CV"]:
        raise NotImplementedError
