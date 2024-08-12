from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from typing import List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: str
        
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPair(Token):
    refresh_token: str

class TokenData(BaseModel):
    username: str | None = None

class BangumiSearchResult(BaseModel):
    id: int
    title: str
    image: str
    summary: str
    type: int

class UserMediaBase(BaseModel):
    bangumi_id: Optional[int] = None
    title: str
    media_type: int
    image: str
    summary: str

class UserMediaCreate(UserMediaBase):
    pass

class ManualMediaCreate(BaseModel):
    title: str
    media_type: int
    image: str = ""
    summary: str = ""
    bangumi_id: Optional[int] = None

class UserMedia(UserMediaBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    text: str
    rating: float = Field(..., ge=0, le=10)

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    text: Optional[str] = None
    rating: Optional[float] = Field(..., ge=0, le=10)

class Review(ReviewBase):
    id: int
    user_id: int
    media_id: int
    created_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class Group(GroupBase):
    id: int
    created_at: datetime
    owner_id: int
    owner_name: str

    class Config:
        orm_mode = True

class GroupMediaBase(BaseModel):
    title: str
    image: Optional[str] = None
    summary: Optional[str] = None
    bangumi_id: Optional[int] = None
    media_type: int

class GroupMediaCreate(BaseModel):
    title: str
    image: str
    summary: str
    bangumi_id: int
    media_type: int

class ManualGroupMediaCreate(BaseModel):
    title: str
    media_type: int
    image: str = ""
    summary: str = ""
    bangumi_id: Optional[int] = None
    
class GroupMedia(GroupMediaBase):
    id: int
    group_id: int
    added_by_id: int

    class Config:
        orm_mode = True

class GroupReviewBase(BaseModel):
    text: str
    rating: int

class GroupReviewCreate(GroupReviewBase):
    pass


class GroupReview(GroupReviewBase):
    id: int
    user_id: int
    username: str
    media_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiscussionBase(BaseModel):
    title: str
    content: str

class DiscussionCreate(DiscussionBase):
    pass

class Discussion(DiscussionBase):
    id: int
    created_at: datetime
    user_id: int
    group_id: int
    media_id: int

    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    discussion_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
        
class UserInvite(BaseModel):
    username: str

class Message(BaseModel):
    message: str

class GroupReviewUpdate(BaseModel):
    text: Optional[str] = None
    rating: Optional[int] = None

class Message(BaseModel):
    message: str


class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    discussion_id: int
    username: str  

    class Config:
        orm_mode = True

class DiscussionBase(BaseModel):
    title: str
    content: str

class DiscussionCreate(DiscussionBase):
    pass

class Discussion(DiscussionBase):
    id: int
    created_at: datetime
    user_id: int
    group_id: int
    media_id: int
    username: str  

    class Config:
        orm_mode = True

class DiscussionWithComments(DiscussionBase):
    id: int
    created_at: datetime
    user_id: int
    group_id: int
    media_id: int
    username: str
    comments: List[Comment]

    model_config = ConfigDict(from_attributes=True)