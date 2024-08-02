from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.username = user_update.username
        db.commit()
        db.refresh(db_user)
    return db_user

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

#------------------------------------------------------------------------------------------------

def create_user_media(db: Session, user_id: int, media: schemas.UserMediaCreate):
    db_media = models.UserMedia(**media.dict(), user_id=user_id)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def get_user_media(db: Session, user_id: int):
    return db.query(models.UserMedia).filter(models.UserMedia.user_id == user_id).all()

def get_single_media(db: Session, media_id: int):
    return db.query(models.UserMedia).filter(models.UserMedia.id == media_id).all()
    

def delete_user_media(db: Session, user_id: int, media_id: int):
    media = db.query(models.UserMedia).filter(models.UserMedia.id == media_id, models.UserMedia.user_id == user_id).first()
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    db.delete(media)
    db.commit()
    return {"message": "Media deleted successfully"}

#------------------------------------------------------------------------------------------------

def create_review(db: Session, user_id: int, media_id: int, review: schemas.ReviewCreate):
    db_review = models.Review(
        text=review.text,
        rating=review.rating,
        user_id=user_id,
        media_id=media_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def update_review(db: Session, review_id: int, user_id: int, review: schemas.ReviewUpdate):
    db_review = db.query(models.Review).filter(models.Review.id == review_id, models.Review.user_id == user_id).first()
    if db_review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.text is not None:
        db_review.text = review.text
    if review.rating is not None:
        db_review.rating = review.rating
    
    db.commit()
    db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int, user_id: int):
    db_review = db.query(models.Review).filter(models.Review.id == review_id, models.Review.user_id == user_id).first()
    if db_review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return {"message": "Review deleted successfully"}

def get_media_reviews(db: Session, media_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Review).filter(models.Review.media_id == media_id).offset(skip).limit(limit).all()

# 获取用户的所有评论
def get_user_reviews(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Review).filter(models.Review.user_id == user_id).offset(skip).limit(limit).all()