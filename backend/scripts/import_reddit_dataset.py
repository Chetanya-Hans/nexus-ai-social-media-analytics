import pandas as pd
from datetime import datetime, timedelta

from backend.database import SessionLocal
from backend.models import User, Post, Sentiment


CSV_FILE = "data/reddit/Reddit_Data.csv"
BATCH_SIZE = 2000


def import_reddit_dataset():
    db = SessionLocal()

    try:
        df = pd.read_csv(CSV_FILE)

        imported = 0
        skipped = 0

        total_rows = len(df)

        for index, row in df.iterrows():

            text = str(row.get("clean_comment", "")).strip()

            if not text or text.lower() == "nan":
                skipped += 1
                continue

            category = row.get("category")

            if pd.isna(category):
                skipped += 1
                continue

            try:
                category = float(category)
            except (ValueError, TypeError):
                skipped += 1
                continue

            if category == 1:
                sentiment = "positive"
            elif category == -1:
                sentiment = "negative"
            else:
                sentiment = "neutral"

            username = f"reddit_user_{index + 1}"

            user = (
                db.query(User)
                .filter(
                    User.platform == "Reddit",
                    User.username == username
                )
                .first()
            )

            if not user:
                user = User(
                    platform="Reddit",
                    username=username,
                    display_name=username,
                    followers_count=0,
                    following_count=0,
                )

                db.add(user)
                db.flush()

            # Reddit dataset does not contain timestamps.
            timestamp = datetime(2024, 1, 1) + timedelta(
                minutes=index
            )

            existing = (
                db.query(Post)
                .filter(
                    Post.platform == "Reddit",
                    Post.text == text,
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            post = Post(
                platform="Reddit",
                user_id=user.id,
                text=text,
                timestamp=timestamp,
                likes=0,
                shares=0,
                replies=0,
            )

            db.add(post)
            db.flush()

            db.add(
                Sentiment(
                    post_id=post.id,
                    sentiment=sentiment,
                    emotion=None,
                    confidence=1.0,
                )
            )

            imported += 1

            if imported % BATCH_SIZE == 0:
                db.commit()
                print(
                    f"Reddit: imported {imported:,} "
                    f"/ processed {index + 1:,} / {total_rows:,}"
                )

        db.commit()

        print("\n================================")
        print("REDDIT DATASET IMPORT COMPLETE")
        print("================================")
        print(f"Imported : {imported:,}")
        print(f"Skipped  : {skipped:,}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_reddit_dataset()