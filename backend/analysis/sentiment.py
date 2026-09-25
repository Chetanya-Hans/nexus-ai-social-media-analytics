from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
from backend.database import SessionLocal
from backend.models import Post, Sentiment


analyzer = SentimentIntensityAnalyzer()

def contains_keyword(text, keywords):
    return any(
        re.search(rf"\b{re.escape(word)}\b", text)
        for word in keywords
    )

def analyze_sentiment(text: str):
    scores = analyzer.polarity_scores(text)

    compound = scores["compound"]

    if compound >= 0.05:
        sentiment = "positive"
    elif compound <= -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    emotion = detect_emotion(text, sentiment)

    return {
        "sentiment": sentiment,
        "emotion": emotion,
        "confidence": abs(compound)
    }


def detect_emotion(text: str, sentiment: str):
    text_lower = text.lower()

    excitement_words = [
        "amazing",
        "awesome",
        "excited",
        "fantastic",
        "love",
        "great",
        "wonderful"
    ]

    support_words = [
        "support",
        "agree",
        "back",
        "approve",
        "should",
        "good idea"
    ]

    anxiety_words = [
        "worried",
        "worry",
        "afraid",
        "scared",
        "concerned",
        "anxiety",
        "danger"
    ]

    anger_words = [
        "angry",
        "furious",
        "hate",
        "terrible",
        "ridiculous",
        "useless",
        "outrage"
    ]

    opposition_words = [
        "disagree",
        "oppose",
        "against",
        "reject",
        "wrong",
        "cannot support"
    ]

    if contains_keyword(text_lower, excitement_words):
        return "excitement"

    if contains_keyword(text_lower, support_words):
        return "support"

    if contains_keyword(text_lower, anxiety_words):
        return "anxiety"

    if contains_keyword(text_lower, anger_words):
        return "anger"

    if contains_keyword(text_lower, opposition_words):
        return "opposition"

    return "neutral"

def analyze_all_posts():
    db = SessionLocal()

    try:
        posts = db.query(Post).all()

        if not posts:
            print("No posts found.")
            return

        analyzed_count = 0

        for post in posts:
            existing_result = (
                db.query(Sentiment)
                .filter(Sentiment.post_id == post.id)
                .first()
            )

            if existing_result:
                result = analyze_sentiment(post.text)

                existing_result.sentiment = result["sentiment"]
                existing_result.emotion = result["emotion"]
                existing_result.confidence = result["confidence"]
                continue

            result = analyze_sentiment(post.text)

            sentiment_result = Sentiment(
                post_id=post.id,
                sentiment=result["sentiment"],
                emotion=result["emotion"],
                confidence=result["confidence"]
            )

            db.add(sentiment_result)
            analyzed_count += 1

        db.commit()

        print(
            f"Successfully analyzed {analyzed_count} posts."
        )

    finally:
        db.close()


if __name__ == "__main__":
    analyze_all_posts()


if __name__ == "__main__":
    test_sentences = [
        "This new AI tool is absolutely amazing!",
        "I completely support this technology.",
        "I am really worried about AI safety.",
        "This update is terrible and useless.",
        "I strongly disagree with this decision.",
        "The company announced a new AI model today."
    ]

    for sentence in test_sentences:
        result = analyze_sentiment(sentence)

        print(sentence)
        print(result)
        print()