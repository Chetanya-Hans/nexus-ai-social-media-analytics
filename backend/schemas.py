from pydantic import BaseModel

from datetime import datetime

class AIQuery(BaseModel):
    question: str

class UserCreate(BaseModel):
    platform: str
    username: str
    display_name: str | None = None
    bio: str | None = None
    location: str | None = None
    language: str | None = None
    followers_count: int = 0
    following_count: int = 0

class PostCreate(BaseModel):
    platform: str
    user_id: int
    text: str
    timestamp: datetime
    likes: int = 0
    shares: int = 0
    replies: int = 0

class InteractionCreate(BaseModel):
    source_user_id: int
    target_user_id: int
    post_id: int | None = None
    interaction_type: str
    timestamp: datetime