from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, DateTime, Float, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base

if TYPE_CHECKING:
    from .cv import CV
    from .offre import Offre


class Embedding(Base):
    __tablename__ = "embedding"
    __table_args__ = (
        CheckConstraint(
            "(cv_id IS NOT NULL AND offre_id IS NULL) "
            "OR (cv_id IS NULL AND offre_id IS NOT NULL)",
            name="chk_embedding_source",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cv_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("cv.id", ondelete="CASCADE"), unique=True
    )
    offre_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("offre.id", ondelete="CASCADE"), unique=True
    )
    vecteur: Mapped[List[float]] = mapped_column(ARRAY(Float), nullable=False)
    date_generation: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    cv: Mapped[Optional["CV"]] = relationship(back_populates="embedding")
    offre: Mapped[Optional["Offre"]] = relationship(back_populates="embedding")
