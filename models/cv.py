from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base

if TYPE_CHECKING:
    from .candidat import Candidat
    from .competence import Competence
    from .experience import Experience
    from .formation import Formation
    from .embedding import Embedding


class CV(Base):
    __tablename__ = "cv"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidat_id: Mapped[int] = mapped_column(
        ForeignKey("candidat.id", ondelete="CASCADE"), nullable=False
    )
    fichier_url: Mapped[str] = mapped_column(String(500), nullable=False)
    date_depot: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    texte_brut: Mapped[Optional[str]] = mapped_column(Text)

    candidat: Mapped["Candidat"] = relationship(back_populates="cvs")
    competences: Mapped[List["Competence"]] = relationship(
        back_populates="cv", cascade="all, delete-orphan"
    )
    experiences: Mapped[List["Experience"]] = relationship(
        back_populates="cv", cascade="all, delete-orphan"
    )
    formations: Mapped[List["Formation"]] = relationship(
        back_populates="cv", cascade="all, delete-orphan"
    )
    embedding: Mapped[Optional["Embedding"]] = relationship(
        back_populates="cv", uselist=False, cascade="all, delete-orphan"
    )

    def extraire_entites(self) -> dict:
        raise NotImplementedError

    def generer_embedding(self) -> "Embedding":
        raise NotImplementedError
