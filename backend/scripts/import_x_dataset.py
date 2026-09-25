import csv
from datetime import datetime, timedelta

from backend.database import SessionLocal
from backend.models import User, Post, Sentiment


CSV_FILE = "Tweets.csv"
BATCH_SIZE = 2000


def import_x_dataset():
    db = SessionLocal()

    try:
        imported = 0
        skipped = 0

        with open(CSV_FILE, "r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)

            rows = list(reader)
            total_rows = len(rows)

            for index, row in enumerate(rows):
                text_id = (row.get("textID") or "").strip()
                text = (row.get("text") or "").strip()
                sentiment = (row.get("sentiment") or "").strip().lower()

                if not text_id or not text:
                    skipped += 1
                    continue

                existing = (
                    db.query(Post)
                    .filter(
                        Post.platform == "X",
                        Post.text == text
                    )
                    .first()
                )

                if existing:
                    skipped += 1
                    continue

                username = f"x_user_{text_id[:8]}"

                user = (
                    db.query(User)
                    .filter(
                        User.platform == "X",
                        User.username == username
                    )
                    .first()
                )

                if not user:
                    user = User(
                        platform="X",
                        username=username,
                        display_name=username,
                        followers_count=0,
                        following_count=0,
                    )

                    db.add(user)
                    db.flush()

                # Dataset has no timestamp.
                # Use deterministic ordering rather than random values.
                timestamp = datetime(2024, 1, 1) + timedelta(
                    minutes=index
                )

                post = Post(
                    platform="X",
                    user_id=user.id,
                    text=text,
                    timestamp=timestamp,
                    likes=0,
                    shares=0,
                    replies=0,
                )

                db.add(post)
                db.flush()

                if sentiment in {"positive", "negative", "neutral"}:
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
                        f"X: imported {imported:,} "
                        f"/ processed {index + 1:,} / {total_rows:,}"
                    )

        db.commit()

        print("\n================================")
        print("X DATASET IMPORT COMPLETE")
        print("================================")
        print(f"Imported : {imported:,}")
        print(f"Skipped  : {skipped:,}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_x_dataset()