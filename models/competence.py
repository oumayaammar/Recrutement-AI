from __future__ import annotations

from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base

if TYPE_CHECKING:
    from .cv import CV


class Competence(Base):
    __tablename__ = "competence"

    id: Mapped[int] = mapped_column(primary_key=True)
    cv_id: Mapped[int] = mapped_column(
        ForeignKey("cv.id", ondelete="CASCADE"), nullable=False
    )
    nom: Mapped[str] = mapped_column(String(150), nullable=False)
    niveau: Mapped[Optional[str]] = mapped_column(String(50))

    cv: Mapped["CV"] = relationship(back_populates="competences")
