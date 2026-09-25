from backend.database import SessionLocal
from backend.models import Trend, Alert


def generate_alerts():
    db = SessionLocal()

    try:
        trends = (
            db.query(Trend)
            .order_by(Trend.trend_score.desc())
            .all()
        )

        if not trends:
            print("No trend data found.")
            return

        alerts_created = 0

        for trend in trends:

            if trend.trend_status != "rising":
                continue

            existing_alert = (
                db.query(Alert)
                .filter(
                    Alert.alert_type == "rising_trend",
                    Alert.topic == trend.topic
                )
                .first()
            )

            if existing_alert:
                continue

            severity = "high"

            if trend.growth_rate < 50:
                severity = "medium"

            alert = Alert(
                alert_type="rising_trend",
                title=f"{trend.topic} is trending",
                message=(
                    f"Discussion about {trend.topic} "
                    f"increased by "
                    f"{trend.growth_rate:.2f}%."
                ),
                severity=severity,
                topic=trend.topic
            )

            db.add(alert)
            alerts_created += 1

        db.commit()

        print(
            f"Intelligence analysis completed. "
            f"Alerts created: {alerts_created}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    generate_alerts()