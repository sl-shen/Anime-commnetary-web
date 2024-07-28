from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_user_media(db: Session, user_id: int, media: schemas.UserMediaCreate):
    db_media = models.UserMedia(**media.dict(), user_id=user_id)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def get_user_media(db: Session, user_id: int):
    return db.query(models.UserMedia).filter(models.UserMedia.user_id == user_id).all()

def delete_user_media(db: Session, user_id: int, media_id: int):
    media = db.query(models.UserMedia).filter(models.UserMedia.id == media_id, models.UserMedia.user_id == user_id).first()
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    db.delete(media)
    db.commit()
    return {"message": "Media deleted successfully"}