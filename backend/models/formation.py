from __future__ import annotations

from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base

if TYPE_CHECKING:
    from .cv import CV


class Formation(Base):
    __tablename__ = "formation"

    id: Mapped[int] = mapped_column(primary_key=True)
    cv_id: Mapped[int] = mapped_column(
        ForeignKey("cv.id", ondelete="CASCADE"), nullable=False
    )
    diplome: Mapped[str] = mapped_column(String(150), nullable=False)
    etablissement: Mapped[str] = mapped_column(String(150), nullable=False)
    annee: Mapped[Optional[int]] = mapped_column(Integer)

    cv: Mapped["CV"] = relationship(back_populates="formations")
