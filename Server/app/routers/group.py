from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas
from ..database import get_db
from ..auth import get_current_user
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("/create", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_group(db=db, group=group, user_id=current_user.id)

@router.get("/get", response_model=List[schemas.Group])
def get_user_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    groups = crud.get_user_groups(db=db, user_id=current_user.id)
    return [
        schemas.Group(
            id=group.id,
            name=group.name,
            description=group.description,
            owner_id=group.owner_id,
            created_at=group.created_at,
            owner_name=group.owner.username if group.owner else None
        ) for group in groups
    ]

@router.post("/{group_id}/invite", response_model=schemas.Group)
def invite_user_to_group(
    group_id: int, 
    user_invite: schemas.UserInvite,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.username == user_invite.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    group_data = crud.invite_user_to_group(db=db, group_id=group_id, user_id=user.id, inviter_id=current_user.id)
    return schemas.Group(**group_data)

@router.delete("/{group_id}/members/{member_id}", response_model=schemas.Group)
def remove_group_member(
    group_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if current_user.id != group.owner_id:
        raise HTTPException(status_code=403, detail="Only the group owner can remove members")
    updated_group = crud.remove_group_member(db, group_id, member_id)
    return schemas.Group(**updated_group)


@router.post("/{group_id}/media", response_model=schemas.GroupMedia)
def add_media_to_group(group_id: int, media: schemas.GroupMediaCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.add_media_to_group(db=db, group_id=group_id, media=media, user_id=current_user.id)

@router.post("/{group_id}/media/{media_id}/review", response_model=schemas.GroupReview)
def add_review_to_group_media(
    group_id: int, 
    media_id: int, 
    review: schemas.GroupReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    db_review = crud.add_review_to_group_media(
        db=db, 
        group_id=group_id, 
        media_id=media_id, 
        review=review, 
        user_id=current_user.id,
        username=current_user.username
    )
    return schemas.GroupReview.from_orm(db_review)

@router.post("/{group_id}/media/{media_id}/discussion", response_model=schemas.Discussion)
def create_discussion(group_id: int, media_id: int, discussion: schemas.DiscussionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_discussion(db=db, group_id=group_id, media_id=media_id, discussion=discussion, user_id=current_user.id)

@router.post("/discussion/{discussion_id}/comment", response_model=schemas.Comment)
def add_comment_to_discussion(discussion_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.add_comment_to_discussion(db=db, discussion_id=discussion_id, comment=comment, user_id=current_user.id)

@router.post("/{group_id}/sync", response_model=List[schemas.GroupMedia])
def sync_media_to_group(group_id: int, media_ids: List[int], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.sync_media_to_group(db=db, group_id=group_id, media_ids=media_ids, user_id=current_user.id)

@router.get("/{group_id}", response_model=schemas.Group)
def get_group(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if current_user.id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    group_data = {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "created_at": group.created_at,
        "owner_id": group.owner_id,
        "owner_name": group.owner.username 
    }
    return schemas.Group(**group_data)

@router.get("/{group_id}/media", response_model=List[schemas.GroupMedia])
def get_group_media(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if current_user.id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return group.media

@router.get("/{group_id}/media/{media_id}/reviews", response_model=List[schemas.GroupReview])
def get_group_media_reviews(
    group_id: int, 
    media_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    reviews = crud.get_group_media_reviews(db, group_id, media_id)
    return [schemas.GroupReview.model_validate(jsonable_encoder(review)) for review in reviews]

@router.get("/{group_id}/media/{media_id}/discussions", response_model=List[schemas.Discussion])
def get_group_media_discussions(group_id: int, media_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    discussions = crud.get_group_media_discussions(db, group_id, media_id)
    if not discussions:
        raise HTTPException(status_code=404, detail="Media or discussions not found")
    group = crud.get_group(db, group_id)
    if current_user.id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return discussions

@router.get("/{group_id}/members", response_model=List[schemas.User])
def get_group_members(
    group_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if current_user.id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    members = [member for member in group.members if member.id != group.owner_id]
    return members

@router.delete("/{group_id}", response_model=schemas.Message)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the group owner can delete the group")
    
    crud.delete_group(db, group_id, current_user.id)
    return {"message": "Group deleted successfully"}

@router.get("/{group_id}/media/{media_id}", response_model=schemas.GroupMedia)
def get_group_media_detail(
    group_id: int, 
    media_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    media = crud.get_group_media_detail(db, group_id, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    group = crud.get_group(db, group_id)
    if current_user.id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return media

@router.put("/{group_id}/reviews/update/{review_id}", response_model=schemas.GroupReview)
def update_group_review(
    group_id: int, 
    review_id: int, 
    review: schemas.GroupReviewUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    updated_review = crud.update_group_review(db, group_id, review_id, review, current_user.id)
    if not updated_review:
        raise HTTPException(status_code=404, detail="Review not found or you're not authorized to update it")
    return updated_review

@router.delete("/{group_id}/reviews/{review_id}", response_model=schemas.Message)
def delete_group_review(
    group_id: int, 
    review_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = crud.delete_group_review(db, group_id, review_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Review not found or you're not authorized to delete it")
    return {"message": "Review deleted successfully"}

@router.delete("/{group_id}/media/{media_id}", response_model=schemas.Message)
def delete_group_media(
    group_id: int, 
    media_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = crud.delete_group_media(db, group_id, media_id, current_user.id)
    if result["status"] == "error":
        raise HTTPException(status_code=403, detail=result["message"])
    return {"message": result["message"]}

@router.post("/{group_id}/media/{media_id}/discussions/", response_model=schemas.Discussion)
def create_discussion(
    group_id: int,
    media_id: int,
    discussion: schemas.DiscussionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    discussion_data = crud.create_discussion(db=db, discussion=discussion, user_id=current_user.id, group_id=group_id, media_id=media_id)
    return schemas.Discussion(**discussion_data)

@router.get("/{group_id}/media/{media_id}/discussions/", response_model=List[schemas.Discussion])
def read_discussions(
    group_id: int,
    media_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    discussions = crud.get_discussions(db, group_id=group_id, media_id=media_id, skip=skip, limit=limit)
    discussions_data =[ {
            "id": discussion.id,
            "title": discussion.title,
            "content": discussion.content,
            "created_at": discussion.created_at,
            "user_id": discussion.user_id,
            "group_id": discussion.group_id,
            "media_id": discussion.media_id,
            "username": discussion.user.username if discussion.user else None
        } for discussion in discussions
    ]
    return discussions_data