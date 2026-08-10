from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Classe de base déclarative pour tous les modèles JobGate."""
    pass

# utiliser pour créer les tables dans la base de données avec la commande create_all() de SQLAlchemy.