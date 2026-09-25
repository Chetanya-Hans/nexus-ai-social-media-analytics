from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(50))
    username: Mapped[str] = mapped_column(String(100))
    display_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(150), nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    followers_count: Mapped[int] = mapped_column(Integer, default=0)
    following_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    text: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime)

    likes: Mapped[int] = mapped_column(Integer, default=0)
    shares: Mapped[int] = mapped_column(Integer, default=0)
    replies: Mapped[int] = mapped_column(Integer, default=0)


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    source_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    target_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id"),
        nullable=True
    )

    interaction_type: Mapped[str] = mapped_column(String(50))

    timestamp: Mapped[datetime] = mapped_column(DateTime)


class Sentiment(Base):
    __tablename__ = "sentiments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id")
    )

    sentiment: Mapped[str] = mapped_column(
        String(20)
    )

    emotion: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id")
    )

    topic: Mapped[str] = mapped_column(
        String(100)
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class Trend(Base):
    __tablename__ = "trends"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    topic: Mapped[str] = mapped_column(
        String(100)
    )

    date: Mapped[str] = mapped_column(
        String(20)
    )

    current_count: Mapped[int] = mapped_column(
        default=0
    )

    previous_count: Mapped[int] = mapped_column(
        default=0
    )

    growth_rate: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    trend_status: Mapped[str] = mapped_column(
        String(20)
    )

    trend_score: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class NetworkMetric(Base):
    __tablename__ = "network_metrics"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    degree_centrality: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    influence_score: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class DemographicProfile(Base):
    __tablename__ = "demographic_profiles"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    interest: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    alert_type: Mapped[str] = mapped_column(
        String(50)
    )

    title: Mapped[str] = mapped_column(
        String(200)
    )

    message: Mapped[str] = mapped_column(
        Text
    )

    severity: Mapped[str] = mapped_column(
        String(20)
    )

    topic: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )