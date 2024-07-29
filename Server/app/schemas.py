from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
        
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
    bangumi_id: int
    title: str
    media_type: int
    image: str
    summary: str

class UserMediaCreate(UserMediaBase):
    pass

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

    class Config:
        from_attributes = True