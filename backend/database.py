from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file will be created next to this file, called students.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./students.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed only for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request, then closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
