from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_vertexai import ChatVertexAI
import os

from langchain_core.output_parsers import StrOutputParser

from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.retrievers import WikipediaRetriever
from langchain_core.runnables import RunnableLambda, chain as as_runnable
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage
from typing import Annotated
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
# from langchain_google_alloydb_pg import AlloyDBEngine, AlloyDBVectorStore

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.aiosqlite import AsyncSqliteSaver
import json
from langgraph.checkpoint.base import CheckpointAt
from amithlgmodules.set_of_marks import SomPlaywrightRunner, BrowserType

# Add firestore support
from langchain_google_firestore import FirestoreVectorStore

from config import settings

os.environ["LANGCHAIN_TRACING_V2"] = "true"
embeddings = GoogleGenerativeAIEmbeddings(model=settings.VERTEX_EMBEDDING_MODEL)
memory = AsyncSqliteSaver.from_conn_string("persist.sqlite")

vectorstore = FirestoreVectorStore(
    collection=settings.FIRESTORE_VECTOR_COLLECTION,
    embedding_service=embeddings,
)

retriever = vectorstore.as_retriever(k=10)

memory.at = CheckpointAt.END_OF_RUN

creative_llm = ChatVertexAI(model=settings.VERTEX_LLM,
                 temperature=0.5, top_p=0.85)
precise_llm = ChatVertexAI(model=settings.VERTEX_LLM,
                 temperature=0.1, top_p=0.85)

som_playwright = SomPlaywrightRunner(
    llm=creative_llm,
    vector_store=vectorstore,
    use_browser=BrowserType.CHROMIUM
)

# Generate Outline Direct

direct_gen_outline_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an educational writer. Write an outline for a lesson about a user-provided topic. The outline may be inspired by wiki articles. Be comprehensive and specific.",
        ),
        ("user", "{topic}"),
    ]
)


class Subsection(BaseModel):
    subsection_title: str = Field(..., title="Title of the subsection")
    description: str = Field(..., title="Content of the subsection")

    @property
    def as_str(self) -> str:
        return f"### {self.subsection_title}\n\n{self.description}".strip()


class Section(BaseModel):
    section_title: str = Field(..., title="Title of the section")
    description: str = Field(..., title="Content of the section")
    subsections: Optional[List[Subsection]] = Field(
        default=None,
        title="Titles and descriptions for each subsection of the lesson",
    )

    @property
    def as_str(self) -> str:
        subsections = "\n\n".join(
            f"### {subsection.subsection_title}\n\n{subsection.description}"
            for subsection in self.subsections or []
        )
        return f"## {self.section_title}\n\n{self.description}\n\n{subsections}".strip()


class Outline(BaseModel):
    page_title: str = Field(..., title="Title of the lesson")
    sections: List[Section] = Field(
        default_factory=list,
        title="Titles and descriptions for each section of the lesson.",
    )

    @property
    def as_str(self) -> str:
        sections = "\n\n".join(section.as_str for section in self.sections)
        return f"# {self.page_title}\n\n{sections}".strip()


generate_outline_direct = direct_gen_outline_prompt | creative_llm.with_structured_output(
    Outline
)

# Expand Topics
gen_related_topics_prompt = ChatPromptTemplate.from_template(
    """I'm composing an educational lesson for a topic mentioned below. Please identify and recommend some wiki pages on closely related subjects. I'm looking for examples that provide insights into interesting aspects commonly associated with this topic, or examples that help me understand the typical content and structure included in educational lessons for similar topics.

Please list the as many subjects and urls as you can.

Topic of interest: {topic}
"""
)


class RelatedSubjects(BaseModel):
    topics: List[str] = Field(
        description="Comprehensive list of related subjects as background research.",
    )


expand_chain = gen_related_topics_prompt | creative_llm.with_structured_output(
    RelatedSubjects
)

@as_runnable
async def expand_topics(topic: str) -> RelatedSubjects:
    return await expand_chain.ainvoke({"topic":topic})


# Generate Perspectives

class SubjectMatterExpert(BaseModel):
    affiliation: str = Field(
        description="Primary affiliation of the Subject Matter Expert.",
    )
    name: str = Field(
        description="Name of the Subject Matter Expert.",
    )
    role: str = Field(
        description="Role of the Subject Matter Expert in the context of the topic.",
    )
    description: str = Field(
        description="Description of the Subject Matter Expert's focus, concerns, and motives.",
    )

    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nAffiliation: {self.affiliation}\nDescription: {self.description}\n"


class Perspectives(BaseModel):
    editors: List[SubjectMatterExpert] = Field(
        description="Comprehensive list of Subject Matter Expert with their roles and affiliations.",
    )


gen_perspectives_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You need to select a diverse (and distinct) group of Subject Matter Experts who will work together to create a comprehensive lesson/article on the topic. Each of them represents a different perspective, role, or affiliation related to this topic.\
    You can use  wiki pages of related topics for inspiration. For each editor, add a description of what they will focus on. The names of the editors must be composed of alphabets only with no symbols or spaces. Create upto 5 editors\

    Wiki page outlines of related topics for inspiration:
    {examples}""",
        ),
        ("user", "Topic of interest: {topic}"),
    ]
)

gen_perspectives_chain = gen_perspectives_prompt | creative_llm.with_structured_output(Perspectives)

# Survey Subjects


wikipedia_retriever = WikipediaRetriever(load_all_available_meta=True, top_k_results=1)


def format_doc(doc, max_length=1000):
    related = "- ".join(doc.metadata["categories"])
    return f"### {doc.metadata['title']}\n\nSummary: {doc.page_content}\n\nRelated\n{related}"[
        :max_length
    ]


def format_docs(docs):
    return "\n\n".join(format_doc(doc) for doc in docs)


@as_runnable
async def survey_subjects(args):
    retrieved_docs = await wikipedia_retriever.abatch(
        args["related_subjects"].topics, return_exceptions=True
    )
    all_docs = []
    for docs in retrieved_docs:
        if isinstance(docs, BaseException):
            continue
        all_docs.extend(docs)
    formatted = format_docs(all_docs)
    return await gen_perspectives_chain.ainvoke({"examples": formatted, "topic": args["topic"]})


# Interview State
def add_messages(left, right):
    if not isinstance(left, list):
        left = [left]
    if not isinstance(right, list):
        right = [right]
    return left + right


def update_references(references, new_references):
    if not references:
        references = {}
    references.update(new_references)
    return references


def update_editor(editor, new_editor):
    # Can only set at the outset
    if not editor:
        return new_editor
    return editor


class InterviewState(TypedDict):
    messages: Annotated[List[AnyMessage], add_messages]
    references: Annotated[Optional[dict], update_references]
    editor: Annotated[Optional[SubjectMatterExpert], update_editor]


# Persona Question Creator


gen_qn_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an experienced educational content creator and want to compose a lesson. \
Besides your identity as am educational content creator, you have a specific focus when researching the topic. \
Now, you are chatting with an expert to get information. Ask good questions to get more useful information.

When you have no more questions to ask, say "ENDCONV" to end the conversation.\
Please only ask one question at a time and don't ask what you have asked before.\
Your questions should be related to the topic you want to write.
Be comprehensive and curious, gaining as much unique insight from the expert as possible.\

Stay true to your specific perspective:

{persona}""",
        ),
        MessagesPlaceholder(variable_name="messages", optional=True),
    ]
)


def tag_with_name(ai_message: AIMessage, name: str):
    ai_message.name = name
    return ai_message


def swap_ai_human(state: InterviewState, name: str):
    converted = []
    for message in state["messages"]:
        if isinstance(message, AIMessage) and message.name != name:
            message = HumanMessage(**message.dict(exclude={"type"}))
        converted.append(message)
    return {"messages": converted}


@as_runnable
async def generate_question(state: InterviewState):
    editor = state["editor"]
    gn_chain = (
            RunnableLambda(swap_ai_human).bind(name=editor.name)
            | gen_qn_prompt.partial(persona=editor.persona)
            | creative_llm
            | RunnableLambda(tag_with_name).bind(name=editor.name)
    )
    result = await gn_chain.ainvoke(state)
    return {"messages": [result]}

# Query Generator for Web Exploration

class Queries(BaseModel):
    queries: List[str] = Field(
        description="Comprehensive list of web queries to answer the user's questions.",
    )


gen_queries_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful research assistant. Query the web engine to answer the user's questions.",
        ),
        MessagesPlaceholder(variable_name="messages", optional=True),
    ]
)
gen_queries_chain = gen_queries_prompt | creative_llm.with_structured_output(Queries, include_raw=True)


# Answer Generation via Web Exploration

class AnswerWithCitations(BaseModel):
    answer: str = Field(
        description="Comprehensive answer to the user's question with citations.",
    )
    cited_urls: List[str] = Field(
        description="List of urls cited in the answer.",
    )

    @property
    def as_str(self) -> str:
        return f"{self.answer}\n\nCitations:\n\n" + "\n".join(
            f"[{i+1}]: {url}" for i, url in enumerate(self.cited_urls)
        )


gen_answer_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an expert who can use information effectively. You are chatting with an expert educational content creator who wants\
 to write an educational lesson you know. You have gathered the related information and will now use the information to form a response.

Make your response as informative as possible and make sure every sentence is supported by the gathered information. DO NOT ASK CLARIFYING QUESTIONS OR ASK FOR MORE INFORMATION.\
Each response must be backed up by a citation from a reliable source, formatted as a footnote, reproducing the URLS after your response.""",
        ),
        MessagesPlaceholder(variable_name="messages", optional=True),
    ]
)

gen_answer_chain = gen_answer_prompt | creative_llm.with_structured_output(
    AnswerWithCitations, include_raw=True
).with_config(run_name="GenerateAnswer")


@as_runnable
async def web_researcher(query: str):
    """Search engine to the internet."""
    results = som_playwright.run_search_for_query(query, index_items=True, num_results=5, timeout=5*60*1000)
    return [{"content": r["snippets_concat"], "url": r["url"]} for r in results]

async def gen_answer(
    state: InterviewState,
    config: Optional[RunnableConfig] = None,
    name: str = "SubjectMatterExpert",
    max_str_len: int = 15000,
):
    swapped_state = swap_ai_human(state, name)
    queries = await gen_queries_chain.ainvoke(swapped_state)
    query_results = await web_researcher.abatch(
        queries["parsed"].queries, config, return_exceptions=True
    )
    successful_results = [
        res for res in query_results if not isinstance(res, Exception)
    ]
    all_query_results = {
        res["url"]: res["content"] for results in successful_results for res in results
    }
    dumped = json.dumps(all_query_results)[:max_str_len]
    ai_message: AIMessage = queries["raw"]
    tool_call = queries["raw"].additional_kwargs["tool_calls"][0]
    tool_id = tool_call["id"]
    tool_message = ToolMessage(tool_call_id=tool_id, content=dumped)
    swapped_state["messages"].extend([ai_message, tool_message])
    generated = await gen_answer_chain.ainvoke(swapped_state)
    cited_urls = set(generated["parsed"].cited_urls)
    cited_references = {k: v for k, v in all_query_results.items() if k in cited_urls}
    formatted_message = AIMessage(name=name, content=generated["parsed"].as_str)
    return {"messages": [formatted_message], "references": cited_references}


# Query <-> Answer flow

MAX_TURNS = 5


def route_messages(state: InterviewState, name: str = "SubjectMatterExpert"):
    messages = state["messages"]
    num_responses = len(
        [m for m in messages if isinstance(m, AIMessage) and m.name == name]
    )
    if num_responses >= MAX_TURNS:
        return END
    last_question = messages[-2]
    if last_question.content.endswith("ENDCONV"):
        return END
    return "ask_question"


builder = StateGraph(InterviewState)

builder.add_node("ask_question", generate_question)
builder.add_node("answer_question", gen_answer)
builder.add_conditional_edges("answer_question", route_messages)
builder.add_edge("ask_question", "answer_question")

builder.set_entry_point("ask_question")
interview_graph = builder.compile().with_config(run_name="Conduct Interviews")


# Outline Refinement

refine_outline_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a Wikipedia writer. You have gathered information from experts and search engines. Now, you are refining the outline of the Wikipedia page. \
You need to make sure that the outline is comprehensive and specific. \
Topic you are writing about: {topic} 

Old outline:

{old_outline}""",
        ),
        (
            "user",
            "Refine the outline based on your conversations with subject-matter experts:\n\nConversations:\n\n{conversations}\n\nWrite the refined Wikipedia outline:",
        ),
    ]
)

refine_outline_chain = refine_outline_prompt | precise_llm.with_structured_output(
    Outline
)

# Section Writer

class SubSection(BaseModel):
    subsection_title: str = Field(..., title="Title of the subsection")
    content: str = Field(
        ...,
        title="Full content of the subsection. Include [#] citations to the cited sources where relevant.",
    )

    @property
    def as_str(self) -> str:
        return f"### {self.subsection_title}\n\n{self.content}".strip()


class LessonSection(BaseModel):
    section_title: str = Field(..., title="Title of the section")
    content: str = Field(..., title="Full content of the section")
    subsections: Optional[List[Subsection]] = Field(
        default=None,
        title="Titles and descriptions for each subsection of the lesson",
    )
    citations: List[str] = Field(default_factory=list)

    @property
    def as_str(self) -> str:
        subsections = "\n\n".join(
            subsection.as_str for subsection in self.subsections or []
        )
        citations = "\n".join([f" [{i}] {cit}" for i, cit in enumerate(self.citations)])
        return (
            f"## {self.section_title}\n\n{self.content}\n\n{subsections}".strip()
            + f"\n\n{citations}".strip()
        )


section_writer_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert Wikipedia writer. Complete your assigned LessonSection, from the following outline:\n\n"
            "{outline}\n\nEach section must atleast be 150 words. Cite your sources, using the following references:\n\n<Documents>\n{docs}\n<Documents>",
        ),
        ("user", "Write the full LessonSection for the {section} section."),
    ]
)


async def retrieve(inputs: dict):
    docs = await retriever.ainvoke(inputs["topic"] + ": " + inputs["section"])
    formatted = "\n".join(
        [
            f'<Document href="{doc.metadata["source"]}"/>\n{doc.page_content}\n</Document>'
            for doc in docs
        ]
    )
    return {"docs": formatted, **inputs}


section_writer = (
        retrieve
        | section_writer_prompt
        | precise_llm.with_structured_output(LessonSection)
)


# Refine Final Article

writer_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert educational content creator. Write the complete lesson/article on {topic} using the following section drafts:\n\n"
            "{draft}\n\nStrictly follow Wikipedia format guidelines.",
        ),
        (
            "user",
            'Write the complete lesson.article using markdown format. Organize citations using footnotes like "[1]". EVERY SECTION MUST HAVE CITATIONS'
            ' avoiding duplicates in the footer. Include URLs in the footer.',
        ),
    ]
)

writer = writer_prompt | precise_llm | StrOutputParser()


