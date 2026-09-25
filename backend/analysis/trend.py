from collections import defaultdict
from datetime import datetime

from backend.database import SessionLocal
from backend.models import Post, Topic, Trend


def calculate_growth(previous_count, current_count):
    """
    Calculate percentage growth between two periods.

    When there is no previous activity, we avoid claiming
    infinite/100% growth and instead use 0 until there
    is a meaningful baseline.
    """

    if previous_count <= 0:
        return 0.0

    return (
        (current_count - previous_count)
        / previous_count
    ) * 100


def get_trend_status(growth_rate):
    if growth_rate > 20:
        return "rising"

    if growth_rate < -20:
        return "falling"

    return "stable"


def get_topic_counts_by_date(db):
    """
    Count real classified posts for every topic/day.
    """

    results = (
        db.query(
            Topic.topic,
            Post.timestamp
        )
        .join(
            Post,
            Topic.post_id == Post.id
        )
        .filter(
            Post.timestamp.isnot(None),
            Topic.topic.isnot(None),
        )
        .all()
    )

    counts = defaultdict(
        lambda: defaultdict(int)
    )

    for topic, timestamp in results:

        date = timestamp.date().isoformat()

        counts[date][topic] += 1

    return counts


def analyze_trends():
    db = SessionLocal()

    try:

        counts = get_topic_counts_by_date(db)

        dates = sorted(counts.keys())

        if len(dates) < 2:

            print(
                "Not enough dates to calculate trends."
            )

            return

        current_date = dates[-1]
        previous_date = dates[-2]

        print()
        print("========================================")
        print("REAL TREND ANALYSIS")
        print("========================================")
        print(f"Current period : {current_date}")
        print(f"Previous period: {previous_date}")
        print()

        topics = (
            set(counts[current_date].keys())
            | set(counts[previous_date].keys())
        )

        processed = 0

        for topic in topics:

            if not topic:
                continue

            if topic == "Other":
                continue

            current_count = (
                counts[current_date]
                .get(topic, 0)
            )

            previous_count = (
                counts[previous_date]
                .get(topic, 0)
            )

            # Ignore topics with no current activity.
            if current_count <= 0:
                continue

            growth_rate = calculate_growth(
                previous_count,
                current_count
            )

            trend_status = get_trend_status(
                growth_rate
            )

            # Give larger-volume topics slightly more weight.
            volume_factor = min(
                current_count / 100,
                10
            )

            trend_score = (
                abs(growth_rate)
                * (1 + volume_factor * 0.1)
            )

            existing_trend = (
                db.query(Trend)
                .filter(
                    Trend.topic == topic,
                    Trend.date == current_date
                )
                .first()
            )

            if existing_trend:

                existing_trend.current_count = (
                    current_count
                )

                existing_trend.previous_count = (
                    previous_count
                )

                existing_trend.growth_rate = (
                    growth_rate
                )

                existing_trend.trend_status = (
                    trend_status
                )

                existing_trend.trend_score = (
                    trend_score
                )

            else:

                trend = Trend(
                    topic=topic,
                    date=current_date,
                    current_count=current_count,
                    previous_count=previous_count,
                    growth_rate=growth_rate,
                    trend_status=trend_status,
                    trend_score=trend_score,
                )

                db.add(trend)

            processed += 1

        db.commit()

        print(
            f"Processed topics: {processed:,}"
        )

        print()
        print(
            "Trend analysis completed successfully."
        )

        print("========================================")

    except Exception:

        db.rollback()
        raise

    finally:

        db.close()


if __name__ == "__main__":
    analyze_trends()