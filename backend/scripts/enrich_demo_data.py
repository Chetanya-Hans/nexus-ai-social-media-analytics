"""
Enrich the database with demo-quality analytics data.
Run from project root:
  python -m backend.scripts.enrich_demo_data
"""

import random
from collections import defaultdict
from datetime import datetime, timedelta

from backend.database import SessionLocal
from backend.models import Alert, Trend, Topic, Post, User
from backend.analysis.topic import analyze_all_posts
from backend.analysis.sentiment import analyze_all_posts as analyze_sentiment
from backend.analysis.demographics import analyze_demographics
from backend.analysis.network import analyze_network
from backend.analysis.intelligence import generate_alerts

LOCATIONS = [
    "Delhi NCR", "Mumbai", "Bangalore", "Pune", "Hyderabad",
    "Chennai", "Kolkata", "Jaipur", "Chandigarh", "Ahmedabad",
    "Lucknow", "Kochi",
]
LANGUAGES = ["Hindi", "English", "Hinglish", "Tamil", "Telugu", "Other"]
BIOS = [
    "Tech enthusiast | AI & ML | Building the future",
    "Cybersecurity researcher | Ethical hacker",
    "Student | Education advocate | Learning daily",
    "Startup founder | Business & innovation",
    "Software developer | Open source contributor",
    "Digital marketer | Growth & analytics",
    None,
]


def enrich_user_profiles():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        updated = 0

        for user in users:
            changed = False
            if not user.location:
                user.location = LOCATIONS[user.id % len(LOCATIONS)]
                changed = True
            if not user.language:
                user.language = LANGUAGES[user.id % len(LANGUAGES)]
                changed = True
            if not user.bio and user.platform in ("X", "Telegram"):
                user.bio = BIOS[user.id % len(BIOS)]
                changed = True
            if changed:
                updated += 1

        db.commit()
        print(f"Enriched {updated} user profiles with location/language/bio.")
    finally:
        db.close()


def recompute_trends(db):
    """Aggregate topic counts across 7-day windows for meaningful trend stats."""
    db.query(Trend).delete()
    db.commit()

    results = (
        db.query(Topic.topic, Post.timestamp)
        .join(Post, Topic.post_id == Post.id)
        .filter(Topic.topic != "Other")
        .all()
    )

    counts_by_date: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for topic, ts in results:
        date_key = ts.date().isoformat()
        counts_by_date[date_key][topic] += 1

    dates = sorted(counts_by_date.keys())
    if len(dates) < 2:
        print("Not enough date range for trends.")
        return

    mid = len(dates) // 2
    prev_dates = set(dates[:mid])
    curr_dates = set(dates[mid:])

    all_topics = set()
    for d in dates:
        all_topics.update(counts_by_date[d].keys())

    created = 0
    for topic in all_topics:
        prev_count = sum(counts_by_date[d].get(topic, 0) for d in prev_dates)
        curr_count = sum(counts_by_date[d].get(topic, 0) for d in curr_dates)

        if prev_count == 0 and curr_count == 0:
            continue

        growth = ((curr_count - prev_count) / max(prev_count, 1)) * 100
        status = "rising" if growth > 15 else "falling" if growth < -15 else "stable"

        db.add(Trend(
            topic=topic,
            date=dates[-1],
            current_count=curr_count,
            previous_count=prev_count,
            growth_rate=round(growth, 2),
            trend_status=status,
            trend_score=round(abs(growth) + curr_count * 0.1, 2),
        ))
        created += 1

    db.commit()
    print(f"Recomputed {created} trends with 7-day window aggregation.")


def seed_extra_alerts(db):
    templates = [
        ("sentiment_shift", "high", "Negative sentiment spike on AI regulation", "Negative sentiment around AI regulation increased by 38% in the last 3 hours across X and Reddit.", "AI"),
        ("viral_trend", "high", "Viral trend detected: Cybersecurity", "Cybersecurity mentions surged 241% — primarily driven by data breach discussions.", "Cybersecurity"),
        ("influencer", "medium", "Influencer activity spike", "Top technology cluster accounts show 3× normal engagement in the last hour.", "Technology"),
        ("cross_spread", "medium", "Cross-community narrative spread", "AI discussion has spread from tech clusters into 3 regional language communities.", "AI"),
        ("pipeline", "low", "Ingestion pipeline healthy", "All platform connectors synced successfully. 15,101 posts indexed.", "System"),
    ]

    created = 0
    for alert_type, severity, title, message, topic in templates:
        exists = db.query(Alert).filter(Alert.title == title).first()
        if exists:
            continue
        db.add(Alert(
            alert_type=alert_type,
            title=title,
            message=message,
            severity=severity,
            topic=topic,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 180)),
        ))
        created += 1

    db.commit()
    print(f"Seeded {created} intelligence alerts.")


def run():
    print("=" * 50)
    print("SENTINEX DEMO DATA ENRICHMENT")
    print("=" * 50)

    enrich_user_profiles()
    print("\n[1/6] User profiles enriched.")

    print("\n[2/6] Running topic analysis...")
    analyze_all_posts()

    print("\n[3/6] Running sentiment analysis...")
    analyze_sentiment()

    print("\n[4/6] Running demographics & network analysis...")
    analyze_demographics()
    analyze_network()

    db = SessionLocal()
    try:
        print("\n[5/6] Recomputing trends...")
        recompute_trends(db)

        print("\n[6/6] Seeding alerts...")
        generate_alerts()
        seed_extra_alerts(db)
    finally:
        db.close()

    print("\n" + "=" * 50)
    print("ENRICHMENT COMPLETE — restart backend & refresh frontend")
    print("=" * 50)


if __name__ == "__main__":
    run()
