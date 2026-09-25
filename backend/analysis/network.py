import networkx as nx

from backend.database import SessionLocal
from backend.models import Interaction, NetworkMetric, User


def build_network(db):
    graph = nx.DiGraph()

    interactions = db.query(Interaction).all()

    for interaction in interactions:
        source = interaction.source_user_id
        target = interaction.target_user_id

        if graph.has_edge(source, target):
            graph[source][target]["weight"] += 1
        else:
            graph.add_edge(
                source,
                target,
                weight=1
            )

    return graph


def calculate_network_metrics(graph, db):
    interaction_counts = {}

    for user_id in graph.nodes():

        total_interactions = (
            graph.in_degree(user_id, weight="weight")
            + graph.out_degree(user_id, weight="weight")
        )

        interaction_counts[user_id] = total_interactions

    max_interactions = max(interaction_counts.values(), default=1)

    users = db.query(User).all()

    follower_counts = {
        user.id: user.followers_count
        for user in users
    }

    max_followers = max(
        follower_counts.values(),
        default=1
    )

    for user_id, interaction_count in interaction_counts.items():

        follower_count = follower_counts.get(
            user_id,
            0
        )

        interaction_score = (
            interaction_count / max_interactions
        )

        follower_score = (
            follower_count / max_followers
        )

        influence_score = (
            0.7 * interaction_score
            + 0.3 * follower_score
        )

        existing_metric = (
            db.query(NetworkMetric)
            .filter(
                NetworkMetric.user_id == user_id
            )
            .first()
        )

        if existing_metric:
            existing_metric.degree_centrality = interaction_count
            existing_metric.influence_score = influence_score

        else:
            metric = NetworkMetric(
                user_id=user_id,
                degree_centrality=interaction_count,
                influence_score=influence_score
            )

            db.add(metric)
            
def analyze_network():
    db = SessionLocal()

    try:
        graph = build_network(db)

        if graph.number_of_nodes() == 0:
            print("No network data found.")
            return

        calculate_network_metrics(graph, db)

        db.commit()

        print(
            f"Network analysis completed. "
            f"Nodes: {graph.number_of_nodes()}, "
            f"Edges: {graph.number_of_edges()}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    analyze_network()