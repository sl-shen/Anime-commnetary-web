from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()

@router.get("/{discussion_id}", response_model=schemas.DiscussionWithComments)
def read_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    discussion = crud.get_discussion(db, discussion_id=discussion_id)
    if discussion is None:
        raise HTTPException(status_code=404, detail="Discussion not found")
    return schemas.DiscussionWithComments(**discussion)

@router.post("/{discussion_id}/comments/", response_model=schemas.Comment)
def create_comment(
    discussion_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment_data = crud.create_comment(db=db, comment=comment, user_id=current_user.id, discussion_id=discussion_id)
    return schemas.Comment(**comment_data)

@router.get("/{discussion_id}/comments/", response_model=List[schemas.Comment])
def read_comments(
    discussion_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comments = crud.get_comments(db, discussion_id=discussion_id, skip=skip, limit=limit)
    return comments@router.get("/{discussion_id}", response_model=schemas.DiscussionWithComments)

@router.delete("/{discussion_id}", response_model=dict)
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = crud.delete_discussion(db, discussion_id, current_user.id)
    return result