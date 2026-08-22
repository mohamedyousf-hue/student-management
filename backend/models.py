from sqlalchemy import Column, Integer, String, Boolean
from pydantic import BaseModel, ConfigDict
from database import Base


# ---------- Database table ----------

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    active = Column(Boolean, default=True)


# ---------- Pydantic schemas (request/response shapes) ----------

class StudentBase(BaseModel):
    name: str
    age: int
    department: str
    email: str
    active: bool = True


class StudentCreate(StudentBase):
    """Shape expected when creating a student (POST)."""
    pass


class StudentUpdate(StudentBase):
    """Shape expected when editing a student (PUT)."""
    pass


class StudentOut(StudentBase):
    """Shape returned to the frontend, includes the DB id."""
    id: int

    model_config = ConfigDict(from_attributes=True)
