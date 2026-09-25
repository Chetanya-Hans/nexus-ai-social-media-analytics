import re


from collections import Counter
from sqlalchemy import func

from backend.database import SessionLocal
from backend.models import Post, Topic


# ============================================================
# TOPIC TAXONOMY
# ============================================================
#
# The taxonomy is intentionally richer than the original
# 11-topic dictionary. Keywords are taken from the kinds of
# narratives actually present in the supplied datasets.
#
# Each post receives ONE primary topic and ONE subtopic.
# ============================================================

TOPIC_RULES = {
    "AI": {
        "keywords": [
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "neural network",
            "generative ai",
            "chatgpt",
            "openai",
            "gpt",
            "llm",
            "ai model",
            "ai",
        ],
        "subtopics": {
            "Generative AI": [
                "generative ai",
                "chatgpt",
                "openai",
                "gpt",
                "llm",
                "text generation",
                "image generation",
            ],
            "Machine Learning": [
                "machine learning",
                "deep learning",
                "neural network",
                "training model",
                "classification",
            ],
        },
    },

    "Technology": {
        "keywords": [
            "technology",
            "software",
            "hardware",
            "computer",
            "smartphone",
            "phone",
            "mobile",
            "app",
            "application",
            "internet",
            "cloud",
            "digital",
            "device",
            "gadget",
            "innovation",
            "programming",
            "developer",
            "coding",
        ],
        "subtopics": {
            "Software & Apps": [
                "software",
                "app",
                "application",
                "programming",
                "developer",
                "coding",
            ],
            "Internet & Digital": [
                "internet",
                "web",
                "digital",
                "online",
                "social media",
            ],
            "Gadgets & Devices": [
                "smartphone",
                "phone",
                "mobile",
                "device",
                "gadget",
                "laptop",
                "computer",
            ],
        },
    },

    "Cybersecurity": {
        "keywords": [
            "cybersecurity",
            "cyber security",
            "hacking",
            "hacker",
            "hack",
            "malware",
            "ransomware",
            "phishing",
            "password",
            "privacy",
            "authentication",
            "encryption",
            "firewall",
            "data breach",
            "data leak",
        ],
        "subtopics": {
            "Cyber Attacks": [
                "hack",
                "hacker",
                "hacking",
                "malware",
                "ransomware",
                "phishing",
            ],
            "Privacy & Security": [
                "privacy",
                "password",
                "authentication",
                "encryption",
                "firewall",
                "data breach",
                "data leak",
            ],
        },
    },

    "Indian Politics": {
        "keywords": [
            "india",
            "indian",
            "modi",
            "narendra modi",
            "bjp",
            "congress",
            "rahul gandhi",
            "aap",
            "kejriwal",
            "lok sabha",
            "rajya sabha",
            "election",
            "elections",
            "vote",
            "voting",
            "minister",
            "government",
            "govt",
            "parliament",
            "political",
            "politics",
            "policy",
        ],
        "subtopics": {
            "Indian Elections": [
                "election",
                "elections",
                "vote",
                "voting",
                "lok sabha",
                "poll",
            ],
            "Government & Policy": [
                "government",
                "govt",
                "minister",
                "parliament",
                "policy",
            ],
            "Indian Political Parties": [
                "modi",
                "narendra modi",
                "bjp",
                "congress",
                "rahul gandhi",
                "aap",
                "kejriwal",
            ],
        },
    },

    "US Politics": {
        "keywords": [
            "trump",
            "donald trump",
            "biden",
            "joe biden",
            "republican",
            "democrat",
            "democrats",
            "gop",
            "white house",
            "senate",
            "congress",
            "america",
            "american",
            "election",
            "president",
            "presidential",
        ],
        "subtopics": {
            "US Elections": [
                "election",
                "presidential",
                "president",
                "vote",
                "voting",
            ],
            "US Government": [
                "white house",
                "senate",
                "congress",
                "government",
            ],
            "Political Parties": [
                "republican",
                "democrat",
                "democrats",
                "gop",
            ],
        },
    },

    "Religion & Spirituality": {
        "keywords": [
            "religion",
            "religious",
            "spiritual",
            "spirituality",
            "buddhism",
            "buddhist",
            "christianity",
            "christian",
            "jesus",
            "church",
            "hindu",
            "hinduism",
            "islam",
            "muslim",
            "quran",
            "allah",
            "god",
            "bible",
            "prayer",
            "meditation",
            "buddha",
        ],
        "subtopics": {
            "Buddhism": [
                "buddhism",
                "buddhist",
                "buddha",
                "meditation",
            ],
            "Christianity": [
                "christianity",
                "christian",
                "jesus",
                "church",
                "bible",
            ],
            "Hinduism": [
                "hindu",
                "hinduism",
                "temple",
                "vedas",
            ],
            "Islam": [
                "islam",
                "muslim",
                "quran",
                "allah",
                "mosque",
            ],
        },
    },

    "Sports": {
        "keywords": [
            "sports",
            "sport",
            "cricket",
            "football",
            "soccer",
            "ipl",
            "match",
            "player",
            "team",
            "tournament",
            "score",
            "goal",
            "runs",
            "wicket",
            "league",
            "championship",
        ],
        "subtopics": {
            "Cricket": [
                "cricket",
                "ipl",
                "wicket",
                "runs",
                "batting",
                "bowling",
            ],
            "Football": [
                "football",
                "soccer",
                "goal",
                "premier league",
                "fifa",
            ],
            "Sports Events": [
                "match",
                "tournament",
                "league",
                "championship",
            ],
        },
    },

    "Business & Finance": {
        "keywords": [
            "business",
            "economy",
            "economic",
            "market",
            "stock",
            "stocks",
            "share",
            "shares",
            "finance",
            "financial",
            "investment",
            "investor",
            "company",
            "companies",
            "startup",
            "revenue",
            "profit",
            "trade",
            "bank",
            "banking",
            "crypto",
            "bitcoin",
            "cryptocurrency",
        ],
        "subtopics": {
            "Markets & Stocks": [
                "stock",
                "stocks",
                "market",
                "shares",
                "investment",
                "investor",
            ],
            "Business & Startups": [
                "business",
                "company",
                "companies",
                "startup",
                "revenue",
                "profit",
            ],
            "Cryptocurrency": [
                "crypto",
                "bitcoin",
                "cryptocurrency",
                "ethereum",
                "blockchain",
            ],
        },
    },

    "Education": {
        "keywords": [
            "education",
            "student",
            "students",
            "school",
            "teacher",
            "teachers",
            "university",
            "college",
            "exam",
            "exams",
            "course",
            "degree",
            "study",
            "academic",
            "campus",
            "learning",
        ],
        "subtopics": {
            "Students & Exams": [
                "student",
                "students",
                "exam",
                "exams",
                "study",
            ],
            "Higher Education": [
                "university",
                "college",
                "degree",
                "campus",
            ],
            "Learning & Courses": [
                "course",
                "learning",
                "education",
                "teacher",
                "teachers",
            ],
        },
    },

    "Health & Wellness": {
        "keywords": [
            "health",
            "healthy",
            "medical",
            "medicine",
            "doctor",
            "hospital",
            "disease",
            "vaccine",
            "covid",
            "wellness",
            "fitness",
            "exercise",
            "mental health",
            "nutrition",
            "diet",
        ],
        "subtopics": {
            "Healthcare": [
                "health",
                "medical",
                "medicine",
                "doctor",
                "hospital",
                "disease",
            ],
            "Fitness & Wellness": [
                "fitness",
                "exercise",
                "wellness",
                "nutrition",
                "diet",
            ],
            "Mental Health": [
                "mental health",
                "anxiety",
                "depression",
                "stress",
            ],
        },
    },

    "Climate & Environment": {
        "keywords": [
            "climate",
            "environment",
            "environmental",
            "renewable",
            "emissions",
            "pollution",
            "carbon",
            "sustainability",
            "global warming",
            "green energy",
            "ecology",
            "weather",
            "temperature",
        ],
        "subtopics": {
            "Climate Change": [
                "climate",
                "global warming",
                "emissions",
                "carbon",
            ],
            "Environment & Pollution": [
                "environment",
                "environmental",
                "pollution",
                "ecology",
            ],
            "Renewable Energy": [
                "renewable",
                "green energy",
                "solar",
                "wind energy",
                "sustainability",
            ],
        },
    },

    "Science & Space": {
        "keywords": [
            "science",
            "scientific",
            "space",
            "universe",
            "planet",
            "astronaut",
            "nasa",
            "isro",
            "rocket",
            "satellite",
            "mars",
            "moon",
            "physics",
            "biology",
            "chemistry",
        ],
        "subtopics": {
            "Space Exploration": [
                "space",
                "nasa",
                "isro",
                "rocket",
                "satellite",
                "mars",
                "moon",
                "astronaut",
            ],
            "Science": [
                "science",
                "scientific",
                "physics",
                "biology",
                "chemistry",
            ],
        },
    },

    "Entertainment & Media": {
        "keywords": [
            "movie",
            "movies",
            "film",
            "films",
            "music",
            "song",
            "songs",
            "celebrity",
            "bollywood",
            "hollywood",
            "entertainment",
            "show",
            "series",
            "actor",
            "actress",
            "concert",
            "netflix",
            "youtube",
            "media",
        ],
        "subtopics": {
            "Movies & Films": [
                "movie",
                "movies",
                "film",
                "films",
                "bollywood",
                "hollywood",
                "actor",
                "actress",
            ],
            "Music": [
                "music",
                "song",
                "songs",
                "concert",
            ],
            "Digital Media": [
                "netflix",
                "youtube",
                "media",
                "series",
                "show",
            ],
        },
    },

    "Society & Culture": {
        "keywords": [
            "society",
            "social",
            "culture",
            "cultural",
            "community",
            "people",
            "human rights",
            "rights",
            "family",
            "gender",
            "women",
            "men",
            "children",
            "youth",
            "identity",
        ],
        "subtopics": {
            "Social Issues": [
                "society",
                "social",
                "community",
                "rights",
                "human rights",
            ],
            "Culture & Identity": [
                "culture",
                "cultural",
                "identity",
                "gender",
            ],
            "Family & Youth": [
                "family",
                "children",
                "youth",
                "women",
                "men",
            ],
        },
    },

    "Travel & Lifestyle": {
        "keywords": [
            "travel",
            "trip",
            "vacation",
            "holiday",
            "tourism",
            "hotel",
            "restaurant",
            "food",
            "cooking",
            "recipe",
            "lifestyle",
            "fashion",
            "shopping",
        ],
        "subtopics": {
            "Travel": [
                "travel",
                "trip",
                "vacation",
                "holiday",
                "tourism",
                "hotel",
            ],
            "Food & Cooking": [
                "food",
                "cooking",
                "recipe",
                "restaurant",
            ],
            "Lifestyle": [
                "lifestyle",
                "fashion",
                "shopping",
            ],
        },
    },

    "International Affairs": {
        "keywords": [
            "international",
            "foreign",
            "global",
            "war",
            "conflict",
            "ukraine",
            "russia",
            "china",
            "israel",
            "palestine",
            "nato",
            "united nations",
            "geopolitics",
        ],
        "subtopics": {
            "Geopolitics": [
                "geopolitics",
                "international",
                "foreign",
                "global",
                "nato",
                "united nations",
            ],
            "Global Conflicts": [
                "war",
                "conflict",
                "ukraine",
                "russia",
                "israel",
                "palestine",
            ],
        },
    },
}


KEYWORD_INDEX = []

for topic_name, rules in TOPIC_RULES.items():

    for keyword in rules["keywords"]:

        KEYWORD_INDEX.append(
            (
                keyword.lower(),
                topic_name,
                rules["subtopics"],
            )
        )

KEYWORD_INDEX.sort(
    key=lambda item: len(item[0]),
    reverse=True,
)


def _keyword_score(text: str, keywords: list[str]) -> int:
    """
    Weighted keyword matching.

    Multi-word phrases are stronger signals than single words.
    """
    score = 0

    for keyword in keywords:
        if keyword in text:
            if " " in keyword:
                score += 3
            else:
                score += 1

    return score


def _keyword_matches(text: str, keyword: str) -> bool:
    """
    Match keywords as words/phrases rather than arbitrary
    substrings.
    """

    keyword = keyword.lower().strip()

    if not keyword:
        return False

    pattern = r"(?<!\w)" + re.escape(keyword) + r"(?!\w)"

    return re.search(pattern, text) is not None
    


def detect_topic(text: str):

    if not text:
        return {
            "topic": "Other",
            "subtopic": None,
            "confidence": 0.0,
        }

    text_lower = text.lower()

    topic_scores = {}

    for keyword, topic_name, _ in KEYWORD_INDEX:

        if _keyword_matches(text_lower, keyword):

            if " " in keyword:
                weight = 3
            else:
                weight = 1

            topic_scores[topic_name] = (
                topic_scores.get(topic_name, 0)
                + weight
            )

    if not topic_scores:

        return {
            "topic": "Other",
            "subtopic": None,
            "confidence": 0.0,
        }

    best_topic = max(
        topic_scores,
        key=topic_scores.get,
    )

    best_score = topic_scores[best_topic]

    subtopic_scores = {}

    for subtopic, keywords in TOPIC_RULES[
        best_topic
    ]["subtopics"].items():

        for keyword in keywords:

            if _keyword_matches(text_lower, keyword):

                weight = (
                    3
                    if " " in keyword
                    else 1
                )

                subtopic_scores[subtopic] = (
                    subtopic_scores.get(
                        subtopic,
                        0
                    )
                    + weight
                )

    subtopic = None

    if subtopic_scores:

        subtopic = max(
            subtopic_scores,
            key=subtopic_scores.get,
        )

    confidence = min(
        0.35 + best_score * 0.12,
        0.98,
    )

    return {
        "topic": best_topic,
        "subtopic": subtopic,
        "confidence": round(
            confidence,
            3,
        ),
    }


def analyze_all_posts():
    """
    Classify all posts safely using ID-based pagination.

    Keyset pagination prevents posts from being skipped when some
    posts have NULL text and is much safer than OFFSET pagination
    for large datasets.
    """

    db = SessionLocal()

    try:
        total_posts = (
            db.query(Post)
            .filter(Post.text.isnot(None))
            .count()
        )

        print()
        print("========================================")
        print("STARTING TOPIC ANALYSIS")
        print("========================================")
        print(f"Posts with text: {total_posts:,}")
        print()

        batch_size = 2000
        last_id = 0

        processed = 0
        created = 0
        updated = 0

        while True:

            posts = (
                db.query(Post.id, Post.text)
                .filter(
                    Post.id > last_id,
                    Post.text.isnot(None)
                )
                .order_by(Post.id)
                .limit(batch_size)
                .all()
            )

            if not posts:
                break

            for post_id, text in posts:

                result = detect_topic(text)

                if result["subtopic"]:
                    stored_topic = (
                        f"{result['topic']} — "
                        f"{result['subtopic']}"
                    )
                else:
                    stored_topic = result["topic"]

                existing = (
                    db.query(Topic)
                    .filter(Topic.post_id == post_id)
                    .first()
                )

                if existing:
                    existing.topic = stored_topic
                    existing.confidence = result["confidence"]
                    updated += 1

                else:
                    db.add(
                        Topic(
                            post_id=post_id,
                            topic=stored_topic,
                            confidence=result["confidence"],
                        )
                    )
                    created += 1

                processed += 1

            db.commit()

            last_id = posts[-1][0]

            print(
                f"Topic analysis: "
                f"{processed:,} / {total_posts:,} posts "
                f"| created={created:,} "
                f"updated={updated:,}"
            )

        print()
        print("========================================")
        print("TOPIC ANALYSIS COMPLETE")
        print("========================================")
        print(f"Processed : {processed:,}")
        print(f"Created   : {created:,}")
        print(f"Updated   : {updated:,}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    analyze_all_posts()