import pandas as pd

from backend.database import SessionLocal
from backend.models import User, Post


EXCEL_FILE = "data/telegram/FAS_SMIDGE_TelegramMessages_2023-2024.xlsx"
BATCH_SIZE = 2000


def import_telegram_dataset():
    db = SessionLocal()

    try:
        df = pd.read_excel(
            EXCEL_FILE,
            sheet_name="Tabelle1"
        )

        imported = 0
        skipped = 0

        total_rows = len(df)

        for index, row in df.iterrows():

            text = str(row.get("message_clean", "")).strip()
            channel = str(row.get("channel_name", "")).strip()
            date_value = row.get("date")

            if (
                not text
                or text.lower() == "nan"
                or not channel
                or channel.lower() == "nan"
                or pd.isna(date_value)
            ):
                skipped += 1
                continue

            try:
                timestamp = pd.to_datetime(date_value).to_pydatetime()
            except Exception:
                skipped += 1
                continue

            username = f"telegram_{channel[:80]}"

            user = (
                db.query(User)
                .filter(
                    User.platform == "Telegram",
                    User.username == username
                )
                .first()
            )

            if not user:
                language_value = row.get("lang")

                language = (
                    str(language_value).strip()
                    if not pd.isna(language_value)
                    else None
                )

                user = User(
                    platform="Telegram",
                    username=username,
                    display_name=channel,
                    language=language,
                    followers_count=0,
                    following_count=0,
                )

                db.add(user)
                db.flush()

            existing = (
                db.query(Post)
                .filter(
                    Post.platform == "Telegram",
                    Post.text == text,
                    Post.timestamp == timestamp,
                    Post.user_id == user.id,
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            post = Post(
                platform="Telegram",
                user_id=user.id,
                text=text,
                timestamp=timestamp,
                likes=0,
                shares=0,
                replies=0,
            )

            db.add(post)

            imported += 1

            if imported % BATCH_SIZE == 0:
                db.commit()
                print(
                    f"Telegram: imported {imported:,} "
                    f"/ processed {index + 1:,} / {total_rows:,}"
                )

        db.commit()

        print("\n================================")
        print("TELEGRAM DATASET IMPORT COMPLETE")
        print("================================")
        print(f"Imported : {imported:,}")
        print(f"Skipped  : {skipped:,}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_telegram_dataset()