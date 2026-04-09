def create_mindmap_from_text(text: str):
    """
    Convert lesson text into jsMind-compatible node_tree format
    """

    sentences = text.split(".")
    root_topic = "Lesson Summary"

    children_nodes = []

    for i, sentence in enumerate(sentences[:12]):
        clean = sentence.strip()
        if clean:
            children_nodes.append({
                "id": f"node{i}",
                "topic": clean[:60],
                "children": []
            })

    return {
        "id": "root",
        "topic": root_topic,
        "children": children_nodes
    }
