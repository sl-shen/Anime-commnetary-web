from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    reviews = relationship("Review", back_populates="user")

class Anime(Base):
    __tablename__ = "animes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    
    reviews = relationship("Review", back_populates="anime")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    rating = Column(Float)
    user_id = Column(Integer, ForeignKey("users.id"))
    anime_id = Column(Integer, ForeignKey("animes.id"))

    user = relationship("User", back_populates="reviews")
    anime = relationship("Anime", back_populates="reviews")