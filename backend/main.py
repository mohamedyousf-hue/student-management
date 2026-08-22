from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

import models
from database import engine, get_db

# Create the students table if it doesn't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Management System API")

# Allow the frontend (served from a different origin, e.g. file:// or Live Server)
# to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # keep this loose for local dev; tighten later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Student Management System API is running"}


@app.get("/students", response_model=List[models.StudentOut])
def get_students(search: Optional[str] = None, db: Session = Depends(get_db)):
    """List all students, optionally filtered by name or department."""
    query = db.query(models.Student)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.Student.name.ilike(like)) | (models.Student.department.ilike(like))
        )
    return query.all()


@app.get("/students/stats")
def get_stats(db: Session = Depends(get_db)):
    """Dashboard numbers: total, active, and per-department counts."""
    total = db.query(models.Student).count()
    active = db.query(models.Student).filter(models.Student.active == True).count()  # noqa: E712
    by_department = (
        db.query(models.Student.department, func.count(models.Student.id))
        .group_by(models.Student.department)
        .all()
    )
    return {
        "total": total,
        "active": active,
        "departments": {dept: count for dept, count in by_department},
    }


@app.get("/students/{student_id}", response_model=models.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/students", response_model=models.StudentOut, status_code=201)
def create_student(student: models.StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Student).filter(models.Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A student with this email already exists")

    new_student = models.Student(**student.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


@app.put("/students/{student_id}", response_model=models.StudentOut)
def update_student(student_id: int, updated: models.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, value in updated.model_dump().items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return None
