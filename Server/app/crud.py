from sqlalchemy.orm import Session, joinedload
from . import models, schemas
from passlib.context import CryptContext
from fastapi import HTTPException, status
from typing import List
from sqlalchemy.exc import IntegrityError

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

def create_manual_user_media(db: Session, user_id: int, media: schemas.ManualMediaCreate):
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
    
    for review in media.reviews:
        db.delete(review)

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

# ------------------------------------------------------------------------------------------------------------

def create_group(db: Session, group: schemas.GroupCreate, user_id: int):
    db_group = models.Group(**group.dict(), owner_id=user_id)
    db_group.members.append(db.query(models.User).get(user_id))
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_group(db: Session, group_id: int):
    return db.query(models.Group).options(
        joinedload(models.Group.members),
        joinedload(models.Group.owner)
    ).filter(models.Group.id == group_id).first()

def get_user_groups(db: Session, user_id: int):
    return db.query(models.Group) \
             .options(joinedload(models.Group.owner)) \
             .filter(models.Group.members.any(id=user_id)) \
             .all()

def invite_user_to_group(db: Session, group_id: int, user_id: int, inviter_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.owner_id != inviter_id:
        raise HTTPException(status_code=403, detail="Only the group owner can invite users")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user in group.members:
        raise HTTPException(status_code=400, detail="User is already a member of this group")
    group.members.append(user)
    db.commit()
    db.refresh(group)
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "created_at": group.created_at,
        "owner_id": group.owner_id,
        "owner_name": group.owner.username,
    }

def remove_group_member(db: Session, group_id: int, member_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    member = db.query(models.User).filter(models.User.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if member not in group.members:
        raise HTTPException(status_code=400, detail="User is not a member of this group")
    
    group.members.remove(member)
    db.commit()
    db.refresh(group)
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "created_at": group.created_at,
        "owner_id": group.owner_id,
        "owner_name": group.owner.username,
    }

def add_media_to_group(db: Session, group_id: int, media: schemas.GroupMediaCreate, user_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if user_id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="User is not a member of this group")
    db_media = models.GroupMedia(**media.dict(), group_id=group_id, added_by_id=user_id)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def create_manual_group_media(db: Session, group_id: int, media: schemas.ManualGroupMediaCreate, user_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if user_id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="User is not a member of this group")
    db_media = models.GroupMedia(**media.dict(), group_id=group_id, added_by_id=user_id)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def add_review_to_group_media(db: Session, group_id: int, media_id: int, review: schemas.GroupReviewCreate, user_id: int, username: str):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if user_id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="User is not a member of this group")
    
    media = db.query(models.GroupMedia).filter(models.GroupMedia.id == media_id, models.GroupMedia.group_id == group_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found in this group")
    
    db_review = models.GroupReview(**review.dict(), user_id=user_id, media_id=media_id, username=username)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review

def sync_media_to_group(db: Session, group_id: int, media_ids: List[int], user_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if user_id not in [member.id for member in group.members]:
        raise HTTPException(status_code=403, detail="User is not a member of this group")
    
    synced_media = []
    for media_id in media_ids:
        user_media = db.query(models.UserMedia).filter(models.UserMedia.id == media_id, models.UserMedia.user_id == user_id).first()
        if user_media:
            group_media = models.GroupMedia(
                title=user_media.title,
                image=user_media.image,
                summary=user_media.summary,
                bangumi_id=user_media.bangumi_id,
                media_type=user_media.media_type,
                group_id=group_id,
                added_by_id=user_id
            )
            db.add(group_media)
            synced_media.append(group_media)
    
    db.commit()
    for media in synced_media:
        db.refresh(media)
    
    return synced_media


def delete_group(db: Session, group_id: int, user_id: int):
    group = db.query(models.Group).options(
        joinedload(models.Group.media),
        joinedload(models.Group.discussions)
    ).filter(models.Group.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the group owner can delete the group")

    try:
        # Delete related reviews
        db.query(models.GroupReview).filter(models.GroupReview.media_id.in_([m.id for m in group.media])).delete(synchronize_session='fetch')

        # Delete related comments
        db.query(models.Comment).filter(models.Comment.discussion_id.in_([d.id for d in group.discussions])).delete(synchronize_session='fetch')

        # Delete related discussions
        db.query(models.Discussion).filter(models.Discussion.group_id == group_id).delete(synchronize_session='fetch')

        # Delete related media
        db.query(models.GroupMedia).filter(models.GroupMedia.group_id == group_id).delete(synchronize_session='fetch')

        # Delete the group
        db.delete(group)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to delete group due to integrity constraints")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while deleting the group")

    return {"status": "success", "message": "Group and related data deleted successfully"}


def get_group_media_detail(db: Session, group_id: int, media_id: int):
    return db.query(models.GroupMedia).filter(models.GroupMedia.id == media_id, models.GroupMedia.group_id == group_id).first()

def update_group_review(db: Session, group_id: int, review_id: int, review: schemas.GroupReviewUpdate, user_id: int):
    db_review = db.query(models.GroupReview).filter(
        models.GroupReview.id == review_id,
        models.GroupReview.user_id == user_id
    ).first()
    if db_review:
        for key, value in review.dict(exclude_unset=True).items():
            setattr(db_review, key, value)
        db.commit()
        db.refresh(db_review)
    return db_review

def delete_group_review(db: Session, group_id: int, review_id: int, user_id: int):
    db_review = db.query(models.GroupReview).filter(
        models.GroupReview.id == review_id,
        models.GroupReview.user_id == user_id
    ).first()
    if db_review:
        db.delete(db_review)
        db.commit()
        return True
    return False

def delete_group_media(db: Session, group_id: int, media_id: int, user_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        return {"status": "error", "message": "Group not found"}
    
    if group.owner_id != user_id:
        return {"status": "error", "message": "Only the group owner can delete media"}
    
    db_media = db.query(models.GroupMedia).filter(
        models.GroupMedia.id == media_id,
        models.GroupMedia.group_id == group_id
    ).first()
    
    if not db_media:
        return {"status": "error", "message": "Media not found"}
    
    # Delete related reviews
    db.query(models.GroupReview).filter(models.GroupReview.media_id == media_id).delete()

    # Delete related discussions and their comments
    discussions = db.query(models.Discussion).filter(models.Discussion.media_id == media_id).all()
    for discussion in discussions:
        db.query(models.Comment).filter(models.Comment.discussion_id == discussion.id).delete()
        db.delete(discussion)

    # Delete the media
    db.delete(db_media)
    db.commit()
    return {"status": "success", "message": "Media and related data deleted successfully"}

def get_group_media_reviews(db: Session, group_id: int, media_id: int, skip: int = 0, limit: int = 100):
    reviews = db.query(models.GroupReview).join(models.GroupMedia)\
                .filter(models.GroupMedia.group_id == group_id, models.GroupReview.media_id == media_id)\
                .offset(skip).limit(limit).all()
    return reviews

#-------------------------------------------------------------------------------------------------------------------------

def create_discussion(db: Session, discussion: schemas.DiscussionCreate, user_id: int, group_id: int, media_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_discussion = models.Discussion(**discussion.dict(), user_id=user_id, group_id=group_id, media_id=media_id)
    db.add(db_discussion)
    db.commit()
    db.refresh(db_discussion)
    
    discussion_data = {
        "id": db_discussion.id,
        "title": db_discussion.title,
        "content": db_discussion.content,
        "created_at": db_discussion.created_at,
        "user_id": db_discussion.user_id,
        "group_id": db_discussion.group_id,
        "media_id": db_discussion.media_id,
        "username": user.username
    }
    return discussion_data

def get_discussions(db: Session, group_id: int, media_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Discussion).filter(models.Discussion.group_id == group_id, models.Discussion.media_id == media_id).offset(skip).limit(limit).all()

def get_discussion(db: Session, discussion_id: int):
    discussion = db.query(models.Discussion).options(
        joinedload(models.Discussion.user),
        joinedload(models.Discussion.comments).joinedload(models.Comment.user)
    ).filter(models.Discussion.id == discussion_id).first()
    
    if discussion:
        return {
            "id": discussion.id,
            "title": discussion.title,
            "content": discussion.content,
            "created_at": discussion.created_at,
            "user_id": discussion.user_id,
            "group_id": discussion.group_id,
            "media_id": discussion.media_id,
            "username": discussion.user.username if discussion.user else None,
            "comments": [
                {
                    "id": comment.id,
                    "content": comment.content,
                    "created_at": comment.created_at,
                    "user_id": comment.user_id,
                    "discussion_id": comment.discussion_id,
                    "username": comment.user.username if comment.user else None
                }
                for comment in discussion.comments
            ]
        }
    return None

def create_comment(db: Session, comment: schemas.CommentCreate, user_id: int, discussion_id: int):
    db_comment = models.Comment(**comment.dict(), user_id=user_id, discussion_id=discussion_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "created_at": db_comment.created_at,
        "user_id": db_comment.user_id,
        "discussion_id": db_comment.discussion_id,
        "username": user.username if user else None
    }

def get_comments(db: Session, discussion_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Comment).filter(models.Comment.discussion_id == discussion_id).offset(skip).limit(limit).all()

def delete_discussion(db: Session, discussion_id: int, current_user_id: int):
    discussion = db.query(models.Discussion).options(joinedload(models.Discussion.comments)).filter(models.Discussion.id == discussion_id).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    if discussion.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this discussion")
    
    # 删除相关的评论
    for comment in discussion.comments:
        db.delete(comment)
    
    db.delete(discussion)
    db.commit()
    
    return {"message": "Discussion and related comments deleted successfully"}