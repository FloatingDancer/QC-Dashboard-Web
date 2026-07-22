import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Request

# Connect to database (either PostgreSQL from env, or fallback to SQLite)
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    # SQLAlchemy requires postgresql:// instead of postgres://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
else:
    # Local SQLite
    if os.environ.get("VERCEL"):
        db_path = "/tmp/qc_dashboard.db"
    else:
        db_path = "./qc_dashboard.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Guest database (isolated local SQLite for security)
if os.environ.get("VERCEL"):
    guest_db_path = "/tmp/qc_guest.db"
else:
    guest_db_path = "./qc_guest.db"
SQLALCHEMY_GUEST_DATABASE_URL = f"sqlite:///{guest_db_path}"

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
