from asyncio import events

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, date
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.database import Base, engine, get_db
from backend.models import (
    User,
    Post,
    Interaction,
    Sentiment,
    Topic,
    Trend,
    NetworkMetric,
   DemographicProfile,
    Alert
)
from backend.schemas import (
    UserCreate,
    PostCreate,
    InteractionCreate,
    AIQuery
)
from backend.analytics_helpers import (
    compute_rich_kpis,
    compute_sentiment_by_topic,
    compute_trending_topics,
    compute_topic_categories,
    compute_trend_velocity,
    enrich_network_node,
    build_curated_timeline,
    build_trend_details,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://nexus-ai-social-media-analytics-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Social Media Analytics API is running"
    }


@app.get("/database-test")
def database_test():
    try:
        with engine.connect():
            return {
                "status": "success",
                "message": "Connected to MySQL"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        platform=user.platform,
        username=user.username,
        display_name=user.display_name,
        bio=user.bio,
        location=user.location,
        language=user.language,
        followers_count=user.followers_count,
        following_count=user.following_count
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return users


@app.post("/api/posts")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    new_post = Post(
        platform=post.platform,
        user_id=post.user_id,
        text=post.text,
        timestamp=post.timestamp,
        likes=post.likes,
        shares=post.shares,
        replies=post.replies
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


@app.get("/api/posts")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).all()

    return posts


@app.post("/api/interactions")
def create_interaction(
    interaction: InteractionCreate,
    db: Session = Depends(get_db)
):
    new_interaction = Interaction(
        source_user_id=interaction.source_user_id,
        target_user_id=interaction.target_user_id,
        post_id=interaction.post_id,
        interaction_type=interaction.interaction_type,
        timestamp=interaction.timestamp
    )

    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)

    return new_interaction


@app.get("/api/interactions")
def get_interactions(db: Session = Depends(get_db)):
    interactions = db.query(Interaction).all()

    return interactions


@app.get("/api/analytics/topics/categories")
def get_topic_categories(db: Session = Depends(get_db)):
    return compute_topic_categories(db)


@app.get("/api/topics/search")
def search_topics(
    q: str = "",
    db: Session = Depends(get_db),
):
    """
    Search topics and subtopics already present in the database.

    Examples:
        AI
        Politics
        Cricket
        Climate
        Bitcoin
    """

    query = q.strip()

    if not query:
        return []

    results = (
        db.query(
            Topic.topic,
            func.count(Topic.id).label("count"),
        )
        .filter(
            Topic.topic.ilike(f"%{query}%")
        )
        .group_by(Topic.topic)
        .order_by(
            func.count(Topic.id).desc()
        )
        .limit(20)
        .all()
    )

    response = []

    for topic_name, count in results:

        parent_topic = topic_name
        subtopic = None

        if " — " in topic_name:
            parent_topic, subtopic = topic_name.split(
                " — ",
                1,
            )

        response.append(
            {
                "topic": topic_name,
                "parentTopic": parent_topic.strip(),
                "subtopic": (
                    subtopic.strip()
                    if subtopic
                    else None
                ),
                "count": count,
            }
        )

    return response



@app.get("/api/topics/intelligence")
def get_topic_intelligence(
    topic: str = "",
    db: Session = Depends(get_db),
):
    """
    Complete intelligence profile for a selected topic.

    Returns:
    - mentions
    - sentiment
    - emotion
    - platforms
    - related topics
    - trend
    """

    query = topic.strip()

    if not query:
        return {
            "topic": None,
            "mentions": 0,
            "sentiment": {},
            "emotion": [],
            "platforms": [],
            "relatedTopics": [],
            "trend": None,
        }

    # ========================================================
    # MATCH TOPIC
    # ========================================================

    topic_filter = Topic.topic.ilike(
        f"%{query}%"
    )

    # ========================================================
    # MENTIONS
    # ========================================================

    mentions = (
        db.query(func.count(Topic.id))
        .filter(topic_filter)
        .scalar()
        or 0
    )

    # ========================================================
    # SENTIMENT
    # ========================================================

    sentiment_rows = (
        db.query(
            Sentiment.sentiment,
            func.count(Sentiment.id),
        )
        .join(
            Topic,
            Topic.post_id == Sentiment.post_id,
        )
        .filter(topic_filter)
        .group_by(
            Sentiment.sentiment
        )
        .all()
    )

    sentiment_counts = {
        "positive": 0,
        "negative": 0,
        "neutral": 0,
    }

    for value, count in sentiment_rows:

        if value in sentiment_counts:
            sentiment_counts[value] = count

    sentiment_total = sum(
        sentiment_counts.values()
    ) or 1

    sentiment = {
        key: {
            "count": value,
            "percentage": round(
                value / sentiment_total * 100,
                1,
            ),
        }
        for key, value
        in sentiment_counts.items()
    }

    # ========================================================
    # EMOTION
    # ========================================================

    emotion_rows = (
        db.query(
            Sentiment.emotion,
            func.count(Sentiment.id),
        )
        .join(
            Topic,
            Topic.post_id == Sentiment.post_id,
        )
        .filter(
            topic_filter,
            Sentiment.emotion.isnot(None),
        )
        .group_by(
            Sentiment.emotion
        )
        .order_by(
            func.count(Sentiment.id).desc()
        )
        .all()
    )

    emotion_total = sum(
        count
        for _, count in emotion_rows
    ) or 1

    emotions = [
        {
            "emotion": emotion,
            "count": count,
            "percentage": round(
                count / emotion_total * 100,
                1,
            ),
        }
        for emotion, count in emotion_rows
    ]

    # ========================================================
    # PLATFORMS
    # ========================================================

    platform_rows = (
        db.query(
            Post.platform,
            func.count(Post.id),
        )
        .join(
            Topic,
            Topic.post_id == Post.id,
        )
        .filter(topic_filter)
        .group_by(
            Post.platform
        )
        .order_by(
            func.count(Post.id).desc()
        )
        .all()
    )

    platform_total = sum(
        count
        for _, count in platform_rows
    ) or 1

    platforms = [
        {
            "platform": platform,
            "count": count,
            "percentage": round(
                count / platform_total * 100,
                1,
            ),
        }
        for platform, count
        in platform_rows
    ]

    # ========================================================
    # RELATED TOPICS
    # ========================================================
    #
    # Find other topics that occur on posts associated with
    # the selected topic.
    #
    # This gives us genuine dataset relationships instead of
    # a hardcoded related-topic list.
    # ========================================================

    selected_post_ids = (
        db.query(Topic.post_id)
        .filter(topic_filter)
        .subquery()
    )

    related_rows = (
        db.query(
            Topic.topic,
            func.count(Topic.id),
        )
        .filter(
            Topic.post_id.in_(
                db.query(
                    selected_post_ids.c.post_id
                )
            ),
            ~topic_filter,
        )
        .group_by(
            Topic.topic
        )
        .order_by(
            func.count(Topic.id).desc()
        )
        .limit(10)
        .all()
    )

    related_topics = [
        {
            "topic": related_topic,
            "count": count,
        }
        for related_topic, count
        in related_rows
    ]

    # ========================================================
    # TREND
    # ========================================================

    trend = (
        db.query(Trend)
        .filter(
            Trend.topic.ilike(
                f"%{query}%"
            )
        )
        .order_by(
            Trend.trend_score.desc()
        )
        .first()
    )

    trend_data = None

    if trend:

        trend_data = {
            "topic": trend.topic,
            "date": trend.date,
            "currentCount": trend.current_count,
            "previousCount": trend.previous_count,
            "growthRate": round(
                trend.growth_rate,
                2,
            ),
            "status": trend.trend_status,
            "score": round(
                trend.trend_score,
                2,
            ),
        }

    # ========================================================
    # RESULT
    # ========================================================

    return {
        "topic": query,
        "mentions": mentions,
        "sentiment": sentiment,
        "emotion": emotions,
        "platforms": platforms,
        "relatedTopics": related_topics,
        "trend": trend_data,
    }


@app.get("/api/analytics/sentiment/by-topic")
def get_sentiment_by_topic(db: Session = Depends(get_db)):
    return compute_sentiment_by_topic(db)


@app.get("/api/analytics/sentiment")
def get_sentiment_analytics(db: Session = Depends(get_db)):
    total = db.query(Sentiment).count()

    positive = (
        db.query(Sentiment)
        .filter(Sentiment.sentiment == "positive")
        .count()
    )

    negative = (
        db.query(Sentiment)
        .filter(Sentiment.sentiment == "negative")
        .count()
    )

    neutral = (
        db.query(Sentiment)
        .filter(Sentiment.sentiment == "neutral")
        .count()
    )

    if total > 0:
        positive_percentage = round((positive / total) * 100, 2)
        negative_percentage = round((negative / total) * 100, 2)
        neutral_percentage = round((neutral / total) * 100, 2)
    else:
        positive_percentage = 0
        negative_percentage = 0
        neutral_percentage = 0

    return {
        "total": total,
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "percentages": {
            "positive": positive_percentage,
            "negative": negative_percentage,
            "neutral": neutral_percentage
        }
    }



@app.get("/api/analytics/sentiment/timeline")
def get_sentiment_timeline(db: Session = Depends(get_db)):
    results = (
        db.query(Sentiment, Post.timestamp)
        .join(Post, Sentiment.post_id == Post.id)
        .all()
    )

    timeline = {}

    for sentiment, timestamp in results:
        date = timestamp.date().isoformat()

        if date not in timeline:
            timeline[date] = {
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }

        timeline[date][sentiment.sentiment] += 1

    return [
        {
            "date": date,
            **counts
        }
        for date, counts in sorted(timeline.items())
    ]


@app.get("/api/analytics/emotions")
def get_emotion_analytics(db: Session = Depends(get_db)):
    results = (
        db.query(
            Sentiment.emotion,
            func.count(Sentiment.id)
        )
        .group_by(Sentiment.emotion)
        .all()
    )

    return [
        {
            "emotion": emotion if emotion else "Unknown",
            "count": count
        }
        for emotion, count in results
    ]


@app.get("/api/analytics/trends/details")
def get_trend_details(db: Session = Depends(get_db)):
    trends = (
        db.query(Trend)
        .filter(Trend.topic != "Other")
        .order_by(Trend.trend_score.desc())
        .all()
    )
    return {trend.topic: build_trend_details(db, trend) for trend in trends}


@app.get("/api/analytics/trends")
def get_trends(db: Session = Depends(get_db)):
    trends = (
        db.query(Trend)
        .order_by(Trend.trend_score.desc())
        .all()
    )

    return [
        {
            "topic": trend.topic,
            "date": trend.date,
            "current_count": trend.current_count,
            "previous_count": trend.previous_count,
            "growth_rate": round(trend.growth_rate, 2),
            "trend_status": trend.trend_status,
            "trend_score": round(trend.trend_score, 2)
        }
        for trend in trends
    ]


@app.get("/api/analytics/trends/velocity")
def get_trend_velocity(
    db: Session = Depends(get_db),
):
    # Get the most active real topics
    topic_rows = (
        db.query(
            Trend.topic,
            Trend.trend_score,
        )
        .filter(
            Trend.topic.isnot(None),
            Trend.topic != "Other",
            Trend.topic != "General Discussion",
        )
        .order_by(
            Trend.trend_score.desc()
        )
        .limit(3)
        .all()
    )

    topics = [
        topic
        for topic, _ in topic_rows
    ]

    if not topics:
        return []

    return compute_trend_velocity(
        db,
        topics,
        points=12,
    )


@app.get("/api/analytics/network")
def get_network_analytics(
    db: Session = Depends(get_db)
):
    # ---------------------------------------------------------
    # 1. Get influence metrics
    # ---------------------------------------------------------

    results = (
        db.query(
            NetworkMetric,
            User.username,
            User.followers_count
        )
        .join(
            User,
            NetworkMetric.user_id == User.id
        )
        .order_by(
            NetworkMetric.influence_score.desc()
        )
        .all()
    )

    # ---------------------------------------------------------
    # 2. Create graph nodes
    # ---------------------------------------------------------

    nodes = []

    for metric, username, followers_count in results:
        nodes.append(enrich_network_node(db, metric, username, followers_count))

    # ---------------------------------------------------------
    # 3. Get interaction relationships
    # ---------------------------------------------------------

    interactions = (
        db.query(Interaction)
        .all()
    )

    # Map user IDs → usernames
    user_map = {
        user.id: user.username
        for user in db.query(User).all()
    }

    links = []

    for interaction in interactions:

        source = user_map.get(
            interaction.source_user_id
        )

        target = user_map.get(
            interaction.target_user_id
        )

        if source and target:
            links.append({
                "source": source,
                "target": target,
            })

    # ---------------------------------------------------------
    # 4. Create leaderboard
    # ---------------------------------------------------------

    leaderboard = []

    for index, (metric, username, followers_count) in enumerate(
        results
    ):
        leaderboard.append({
            "rank": index + 1,
            "user": username,
            "influenceScore": round(
                metric.influence_score,
                4
            ),
            "reach": followers_count,
            "engagement": int(
                metric.degree_centrality
            ),
            "community": "General",
        })

    # ---------------------------------------------------------
    # 5. Return frontend-compatible structure
    # ---------------------------------------------------------

    return {
        "nodes": nodes,
        "links": links,
        "leaderboard": leaderboard,
    }


@app.get("/api/analytics/demographics/interests")
def get_demographic_interests(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            DemographicProfile.interest,
            func.count(DemographicProfile.id)
        )
        .group_by(DemographicProfile.interest)
        .order_by(
            func.count(DemographicProfile.id).desc()
        )
        .all()
    )

    return [
        {
            "interest": interest,
            "count": count
        }
        for interest, count in results
    ]

@app.get("/api/analytics/demographics/languages")
def get_demographic_languages(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            User.language,
            func.count(User.id)
        )
        .group_by(User.language)
        .order_by(
            func.count(User.id).desc()
        )
        .all()
    )

    return [
        {
            "language": language,
            "count": count
        }
        for language, count in results
    ]


@app.get("/api/analytics/demographics/locations")
def get_demographic_locations(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            User.location,
            func.count(User.id)
        )
        .group_by(User.location)
        .order_by(
            func.count(User.id).desc()
        )
        .all()
    )

    return [
        {
            "location": location,
            "count": count
        }
        for location, count in results
    ]

@app.get("/api/analytics/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return [
        {
            "id": alert.id,
            "alert_type": alert.alert_type,
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity,
            "topic": alert.topic,
            "created_at": alert.created_at
        }
        for alert in alerts
    ]


@app.get("/api/intelligence/overview")
def get_intelligence_overview(db: Session = Depends(get_db)):

    # -------------------------
    # SENTIMENT
    # -------------------------

    sentiment_results = (
        db.query(
            Sentiment.sentiment,
            func.count(Sentiment.id)
        )
        .group_by(Sentiment.sentiment)
        .all()
    )

    sentiment_summary = {
        "positive": 0,
        "negative": 0,
        "neutral": 0
    }

    for sentiment, count in sentiment_results:
        if sentiment in sentiment_summary:
            sentiment_summary[sentiment] = count

    total_posts = sum(sentiment_summary.values())

    # -------------------------
    # EMOTIONS
    # -------------------------

    emotion_results = (
        db.query(
            Sentiment.emotion,
            func.count(Sentiment.id)
        )
        .group_by(Sentiment.emotion)
        .order_by(
            func.count(Sentiment.id).desc()
        )
        .all()
    )

    emotions = [
    {
        "name": emotion,
        "value": count
    }
    for emotion, count in emotion_results
]
    # -------------------------
    # TOPICS
    # -------------------------

    topic_results = (
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

    topics = [
        {
            "topic": topic,
            "count": count
        }
        for topic, count in topic_results
    ]


        # -------------------------
    # PLATFORM DISTRIBUTION
    # -------------------------

    platform_results = (
        db.query(
            Post.platform,
            func.count(Post.id)
        )
        .filter(Post.platform.isnot(None))
        .group_by(Post.platform)
        .all()
    )

    platform_distribution = [
        {
            "name": platform,
            "value": count
        }
        for platform, count in platform_results
    ]



        # -------------------------
    # SENTIMENT TIMELINE
    # -------------------------

    timeline_results = (
        db.query(
            func.date(Post.timestamp),
            Sentiment.sentiment,
            func.count(Sentiment.id)
        )
        .join(
            Sentiment,
            Sentiment.post_id == Post.id
        )
        .group_by(
            func.date(Post.timestamp),
            Sentiment.sentiment
        )
        .order_by(
            func.date(Post.timestamp)
        )
        .all()
    )

    timeline = {}

    for date, sentiment, count in timeline_results:
        date_key = str(date)

        if date_key not in timeline:
            timeline[date_key] = {
                "date": date_key,
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }

        if sentiment in timeline[date_key]:
            timeline[date_key][sentiment] = count

    sentiment_timeline = list(timeline.values())




    
    # -------------------------
    # TRENDS
    # -------------------------

    trend_results = (
        db.query(Trend)
        .order_by(Trend.trend_score.desc())
        .all()
    )

    trends = [
        {
            "topic": trend.topic,
            "growth_rate": round(trend.growth_rate, 2),
            "status": trend.trend_status,
            "current_count": trend.current_count
        }
        for trend in trend_results
    ]

    # -------------------------
    # INFLUENCERS
    # -------------------------

    network_results = (
        db.query(
            NetworkMetric,
            User.username
        )
        .join(
            User,
            NetworkMetric.user_id == User.id
        )
        .order_by(
            NetworkMetric.influence_score.desc()
        )
        .all()
    )

    influencers = [
        {
            "user_id": metric.user_id,
            "username": username,
            "influence_score": round(
                metric.influence_score,
                4
            )
        }
        for metric, username in network_results
    ]

    # -------------------------
    # DEMOGRAPHICS
    # -------------------------

    interest_results = (
        db.query(
            DemographicProfile.interest,
            func.count(DemographicProfile.id)
        )
        .group_by(DemographicProfile.interest)
        .order_by(
            func.count(DemographicProfile.id).desc()
        )
        .all()
    )

    interests = [
        {
            "interest": interest,
            "count": count
        }
        for interest, count in interest_results
    ]

    language_results = (
        db.query(
            User.language,
            func.count(User.id)
        )
        .group_by(User.language)
        .order_by(
            func.count(User.id).desc()
        )
        .all()
    )

    languages = [
        {
            "language": language,
            "count": count
        }
        for language, count in language_results
    ]

    location_results = (
        db.query(
            User.location,
            func.count(User.id)
        )
        .group_by(User.location)
        .order_by(
            func.count(User.id).desc()
        )
        .all()
    )

    locations = [
        {
            "location": location,
            "count": count
        }
        for location, count in location_results
    ]

    # -------------------------
    # ALERTS
    # -------------------------

    alert_results = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )

    alerts = [
        {
            "id": alert.id,
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity,
            "topic": alert.topic
        }
        for alert in alert_results
    ]

    # -------------------------
    # FINAL RESPONSE
    # -------------------------

    return {
        # -------------------------
        # DASHBOARD DATA
        # -------------------------

        "kpis": compute_rich_kpis(db),

        "sentimentTimeline": sentiment_timeline,

        "trendingTopics": compute_trending_topics(db),

        "topicCategories": compute_topic_categories(db),

        "platformDistribution": platform_distribution,

        "emotionDistribution": emotions,

        "latestIntelligence": [
            {
                "id": alert["id"],
                "icon": ["Flame", "AlertTriangle", "Star", "Globe"][index % 4],
                "title": alert["title"],
                "description": alert["message"],
                "message": alert["message"],
                "severity": alert["severity"],
                "topic": alert["topic"],
                "time": "Recently",
            }
            for index, alert in enumerate(alerts[:4])
        ],

        # -------------------------
        # EXISTING INTELLIGENCE DATA
        # -------------------------

        "summary": {
            "total_posts": total_posts,
            **sentiment_summary
        },

        "top_emotions": emotions,

        "top_topics": topics,

        "trending_topics": trends,

        "top_influencers": influencers,

        "audience": {
            "interests": interests,
            "languages": languages,
            "locations": locations
        },

        "alerts": alerts
    }

@app.post("/api/ai/query")
def ai_query(
    query: AIQuery,
    db: Session = Depends(get_db)
):
    question = query.question.lower().strip()

    # =========================================================
    # HELPERS
    # =========================================================

    def detect_topic(text):
        """
        Detect a topic mentioned in the user's question.
        Uses topics already present in the database first.
        Falls back to common topic keywords.
        """

        known_topics = (
            db.query(Topic.topic)
            .distinct()
            .all()
        )

        topic_names = [
            topic[0]
            for topic in known_topics
            if topic[0]
        ]

        # Prefer exact database topics
        for topic_name in sorted(
            topic_names,
            key=len,
            reverse=True
        ):
            if topic_name.lower() in question:
                return topic_name

        # Fallback topic vocabulary
        topic_keywords = {
            "AI": [
                "ai",
                "artificial intelligence",
                "chatgpt",
                "openai",
                "machine learning",
                "generative ai",
                "llm"
            ],
            "Technology": [
                "technology",
                "tech",
                "software",
                "app",
                "internet",
                "computer"
            ],
            "Politics": [
                "politics",
                "political",
                "election",
                "government",
                "minister",
                "vote"
            ],
            "Sports": [
                "sports",
                "sport",
                "cricket",
                "football",
                "ipl",
                "match",
                "player"
            ],
            "Entertainment": [
                "entertainment",
                "movie",
                "movies",
                "film",
                "music",
                "celebrity"
            ],
            "Education": [
                "education",
                "student",
                "school",
                "college",
                "university"
            ],
            "Health": [
                "health",
                "medical",
                "medicine",
                "doctor",
                "disease"
            ],
            "Climate": [
                "climate",
                "environment",
                "global warming",
                "pollution"
            ],
            "Business": [
                "business",
                "company",
                "startup",
                "market",
                "finance"
            ],
            "Cybersecurity": [
                "cybersecurity",
                "cyber security",
                "hacking",
                "hack",
                "malware",
                "ransomware"
            ],
            "Space": [
                "space",
                "nasa",
                "isro",
                "rocket",
                "satellite"
            ]
        }

        for topic_name, keywords in topic_keywords.items():
            for keyword in keywords:
                if keyword in question:
                    return topic_name

        return None

    def get_topic_sentiment(topic_name):
        """
        Get sentiment for a specific topic.

        First uses the Topic table.
        If the topic has not yet been generated, falls back
        to keyword matching against post text.
        """

        if not topic_name:
            return None

        # -----------------------------------------------------
        # First: use classified Topic records
        # -----------------------------------------------------

        topic_query = (
            db.query(
                Sentiment.sentiment,
                func.count(Sentiment.id)
            )
            .join(
                Topic,
                Topic.post_id == Sentiment.post_id
            )
            .filter(
                Topic.topic.ilike(f"%{topic_name}%")
            )
            .group_by(Sentiment.sentiment)
            .all()
        )

        if topic_query:
            return topic_query

        # -----------------------------------------------------
        # Fallback: search post text
        # -----------------------------------------------------

        topic_keywords = {
            "AI": [
                "ai",
                "artificial intelligence",
                "chatgpt",
                "openai",
                "machine learning",
                "generative ai",
                "llm"
            ],
            "Technology": [
                "technology",
                "tech",
                "software",
                "internet"
            ],
            "Politics": [
                "politics",
                "political",
                "election",
                "government",
                "minister",
                "vote"
            ],
            "Sports": [
                "sports",
                "cricket",
                "football",
                "ipl",
                "match"
            ],
            "Entertainment": [
                "movie",
                "film",
                "music",
                "celebrity"
            ],
            "Education": [
                "education",
                "student",
                "school",
                "college",
                "university"
            ],
            "Health": [
                "health",
                "medical",
                "medicine",
                "doctor"
            ],
            "Climate": [
                "climate",
                "environment",
                "global warming",
                "pollution"
            ],
            "Business": [
                "business",
                "company",
                "startup",
                "market",
                "finance"
            ],
            "Cybersecurity": [
                "cybersecurity",
                "hacking",
                "malware",
                "ransomware"
            ],
            "Space": [
                "space",
                "nasa",
                "isro",
                "rocket",
                "satellite"
            ]
        }

        keywords = topic_keywords.get(
            topic_name,
            [topic_name]
        )

        conditions = [
            Post.text.ilike(f"%{keyword}%")
            for keyword in keywords
        ]

        return (
            db.query(
                Sentiment.sentiment,
                func.count(Sentiment.id)
            )
            .join(
                Post,
                Post.id == Sentiment.post_id
            )
            .filter(or_(*conditions))
            .group_by(Sentiment.sentiment)
            .all()
        )

    def get_topic_platforms(topic_name):
        """
        Determine which platform discusses a topic the most.
        Uses Topic classification when available and falls
        back to text matching.
        """

        if not topic_name:
            return []

        # -----------------------------------------------------
        # First: classified topics
        # -----------------------------------------------------

        results = (
            db.query(
                Post.platform,
                func.count(Post.id)
            )
            .join(
                Topic,
                Topic.post_id == Post.id
            )
            .filter(
                Topic.topic.ilike(f"%{topic_name}%")
            )
            .group_by(Post.platform)
            .order_by(
                func.count(Post.id).desc()
            )
            .all()
        )

        if results:
            return results

        # -----------------------------------------------------
        # Fallback: text matching
        # -----------------------------------------------------

        topic_keywords = {
            "AI": [
                "ai",
                "artificial intelligence",
                "chatgpt",
                "openai",
                "machine learning",
                "generative ai",
                "llm"
            ],
            "Technology": [
                "technology",
                "tech",
                "software",
                "internet"
            ],
            "Politics": [
                "politics",
                "political",
                "election",
                "government",
                "minister",
                "vote"
            ],
            "Sports": [
                "sports",
                "cricket",
                "football",
                "ipl",
                "match"
            ],
            "Entertainment": [
                "movie",
                "film",
                "music",
                "celebrity"
            ],
            "Education": [
                "education",
                "student",
                "school",
                "college"
            ],
            "Health": [
                "health",
                "medical",
                "medicine",
                "doctor"
            ],
            "Climate": [
                "climate",
                "environment",
                "global warming",
                "pollution"
            ],
            "Business": [
                "business",
                "company",
                "startup",
                "market",
                "finance"
            ],
            "Cybersecurity": [
                "cybersecurity",
                "hacking",
                "malware",
                "ransomware"
            ],
            "Space": [
                "space",
                "nasa",
                "isro",
                "rocket",
                "satellite"
            ]
        }

        keywords = topic_keywords.get(
            topic_name,
            [topic_name]
        )

        conditions = [
            Post.text.ilike(f"%{keyword}%")
            for keyword in keywords
        ]

        return (
            db.query(
                Post.platform,
                func.count(Post.id)
            )
            .filter(or_(*conditions))
            .group_by(Post.platform)
            .order_by(
                func.count(Post.id).desc()
            )
            .all()
        )

    # =========================================================
    # OVERALL SENTIMENT
    # =========================================================

    sentiment_results = (
        db.query(
            Sentiment.sentiment,
            func.count(Sentiment.id)
        )
        .group_by(Sentiment.sentiment)
        .all()
    )

    sentiment = {
        "positive": 0,
        "negative": 0,
        "neutral": 0
    }

    for value, count in sentiment_results:
        if value in sentiment:
            sentiment[value] = count

    total = sum(sentiment.values())

    positive_pct = (
        round(sentiment["positive"] / total * 100, 2)
        if total else 0
    )

    negative_pct = (
        round(sentiment["negative"] / total * 100, 2)
        if total else 0
    )

    neutral_pct = (
        round(sentiment["neutral"] / total * 100, 2)
        if total else 0
    )

    # =========================================================
    # TREND DATA
    # =========================================================

    trends = (
        db.query(Trend)
        .order_by(
            Trend.trend_score.desc()
        )
        .all()
    )

    # =========================================================
    # DETECT SPECIFIC TOPIC
    # =========================================================

    topic_name = detect_topic(question)

    # =========================================================
    # 1. WHAT'S TRENDING?
    # =========================================================

    if (
        "what's trending" in question
        or "what is trending" in question
        or "top trend" in question
        or "most trending" in question
    ):

        if trends:

            top_trends = trends[:5]

            trend_text = "; ".join(
                [
                    (
                        f"{trend.topic} "
                        f"({trend.current_count:,} mentions, "
                        f"{trend.growth_rate:+.2f}% growth)"
                    )
                    for trend in top_trends
                ]
            )

            answer = (
                f"The leading trending topics are: "
                f"{trend_text}. "
                f"These results are calculated from the "
                f"current trend data in the database."
            )

        else:

            # Fallback to actual topic frequency
            topic_counts = (
                db.query(
                    Topic.topic,
                    func.count(Topic.id)
                )
                .group_by(Topic.topic)
                .order_by(
                    func.count(Topic.id).desc()
                )
                .limit(5)
                .all()
            )

            if topic_counts:

                topic_text = ", ".join(
                    [
                        f"{topic} ({count:,} mentions)"
                        for topic, count in topic_counts
                    ]
                )

                answer = (
                    f"No calculated trend-velocity records "
                    f"are available yet. Based on topic volume, "
                    f"the most discussed topics are: "
                    f"{topic_text}."
                )

            else:
                answer = (
                    "Trend data is not available yet. "
                    "The topic analysis pipeline needs to "
                    "finish processing the imported data."
                )

    # =========================================================
    # 2. WHAT ARE THE EMERGING TOPICS?
    # =========================================================

    elif any(
        phrase in question
        for phrase in [
            "emerging topics",
            "emerging topic",
            "new topics",
            "new topic",
            "rising topics",
            "rising topic"
        ]
    ):

        rising = [
            trend
            for trend in trends
            if trend.trend_status == "rising"
        ]

        rising.sort(
            key=lambda x: x.trend_score,
            reverse=True
        )

        if rising:

            top_rising = rising[:5]

            answer = (
                "The strongest emerging topics are: "
                + "; ".join(
                    [
                        (
                            f"{trend.topic} "
                            f"({trend.growth_rate:+.2f}% growth)"
                        )
                        for trend in top_rising
                    ]
                )
                + "."
            )

        else:

            answer = (
                "No topics are currently classified as "
                "rising. Emerging-topic detection will become "
                "available as the trend pipeline processes "
                "the imported dataset."
            )

    # =========================================================
    # 3. SENTIMENT AROUND A SPECIFIC TOPIC
    # =========================================================

    elif (
        topic_name
        and any(
            word in question
            for word in [
                "sentiment",
                "feel",
                "feeling",
                "positive",
                "negative",
                "opinion"
            ]
        )
    ):

        results = get_topic_sentiment(topic_name)

        topic_sentiment = {
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }

        for value, count in results or []:
            if value in topic_sentiment:
                topic_sentiment[value] += count

        topic_total = sum(
            topic_sentiment.values()
        )

        if topic_total:

            pos = round(
                topic_sentiment["positive"]
                / topic_total * 100,
                2
            )

            neg = round(
                topic_sentiment["negative"]
                / topic_total * 100,
                2
            )

            neu = round(
                topic_sentiment["neutral"]
                / topic_total * 100,
                2
            )

            dominant = max(
                topic_sentiment,
                key=topic_sentiment.get
            )

            answer = (
                f"Sentiment around {topic_name} is "
                f"{pos}% positive, "
                f"{neg}% negative, and "
                f"{neu}% neutral across "
                f"{topic_total:,} relevant posts. "
                f"The dominant sentiment is {dominant}."
            )

        else:

            answer = (
                f"I couldn't find enough classified data "
                f"about {topic_name} to calculate sentiment."
            )

    # =========================================================
    # 4. WHICH TOPIC IS MOST NEGATIVE?
    # =========================================================

    elif any(
        phrase in question
        for phrase in [
            "most negative",
            "most negativity",
            "highest negative",
            "negative topic",
            "negative sentiment"
        ]
    ):

        topic_sentiments = (
            db.query(
                Topic.topic,
                Sentiment.sentiment,
                func.count(Sentiment.id)
            )
            .join(
                Sentiment,
                Sentiment.post_id == Topic.post_id
            )
            .group_by(
                Topic.topic,
                Sentiment.sentiment
            )
            .all()
        )

        topic_totals = {}

        for topic, sentiment_value, count in topic_sentiments:

            if not topic:
                continue

            if topic not in topic_totals:
                topic_totals[topic] = {
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0
                }

            if sentiment_value in topic_totals[topic]:
                topic_totals[topic][sentiment_value] += count

        ranked = []

        for topic, values in topic_totals.items():

            total_topic = sum(values.values())

            if total_topic == 0:
                continue

            negative_percentage = (
                values["negative"]
                / total_topic
                * 100
            )

            ranked.append(
                (
                    topic,
                    negative_percentage,
                    total_topic
                )
            )

        ranked.sort(
            key=lambda x: x[1],
            reverse=True
        )

        if ranked:

            topic, percentage, count = ranked[0]

            answer = (
                f"{topic} currently has the highest "
                f"negative sentiment at "
                f"{percentage:.2f}% across "
                f"{count:,} analyzed posts."
            )

        else:

            answer = (
                "Topic-level sentiment data is not available "
                "yet. The topic analysis pipeline needs to "
                "finish processing the dataset."
            )

    # =========================================================
    # 5. WHICH PLATFORM DISCUSSES TOPIC THE MOST?
    # =========================================================

    elif (
        topic_name
        and any(
            word in question
            for word in [
                "platform",
                "discuss",
                "discussion",
                "talk",
                "mentions"
            ]
        )
    ):

        platform_results = get_topic_platforms(
            topic_name
        )

        if platform_results:

            top_platform, top_count = platform_results[0]

            platform_text = ", ".join(
                [
                    f"{platform}: {count:,}"
                    for platform, count
                    in platform_results[:5]
                ]
            )

            answer = (
                f"{top_platform} has the most discussion "
                f"around {topic_name}, with "
                f"{top_count:,} relevant posts. "
                f"Across platforms: {platform_text}."
            )

        else:

            answer = (
                f"I couldn't find posts discussing "
                f"{topic_name}."
            )

    # =========================================================
    # 6. GENERAL TOPIC QUESTION
    # =========================================================

    elif topic_name:

        results = get_topic_sentiment(topic_name)

        topic_total = sum(
            count
            for _, count in (results or [])
        )

        platforms = get_topic_platforms(
            topic_name
        )

        if platforms:
            leading_platform = platforms[0][0]
        else:
            leading_platform = "unknown"

        if topic_total:

            topic_sentiment = {
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }

            for value, count in results:
                if value in topic_sentiment:
                    topic_sentiment[value] += count

            dominant = max(
                topic_sentiment,
                key=topic_sentiment.get
            )

            answer = (
                f"{topic_name} has {topic_total:,} relevant "
                f"posts in the current dataset. "
                f"The dominant sentiment is {dominant}, "
                f"and {leading_platform} has the highest "
                f"discussion volume."
            )

        else:

            answer = (
                f"I found the topic {topic_name}, but there "
                f"isn't enough processed topic data to provide "
                f"a full intelligence summary yet."
            )

    # =========================================================
    # 7. GENERAL SENTIMENT
    # =========================================================

    elif any(
        word in question
        for word in [
            "sentiment",
            "feel",
            "positive",
            "negative"
        ]
    ):

        answer = (
            f"Across {total:,} analyzed posts, sentiment is "
            f"{positive_pct}% positive, "
            f"{negative_pct}% negative, and "
            f"{neutral_pct}% neutral."
        )

    # =========================================================
    # 8. GENERAL FALLBACK
    # =========================================================

    else:

        if trends:
            top_trend = trends[0]

            trend_text = (
                f"{top_trend.topic} "
                f"({top_trend.growth_rate:+.2f}% growth)"
            )
        else:
            trend_text = "no calculated trend yet"

        answer = (
            f"SentiNex currently has {total:,} analyzed "
            f"sentiment records. Overall sentiment is "
            f"{positive_pct}% positive, "
            f"{negative_pct}% negative, and "
            f"{neutral_pct}% neutral. "
            f"The leading detected trend is {trend_text}."
        )

    return {
        "answer": answer
    }


@app.get("/api/analytics/timeline")
def get_timeline_analytics(db: Session = Depends(get_db)):
    return {"events": build_curated_timeline(db)}

@app.get("/api/analytics/sources")
def get_data_sources(
    db: Session = Depends(get_db)
):
    platforms = (
        db.query(User.platform)
        .filter(User.platform.isnot(None))
        .distinct()
        .all()
    )

    sources = []

    for (platform,) in platforms:
        post_count, last_sync = (
            db.query(
                func.count(Post.id),
                func.max(Post.timestamp)
            )
            .filter(Post.platform == platform)
            .first()
        )

        sources.append({
            "platform": platform,
            "status": "connected",
            "posts": post_count or 0,
            "lastSync": (
                last_sync.strftime("%Y-%m-%d %H:%M")
                if last_sync
                else "No data"
            ),
            "apiStatus": "Operational"
        })

    return {
        "sources": sources
    }


@app.get("/api/analytics/platforms")
def get_platform_analytics(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            Post.platform,
            func.count(Post.id)
        )
        .filter(Post.platform.isnot(None))
        .group_by(Post.platform)
        .all()
    )

    return [
        {
            "platform": platform,
            "count": count
        }
        for platform, count in results
    ]