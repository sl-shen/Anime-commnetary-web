from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/getAll", response_model=List[schemas.UserMedia])
async def read_user_media(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_media(db, user_id=current_user.id)


@router.delete("/delete/{media_id}")
async def delete_media(
    media_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = crud.delete_user_media(db, user_id=current_user.id, media_id=media_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"message": "Media deleted successfully"}

@router.get("/get/{media_id}", response_model=list[schemas.UserMedia])
async def get_media(
    media_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_single_media(db, media_id=media_id)
  