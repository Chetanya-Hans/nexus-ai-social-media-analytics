from backend.database import Base, SessionLocal, engine
from backend.models import (
    User,
    Post,
    Sentiment,
    Topic,
    Trend,
    NetworkMetric,
    DemographicProfile,
    Alert,
)

from backend.scripts.import_x_dataset import import_x_dataset
from backend.scripts.import_reddit_dataset import import_reddit_dataset
from backend.scripts.import_telegram_dataset import import_telegram_dataset


def print_statistics(db):

    print("\n================================")
    print("FINAL DATABASE STATISTICS")
    print("================================")

    stats = {
        "Users": db.query(User).count(),
        "Posts": db.query(Post).count(),
        "Sentiments": db.query(Sentiment).count(),
        "Topics": db.query(Topic).count(),
        "Trends": db.query(Trend).count(),
        "Network Metrics": db.query(NetworkMetric).count(),
        "Demographic Profiles": db.query(DemographicProfile).count(),
        "Alerts": db.query(Alert).count(),
    }

    for name, count in stats.items():
        print(f"{name:<25}: {count:,}")


def main():

    print("========================================")
    print("      SENTINEX AI DATA PIPELINE")
    print("========================================")

    print("\nCreating database tables...")
    Base.metadata.create_all(bind=engine)

    print("\n[1/3] Importing X dataset...")
    try:
        import_x_dataset()
    except Exception as e:
        print(f"X import failed: {e}")

    print("\n[2/3] Importing Reddit dataset...")
    try:
        import_reddit_dataset()
    except Exception as e:
        print(f"Reddit import failed: {e}")

    print("\n[3/3] Importing Telegram dataset...")
    try:
        import_telegram_dataset()
    except Exception as e:
        print(f"Telegram import failed: {e}")

    db = SessionLocal()

    try:
        print_statistics(db)
    finally:
        db.close()

    print("\n========================================")
    print("       DATA PIPELINE COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()