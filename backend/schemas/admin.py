from pydantic import ConfigDict

from .user import UtilisateurBase, UtilisateurCreate, UtilisateurRead


class AdministrateurBase(UtilisateurBase):
    pass


class AdministrateurCreate(UtilisateurCreate):
    pass


class AdministrateurRead(UtilisateurRead):
    model_config = ConfigDict(from_attributes=True)
