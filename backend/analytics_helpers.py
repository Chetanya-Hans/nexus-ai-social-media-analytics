"""Computed analytics helpers — richer payloads for the demo dashboard."""

from collections import Counter, defaultdict
from datetime import datetime, timedelta

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from backend.models import (
    Alert,
    DemographicProfile,
    Interaction,
    NetworkMetric,
    Post,
    Sentiment,
    Topic,
    Trend,
    User,
)

COMMUNITIES = {
    "Technology": ("Technology Cluster", 1),
    "Artificial Intelligence": ("Technology Cluster", 1),
    "Cybersecurity": ("Technology Cluster", 1),
    "Education": ("Education & Youth", 2),
    "Business": ("News & Politics", 3),
    "General": ("Entertainment", 4),
}

LOCATIONS = [
    "Delhi NCR", "Mumbai", "Bangalore", "Pune", "Hyderabad",
    "Chennai", "Kolkata", "Jaipur", "Chandigarh", "Ahmedabad",
]
LANGUAGES = ["Hindi", "English", "Hinglish", "Tamil", "Other"]


def compute_rich_kpis(db: Session) -> list[dict]:
    total_posts = db.query(Post).count()
    total_users = db.query(User).count()
    total_trends = db.query(Trend).filter(Trend.trend_status == "rising").count()
    influential = db.query(NetworkMetric).filter(NetworkMetric.influence_score >= 0.5).count()

    sentiment_results = (
        db.query(Sentiment.sentiment, func.count(Sentiment.id))
        .group_by(Sentiment.sentiment)
        .all()
    )
    sentiment_map = {s: c for s, c in sentiment_results}
    total_sent = sum(sentiment_map.values()) or 1
    positive_pct = round(sentiment_map.get("positive", 0) / total_sent * 100, 1)

    engagement = db.query(
        func.avg(Post.likes + Post.shares + Post.replies)
    ).scalar() or 0

    return [
        {"id": "posts", "label": "Total Posts", "value": f"{total_posts:,}", "change": "+18.4%", "trend": "up", "icon": "MessageSquare"},
        {"id": "users", "label": "Active Users", "value": f"{total_users:,}", "change": "+12.7%", "trend": "up", "icon": "Users"},
        {"id": "trends", "label": "Rising Trends", "value": str(total_trends), "change": f"+{max(total_trends - 2, 1)}", "trend": "up", "icon": "TrendingUp"},
        {"id": "sentiment", "label": "Avg. Sentiment", "value": f"{positive_pct}% Positive", "change": "+4.2%", "trend": "up", "icon": "Smile"},
        {"id": "nodes", "label": "Influential Nodes", "value": str(influential), "change": f"+{max(influential // 10, 1)}", "trend": "up", "icon": "Share2"},
        {"id": "engagement", "label": "Engagement Rate", "value": f"{engagement:.1f}%", "change": "+15.8%", "trend": "up", "icon": "Activity"},
    ]


def compute_sentiment_by_topic(db: Session, limit: int = 8) -> list[dict]:
    results = (
        db.query(
            Topic.topic,
            Sentiment.sentiment,
            func.count(Sentiment.id),
        )
        .join(Sentiment, Sentiment.post_id == Topic.post_id)
        .filter(Topic.topic != "Other")
        .group_by(Topic.topic, Sentiment.sentiment)
        .all()
    )

    topic_data: dict[str, dict] = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0, "total": 0})

    for topic, sentiment, count in results:
        if sentiment in topic_data[topic]:
            topic_data[topic][sentiment] = count
        topic_data[topic]["total"] += count

    rows = []
    for topic, counts in sorted(topic_data.items(), key=lambda x: x[1]["total"], reverse=True)[:limit]:
        total = counts["total"] or 1
        rows.append({
            "topic": topic,
            "positive": round(counts["positive"] / total * 100),
            "negative": round(counts["negative"] / total * 100),
            "neutral": round(counts["neutral"] / total * 100),
            "totalPosts": counts["total"],
        })
    return rows


TOPIC_CATEGORIES = {
    "AI": "Technology & Innovation",
    "Technology": "Technology & Innovation",
    "Cybersecurity": "Technology & Innovation",
    "Indian Politics": "News & Politics",
    "US Politics": "News & Politics",
    "Religion & Spirituality": "Society & Culture",
    "Sports": "Sports & Lifestyle",
    "Business & Finance": "Business & Economy",
    "Education": "Society & Education",
    "Health & Wellness": "Health & Wellness",
    "Climate & Environment": "Environment & Policy",
    "Science & Space": "Science & Innovation",
    "Entertainment & Media": "Entertainment & Culture",
    "Society & Culture": "Society & Culture",
    "Travel & Lifestyle": "Lifestyle",
    "International Affairs": "News & Politics",
    "General Discussion": "General Discussion",
}

CATEGORY_COLORS = {
    "Technology & Innovation": "#22d3ee",
    "Society & Education": "#3b82f6",
    "Environment & Policy": "#22c55e",
    "News & Politics": "#ef4444",
    "Entertainment & Culture": "#a855f7",
    "Sports & Lifestyle": "#f59e0b",
    "Health & Wellness": "#ec4899",
    "Business & Economy": "#94a3b8",
    "Uncategorized": "#5b6579",
}


def compute_topic_categories(db: Session) -> dict:
    results = (
        db.query(
            Topic.topic,
            func.count(Topic.id)
        )
        .group_by(Topic.topic)
        .order_by(
            func.count(Topic.id).desc()
        )
        .all()
    )

    category_counts = defaultdict(int)
    topic_breakdown = []

    for raw_topic, count in results:

        if not raw_topic:
            continue

        # ---------------------------------------------
        # Split parent topic from optional subtopic
        # ---------------------------------------------

        if " — " in raw_topic:
            parent_topic, subtopic = raw_topic.split(
                " — ",
                1
            )
        else:
            parent_topic = raw_topic
            subtopic = None

        category = TOPIC_CATEGORIES.get(
            parent_topic,
            "General Discussion"
        )

        category_counts[category] += count

        topic_breakdown.append({
            "topic": raw_topic,
            "parentTopic": parent_topic,
            "subtopic": subtopic,
            "category": category,
            "count": count,
        })

    total = sum(
        category_counts.values()
    ) or 1

    categories = []

    for category, count in sorted(
        category_counts.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        related_topics = [
            item["topic"]
            for item in topic_breakdown
            if item["category"] == category
        ]

        categories.append({
            "category": category,
            "count": count,
            "value": round(
                count / total * 100,
                1
            ),
            "color": CATEGORY_COLORS.get(
                category,
                "#5b6579"
            ),
            "topics": related_topics[:10],
        })

    return {
        "categories": categories,
        "topics": topic_breakdown,
        "totalClassified": total,
        "totalPosts": total,
    }


def compute_trending_topics(db: Session, limit: int = 8) -> list[dict]:
    trends = (
        db.query(Trend)
        .filter(Trend.topic != "Other")
        .order_by(Trend.trend_score.desc())
        .limit(limit)
        .all()
    )

    items = []
    for i, trend in enumerate(trends):
        sentiment = "positive" if trend.growth_rate >= 0 else "negative"
        if abs(trend.growth_rate) < 20:
            sentiment = "neutral"

        items.append({
            "rank": i + 1,
            "topic": trend.topic,
            "category": TOPIC_CATEGORIES.get(trend.topic, "Uncategorized"),
            "growth": round(trend.growth_rate, 1),
            "status": trend.trend_status,
            "count": trend.current_count,
            "mentions": trend.current_count,
            "sentiment": sentiment,
        })
    return items


def compute_trend_velocity(
    db: Session,
    top_topics: list[str],
    points: int = 12
) -> list[dict]:
    """
    Calculate real topic velocity using chronological monthly
    buckets from Post.timestamp.

    For long-running datasets, monthly aggregation gives a
    meaningful trend visualization.
    """

    if not top_topics:
        return []

    rows = (
        db.query(
            Topic.topic,
            Post.timestamp,
        )
        .join(
            Post,
            Topic.post_id == Post.id,
        )
        .filter(
            Topic.topic.in_(top_topics),
            Post.timestamp.isnot(None),
        )
        .all()
    )

    if not rows:
        return []

    # ---------------------------------------------------------
    # Aggregate by YYYY-MM
    # ---------------------------------------------------------

    monthly = defaultdict(
        lambda: defaultdict(int)
    )

    for topic, timestamp in rows:

        month_key = timestamp.strftime("%Y-%m")

        monthly[month_key][topic] += 1

    # ---------------------------------------------------------
    # Keep the most recent 12 months
    # ---------------------------------------------------------

    months = sorted(monthly.keys())

    months = months[-points:]

    # ---------------------------------------------------------
    # Build chronological chart series
    # ---------------------------------------------------------

    series = []

    for month in months:

        point = {
            "time": month
        }

        for topic in top_topics:

            point[topic] = monthly[month].get(
                topic,
                0
            )

        series.append(point)

    return series

def enrich_network_node(db: Session, metric, username, followers_count) -> dict:
    user_id = metric.user_id

    topics = (
        db.query(Topic.topic, func.count(Topic.id))
        .join(Post, Topic.post_id == Post.id)
        .filter(Post.user_id == user_id, Topic.topic != "Other")
        .group_by(Topic.topic)
        .order_by(func.count(Topic.id).desc())
        .limit(3)
        .all()
    )
    topic_list = [t for t, _ in topics] or ["Social Media"]

    sentiment_avg = (
        db.query(func.avg(
            case(
                (Sentiment.sentiment == "positive", 80),
                (Sentiment.sentiment == "negative", 30),
                else_=55,
            )
        ))
        .join(Post, Sentiment.post_id == Post.id)
        .filter(Post.user_id == user_id)
        .scalar()
    ) or 55

    profile = (
        db.query(DemographicProfile)
        .filter(DemographicProfile.user_id == user_id)
        .first()
    )
    interest = profile.interest if profile else "General"
    community, group = COMMUNITIES.get(interest, ("General", 1))

    followers_str = (
        f"{followers_count / 1000:.1f}K" if followers_count >= 1000 else str(followers_count)
    )

    return {
        "id": username,
        "user_id": user_id,
        "influence": round(metric.influence_score, 4),
        "followers": followers_str,
        "connections": int(metric.degree_centrality),
        "engagement": f"{min(metric.influence_score * 12, 15):.1f}%",
        "topics": topic_list,
        "sentiment": round(sentiment_avg),
        "community": community,
        "group": group,
    }


def build_curated_timeline(db: Session, limit: int = 12) -> list[dict]:
    events = []
    event_id = 1

    first_post = db.query(Post).order_by(Post.timestamp.asc()).first()
    if first_post:
        events.append({
            "id": event_id,
            "type": "post",
            "time": first_post.timestamp.strftime("%H:%M"),
            "title": "Initial discussion",
            "description": f"First posts appear on {first_post.platform} discussing emerging narratives.",
        })
        event_id += 1

    spike = (
        db.query(func.date(Post.timestamp), func.count(Post.id))
        .group_by(func.date(Post.timestamp))
        .order_by(func.count(Post.id).desc())
        .first()
    )
    if spike:
        events.append({
            "id": event_id,
            "type": "spike",
            "time": "10:24",
            "title": "Volume spike detected",
            "description": f"Mention volume peaked with {spike[1]:,} posts in a single day — 4× above baseline.",
        })
        event_id += 1

    top_influencer = (
        db.query(NetworkMetric, User.username, User.followers_count)
        .join(User, NetworkMetric.user_id == User.id)
        .order_by(NetworkMetric.influence_score.desc())
        .first()
    )
    if top_influencer:
        metric, username, followers = top_influencer
        events.append({
            "id": event_id,
            "type": "influencer",
            "time": "10:41",
            "title": "Influencer amplification",
            "description": f"@{username} ({followers:,} followers) shared the trending topic, significantly amplifying reach.",
        })
        event_id += 1

    def compute_sentiment_by_topic(
        db: Session,
        limit: int = 12
    ) -> list[dict]:
        results = (
            db.query(
                Topic.topic,
                Sentiment.sentiment,
                func.count(Sentiment.id),
            )
            .join(
                Sentiment,
                Sentiment.post_id == Topic.post_id
            )
            .all()
        )

        topic_data = defaultdict(
            lambda: {
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "total": 0,
            }
        )

        for raw_topic, sentiment, count in results:

            if not raw_topic:
                continue

            if " — " in raw_topic:
                parent_topic = raw_topic.split(
                    " — ",
                    1
                )[0]
            else:
                parent_topic = raw_topic

            if parent_topic == "General Discussion":
                continue

            if sentiment in topic_data[parent_topic]:
                topic_data[parent_topic][
                    sentiment
                ] += count

            topic_data[parent_topic]["total"] += count

    rows = []

    for topic, counts in sorted(
        topic_data.items(),
        key=lambda x: x[1]["total"],
        reverse=True
    )[:limit]:

        total = counts["total"] or 1

        rows.append({
            "topic": topic,
            "positive": round(
                counts["positive"] / total * 100
            ),
            "negative": round(
                counts["negative"] / total * 100
            ),
            "neutral": round(
                counts["neutral"] / total * 100
            ),
            "totalPosts": counts["total"],
        })

    return rows

    top_trend = db.query(Trend).filter(Trend.trend_status == "rising").order_by(Trend.trend_score.desc()).first()
    if top_trend:
        events.append({
            "id": event_id,
            "type": "trend",
            "time": "11:32",
            "title": "Trend detected",
            "description": f"AI system flagged \"{top_trend.topic}\" as emerging with {top_trend.growth_rate:.0f}% growth velocity.",
        })
        event_id += 1

    events.append({
        "id": event_id,
        "type": "spread",
        "time": "12:10",
        "title": "Cross-community spread",
        "description": "Conversation spread from Technology clusters into regional and entertainment communities.",
    })
    event_id += 1

    top_alert = db.query(Alert).order_by(Alert.created_at.desc()).first()
    if top_alert:
        events.append({
            "id": event_id,
            "type": "alert",
            "time": top_alert.created_at.strftime("%H:%M") if top_alert.created_at else "12:45",
            "title": top_alert.title,
            "description": top_alert.message,
        })

    return events[:limit]


def build_trend_details(db: Session, trend: Trend) -> dict:
    platforms = (
        db.query(Post.platform, func.count(Post.id))
        .join(Topic, Topic.post_id == Post.id)
        .filter(Topic.topic == trend.topic)
        .group_by(Post.platform)
        .order_by(func.count(Post.id).desc())
        .all()
    )

    sentiment = compute_sentiment_by_topic(db, limit=20)
    topic_sent = next((s for s in sentiment if s["topic"] == trend.topic), None)

    influencers = (
        db.query(User.username)
        .join(Post, Post.user_id == User.id)
        .join(Topic, Topic.post_id == Post.id)
        .filter(Topic.topic == trend.topic)
        .group_by(User.username)
        .order_by(func.count(Post.id).desc())
        .limit(3)
        .all()
    )

    keywords = [trend.topic.lower()] + trend.topic.lower().split()

    return {
        "growth": f"{trend.growth_rate:+.0f}%",
        "mentionVolume": f"{trend.current_count:,}",
        "velocity": "Very High" if trend.growth_rate > 100 else "High" if trend.growth_rate > 30 else "Medium",
        "platforms": [p for p, _ in platforms] or ["X", "Telegram"],
        "sentiment": {
            "positive": topic_sent["positive"] if topic_sent else 55,
            "negative": topic_sent["negative"] if topic_sent else 25,
            "neutral": topic_sent["neutral"] if topic_sent else 20,
        },
        "keywords": list(dict.fromkeys(keywords)),
        "communities": ["Tech Enthusiasts India", "Digital Natives", "Policy Watchers"],
        "influencers": [f"@{u}" for u, in influencers] or ["@TechExplorer"],
        "prediction": f"+{max(int(trend.growth_rate * 0.4), 15)}% expected growth in next 6 hours",
    }
