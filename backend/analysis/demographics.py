from backend.database import SessionLocal
from backend.models import User, DemographicProfile


INTEREST_KEYWORDS = {
    "Technology": [
        "technology",
        "tech",
        "software",
        "developer",
        "programming",
        "coding",
        "computer",
        "it"
    ],

    "Artificial Intelligence": [
        "ai",
        "artificial intelligence",
        "machine learning",
        "ml",
        "deep learning",
        "neural network"
    ],

    "Cybersecurity": [
        "cybersecurity",
        "security",
        "ethical hacking",
        "hacking",
        "privacy",
        "network security"
    ],

    "Education": [
        "student",
        "education",
        "teacher",
        "learning",
        "college",
        "university",
        "academic"
    ],

    "Business": [
        "business",
        "entrepreneur",
        "startup",
        "founder",
        "marketing",
        "finance"
    ]
}


def detect_interest(bio):
    if not bio:
        return "General"

    bio_lower = bio.lower()

    scores = {}

    for interest, keywords in INTEREST_KEYWORDS.items():
        score = 0

        for keyword in keywords:
            if keyword in bio_lower:
                score += 1

        if score > 0:
            scores[interest] = score

    if not scores:
        return "General"

    return max(scores, key=scores.get)


def analyze_demographics():
    db = SessionLocal()

    try:
        users = db.query(User).all()

        if not users:
            print("No users found.")
            return

        analyzed_count = 0

        for user in users:

            interest = detect_interest(user.bio)

            existing_profile = (
                db.query(DemographicProfile)
                .filter(
                    DemographicProfile.user_id == user.id
                )
                .first()
            )

            if existing_profile:
                existing_profile.interest = interest
                continue

            profile = DemographicProfile(
                user_id=user.id,
                interest=interest
            )

            db.add(profile)
            analyzed_count += 1

        db.commit()

        print(
            f"Demographic analysis completed. "
            f"Users processed: {len(users)}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    analyze_demographics()