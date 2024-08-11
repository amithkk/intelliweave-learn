from typing import List

from langchain_core.documents import Document
from langchain_core.messages import AIMessage
from typing_extensions import TypedDict


from graph_agent.agent import Outline, SubjectMatterExpert, InterviewState, RelatedSubjects, LessonSection, generate_outline_direct, \
    expand_topics, survey_subjects, interview_graph, refine_outline_chain, vectorstore, section_writer, writer, \
    creative_llm


class ResearchState(TypedDict):
    topic: str
    outline: Outline
    refined_outline: Outline
    editors: List[SubjectMatterExpert]
    interview_results: List[InterviewState]
    related_subjects: RelatedSubjects
    # The final sections output
    sections: List[LessonSection]
    article: str


async def initialize_research(state: ResearchState):
    topic = state["topic"]

    result = await generate_outline_direct.ainvoke({"topic": topic}),

    return {
        **state,
        "outline": result,
    }


async def topic_expansion(state: ResearchState):
    topic = state["topic"]
    related_subjects = await expand_topics.ainvoke(topic)
    return {
        **state,
        "related_subjects": related_subjects,
    }


async def create_smes(state: ResearchState):
    topic = state["topic"]
    related_subjects = state["related_subjects"]
    result = await survey_subjects.ainvoke({"topic": topic, "related_subjects": related_subjects})
    return {
        **state,
        "editors": result.editors,
    }


async def conduct_interviews(state: ResearchState):
    topic = state["topic"]
    initial_states = [
        {
            "editor": editor,
            "messages": [
                AIMessage(
                    content=f"So you said you were writing an article on {topic}?",
                    name="SubjectMatterExpert",
                )
            ],
        }
        for editor in state["editors"]
    ]
    # We call in to the sub-graph here to parallelize the interviews
    interview_results = await interview_graph.abatch(initial_states)

    return {
        **state,
        "interview_results": interview_results,
    }


def format_conversation(interview_state):
    messages = interview_state["messages"]
    convo = "\n".join(f"{m.name}: {m.content}" for m in messages)
    return f'Conversation with {interview_state["editor"].name}\n\n' + convo


async def refine_outline(state: ResearchState):
    convos = "\n\n".join(
        [
            format_conversation(interview_state)
            for interview_state in state["interview_results"]
        ]
    )

    updated_outline = await refine_outline_chain.ainvoke(
        {
            "topic": state["topic"],
            "old_outline": state["outline"],
            "conversations": convos,
        }
    )
    return {**state, "refined_outline": updated_outline}


async def index_references(state: ResearchState):
    all_docs = []
    for interview_state in state["interview_results"]:
        reference_docs = [
            Document(page_content=v, metadata={"source": k})
            for k, v in interview_state["references"].items()
        ]
        all_docs.extend(reference_docs)
    await vectorstore.aadd_documents(all_docs)
    return state


async def write_sections(state: ResearchState):
    outline = state["refined_outline"]
    sections = await section_writer.abatch(
        [
            {
                "outline": outline.as_str,
                "section": section.section_title,
                "topic": state["topic"],
            }
            for section in outline.sections
        ]
    )
    return {
        **state,
        "sections": sections,
    }


async def write_article(state: ResearchState):
    topic = state["topic"]
    sections = state["sections"]
    draft = "\n\n".join([section.as_str for section in sections])
    article = await writer.ainvoke({"topic": topic, "draft": draft})
    return {
        **state,
        "article": article,
    }

async def incorporate_imagery(state: ResearchState):
    article = state["article"]
    article_with_img_vid_embed = await som_playwright.ainvoke(article, "AZW1")
    return {
        **state,
        "article": article_with_img_vid_embed,
    }
