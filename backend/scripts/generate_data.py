import random
from datetime import datetime, timedelta

from faker import Faker

from backend.database import SessionLocal
from backend.models import User, Post, Interaction


fake = Faker()


POST_TEMPLATES = {
    "AI": [
        "AI is changing the way people work and learn.",
        "The latest AI tools are becoming incredibly useful.",
        "Artificial intelligence could transform many industries.",
        "AI development is moving faster than expected.",
        "Students should learn how to use AI responsibly.",
    ],
    "Cybersecurity": [
        "Cybersecurity awareness is becoming more important.",
        "People need to take online security more seriously.",
        "Strong passwords and authentication can prevent many attacks.",
        "Cybersecurity should be taught from an early age.",
        "Data privacy is becoming a major concern.",
    ],
    "Technology": [
        "Technology is changing the way we communicate.",
        "New technology is making everyday tasks easier.",
        "The tech industry is evolving extremely quickly.",
        "Smart devices are becoming part of everyday life.",
        "Technology can solve many real-world problems.",
    ],
    "Education": [
        "Education needs to adapt to new technology.",
        "Students need more practical learning opportunities.",
        "Online education has changed how students learn.",
        "Technology can make education more accessible.",
        "Learning new skills is becoming increasingly important.",
    ],
    "Climate": [
        "Climate change requires long-term action.",
        "People should become more aware of environmental issues.",
        "Renewable energy could help reduce emissions.",
        "Climate awareness is increasing among young people.",
        "Protecting the environment should be a priority.",
    ],
    "Space": [
        "Space exploration continues to produce amazing discoveries.",
        "Humanity may eventually establish permanent space stations.",
        "New space missions are expanding our understanding of the universe.",
        "Space technology is improving rapidly.",
        "The future of space exploration looks exciting.",
    ],
}


def generate_posts(count=100):
    db = SessionLocal()

    try:
        users = db.query(User).all()

        if not users:
            print("No users found. Generate users first.")
            return

        for _ in range(count):
            topic = random.choice(list(POST_TEMPLATES.keys()))
            text = random.choice(POST_TEMPLATES[topic])

            user = random.choice(users)

            timestamp = datetime.now() - timedelta(
                hours=random.randint(0, 168)
            )

            post = Post(
                platform=user.platform,
                user_id=user.id,
                text=text,
                timestamp=timestamp,
                likes=random.randint(0, 1000),
                shares=random.randint(0, 300),
                replies=random.randint(0, 150),
            )

            db.add(post)

        db.commit()

        print(f"Successfully created {count} posts.")

    finally:
        db.close()




def generate_interactions(count=300):
    db = SessionLocal()

    try:
        users = db.query(User).all()
        posts = db.query(Post).all()

        if len(users) < 2:
            print("Not enough users to create interactions.")
            return

        if not posts:
            print("No posts found. Generate posts first.")
            return

        interaction_types = [
            "reply",
            "share",
            "mention"
        ]

        for _ in range(count):
            source_user = random.choice(users)
            target_user = random.choice(users)

            while target_user.id == source_user.id:
                target_user = random.choice(users)

            post = random.choice(posts)

            interaction = Interaction(
                source_user_id=source_user.id,
                target_user_id=target_user.id,
                post_id=post.id,
                interaction_type=random.choice(interaction_types),
                timestamp=post.timestamp + timedelta(
                    minutes=random.randint(1, 120)
                )
            )

            db.add(interaction)

        db.commit()

        print(f"Successfully created {count} interactions.")

    finally:
        db.close()


if __name__ == "__main__":
   generate_interactions()