from collections import Counter

from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

from backend.database import SessionLocal
from backend.models import Post


def discover_topics(n_topics=8, max_features=1000):
    db = SessionLocal()

    try:
        posts = (
            db.query(Post)
            .filter(Post.text.isnot(None))
            .all()
        )

        if not posts:
            print("No posts found.")
            return []

        texts = [post.text.strip() for post in posts if post.text.strip()]

        if len(texts) < n_topics:
            n_topics = len(texts)

        if n_topics < 2:
            print("Not enough posts for topic discovery.")
            return []

        # Convert post text into TF-IDF vectors.
        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=max_features,
            min_df=2,
            max_df=0.95,
            ngram_range=(1, 2),
        )

        matrix = vectorizer.fit_transform(texts)

        # Group similar posts together.
        model = KMeans(
            n_clusters=n_topics,
            random_state=42,
            n_init=10,
        )

        labels = model.fit_predict(matrix)

        terms = vectorizer.get_feature_names_out()

        results = []

        for cluster_id in range(n_topics):
            cluster_indices = [
                i for i, label in enumerate(labels)
                if label == cluster_id
            ]

            if not cluster_indices:
                continue

            # Find the most important words for this cluster.
            center = model.cluster_centers_[cluster_id]

            top_indices = center.argsort()[-8:][::-1]

            keywords = [
                terms[index]
                for index in top_indices
            ]

            results.append({
                "cluster": cluster_id + 1,
                "post_count": len(cluster_indices),
                "keywords": keywords,
            })

        results.sort(
            key=lambda item: item["post_count"],
            reverse=True
        )

        return results

    finally:
        db.close()


if __name__ == "__main__":
    topics = discover_topics(n_topics=8)

    print()
    print("================================")
    print("DISCOVERED TOPICS")
    print("================================")

    for topic in topics:
        print()
        print(
            f"Topic {topic['cluster']} "
            f"({topic['post_count']} posts)"
        )
        print(
            "Keywords:",
            ", ".join(topic["keywords"])
        )