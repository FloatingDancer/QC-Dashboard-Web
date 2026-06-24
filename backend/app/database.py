from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Request
from typing import Optional

SQLALCHEMY_DATABASE_URL = "sqlite:///./qc_dashboard.db"
SQLALCHEMY_GUEST_DATABASE_URL = "sqlite:///./qc_guest.db"

# connect_args={"check_same_thread": False} is required only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

guest_engine = create_engine(
    SQLALCHEMY_GUEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
GuestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=guest_engine)

Base = declarative_base()

def get_main_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db(request: Request):
    session_factory = SessionLocal
    if request:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            temp_db = SessionLocal()
            try:
                from . import models
                session = temp_db.query(models.UserSession).filter(models.UserSession.token == token).first()
                if session:
                    user = temp_db.query(models.User).filter(models.User.id == session.user_id).first()
                    if user and user.username == "guest":
                        session_factory = GuestSessionLocal
            except Exception as e:
                print("Error routing DB:", e)
            finally:
                temp_db.close()
                
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
