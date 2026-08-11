from __future__ import annotations

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, DateTime, Float, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base
from .Enums import StatutCandidature

if TYPE_CHECKING:
    from .candidat import Candidat
    from .offre import Offre


class Candidature(Base):
    __tablename__ = "candidature"
    __table_args__ = (
        UniqueConstraint("candidat_id", "offre_id", name="uq_candidat_offre"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    candidat_id: Mapped[int] = mapped_column(
        ForeignKey("candidat.id", ondelete="CASCADE"), nullable=False
    )
    offre_id: Mapped[int] = mapped_column(
        ForeignKey("offre.id", ondelete="CASCADE"), nullable=False
    )
    date_candidature: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    statut: Mapped[StatutCandidature] = mapped_column(
        SAEnum(StatutCandidature, name="statut_candidature"),
        default=StatutCandidature.SUGGEREE,
        nullable=False,
    )
    score_matching: Mapped[Optional[float]] = mapped_column(Float)

    candidat: Mapped["Candidat"] = relationship(back_populates="candidatures")
    offre: Mapped["Offre"] = relationship(back_populates="candidatures")

    def mettre_a_jour_statut(self, statut: StatutCandidature) -> None:
        raise NotImplementedError

    def notifier_recruteur(self) -> None:
        raise NotImplementedError

    def notifier_candidat(self) -> None:
        raise NotImplementedError
