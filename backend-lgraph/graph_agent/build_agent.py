from langgraph.graph import StateGraph

from graph_agent.agent import memory
from graph_agent.research_state import ResearchState, initialize_research, topic_expansion, create_smes, \
    conduct_interviews, refine_outline, index_references, write_sections, write_article

iw_builder = StateGraph(ResearchState)


nodes = [
    ("init_research", initialize_research),
    ("topic_expansion", topic_expansion),
    ("create_smes", create_smes),
    ("conduct_interviews", conduct_interviews),
    ("index_references", index_references),
    ("refine_outline", refine_outline),
    ("write_sections", write_sections),
    ("write_article", write_article),
    ("incorporate_imagery", incorporate_img)
]


for i in range(len(nodes)):
    name, node = nodes[i]
    iw_builder.add_node(name, node)
    if i > 0:
        iw_builder.add_edge(nodes[i - 1][0], name)

iw_builder.set_entry_point(nodes[0][0])
iw_builder.set_finish_point(nodes[-1][0])

iw_persist = iw_builder.compile(checkpointer=memory, interrupt_before=["write_article"])
