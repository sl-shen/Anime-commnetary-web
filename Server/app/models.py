from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.ext.hybrid import hybrid_property

group_members = Table('group_members', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="owned_groups")
    members = relationship("User", secondary=group_members, back_populates="groups")
    media = relationship("GroupMedia", back_populates="group")
    discussions = relationship("Discussion", back_populates="group")

    @hybrid_property
    def owner_name(self):
        return self.owner.username if self.owner else None

class GroupMedia(Base):
    __tablename__ = "group_media"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    image = Column(String)
    summary = Column(String)
    bangumi_id = Column(Integer, index=True, nullable=True)
    media_type = Column(Integer)
    group_id = Column(Integer, ForeignKey("groups.id"))
    added_by_id = Column(Integer, ForeignKey("users.id"))

    group = relationship("Group", back_populates="media")
    added_by = relationship("User")
    reviews = relationship("GroupReview", back_populates="media")

class GroupReview(Base):
    __tablename__ = "group_reviews"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    rating = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    media_id = Column(Integer, ForeignKey("group_media.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    username = Column(String)

    user = relationship("User", back_populates="group_reviews")
    media = relationship("GroupMedia", back_populates="reviews")

class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    media_id = Column(Integer, ForeignKey("group_media.id"))

    user = relationship("User", back_populates="discussions")
    group = relationship("Group", back_populates="discussions")
    media = relationship("GroupMedia")
    comments = relationship("Comment", back_populates="discussion")

    @hybrid_property
    def username(self):
        return self.user.username if self.user else None

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    discussion_id = Column(Integer, ForeignKey("discussions.id"))

    user = relationship("User", back_populates="comments")
    discussion = relationship("Discussion", back_populates="comments")

    @hybrid_property
    def username(self):
        return self.user.username if self.user else None

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    media = relationship("UserMedia", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    owned_groups = relationship("Group", back_populates="owner")
    groups = relationship("Group", secondary=group_members, back_populates="members")
    group_reviews = relationship("GroupReview", back_populates="user")
    discussions = relationship("Discussion", back_populates="user")
    comments = relationship("Comment", back_populates="user")

class UserMedia(Base):
    __tablename__ = "user_media"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bangumi_id = Column(Integer, index=True, nullable=True)
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    media = relationship("UserMedia", back_populates="reviews")

