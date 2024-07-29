from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()

@router.post("/add/{media_id}", response_model=schemas.Review)
def create_review_for_media(
    media_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_review(db=db, user_id=current_user.id, media_id=media_id, review=review)

@router.put("/update/{review_id}", response_model=schemas.Review)
def update_review(
    review_id: int,
    review: schemas.ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.update_review(db=db, review_id=review_id, user_id=current_user.id, review=review)

@router.delete("/delete/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.delete_review(db=db, review_id=review_id, user_id=current_user.id)

@router.get("/media/{media_id}", response_model=list[schemas.Review])
def read_media_reviews(
    media_id: int,
    db: Session = Depends(get_db)
):
    reviews = crud.get_media_reviews(db, media_id=media_id)
    return reviews

@router.get("/users/me", response_model=list[schemas.Review])
def read_user_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reviews = crud.get_user_reviews(db, user_id=current_user.id, skip=skip, limit=limit)
    return reviews