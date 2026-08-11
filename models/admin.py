from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .user import Utilisateur
from .Enums import RoleUtilisateur


class Administrateur(Utilisateur):
    __tablename__ = "administrateur"

    id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id", ondelete="CASCADE"), primary_key=True
    )

    __mapper_args__ = {
        "polymorphic_identity": RoleUtilisateur.ADMINISTRATEUR,
    }

    def gerer_comptes(self) -> None:
        raise NotImplementedError

    def configurer_plateforme(self) -> None:
        raise NotImplementedError
