from __future__ import annotations

from datetime import date
from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base

if TYPE_CHECKING:
    from .cv import CV


class Experience(Base):
    __tablename__ = "experience"

    id: Mapped[int] = mapped_column(primary_key=True)
    cv_id: Mapped[int] = mapped_column(
        ForeignKey("cv.id", ondelete="CASCADE"), nullable=False
    )
    poste: Mapped[str] = mapped_column(String(150), nullable=False)
    entreprise: Mapped[str] = mapped_column(String(150), nullable=False)
    date_debut: Mapped[Optional[date]] = mapped_column(Date)
    date_fin: Mapped[Optional[date]] = mapped_column(Date)

    cv: Mapped["CV"] = relationship(back_populates="experiences")
