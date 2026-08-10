from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base


SQLALCHEMY_DATABASE_URL = "postgresql://app_user:password@localhost:5432/recrutement_ia"

engine = create_engine(SQLALCHEMY_DATABASE_URL) 

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
def create_tables():
    Base.metadata.create_all(bind=engine)