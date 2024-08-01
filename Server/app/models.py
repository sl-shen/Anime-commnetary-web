from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    media = relationship("UserMedia", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class UserMedia(Base):
    __tablename__ = "user_media"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bangumi_id = Column(Integer, index=True)
    title = Column(String, index=True)
    media_type = Column(Integer)  # 1=book, 2=anime, 3=music, 4=game, 6=real
    image = Column(String)
    summary = Column(String)

    user = relationship("User", back_populates="media")
    reviews = relationship("Review", back_populates="media")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    rating = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    media_id = Column(Integer, ForeignKey("user_media.id"))

    user = relationship("User", back_populates="reviews")
    media = relationship("UserMedia", back_populates="reviews")