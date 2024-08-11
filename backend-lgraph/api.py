from langgraph.graph import END

from graph_agent.build_agent import iw_persist

from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import ConfigurableField

from langserve import add_routes

app = FastAPI(
    title="IntelliWeave Learn API Server",
    version="0.0.1",
    description="API server for IntelliWeave Learn",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create langgraph agent ep
add_routes(app, iw_persist, path="/iw_ep")

# TODO: Parametrize lesson id
THREAD_ID = "AZW1"

def run_and_get_state(stop_at: str, inputs, thread_id: str, state_update=None):
    if state_update:
        iw_persist.update_state(thread_id, state_update)
    async for step in iw_persist.astream({
       **inputs
    }, thread_id, interrupt_before=[stop_at]):
        name = next(iter(step))
        print(name)
        print("-- ", str(step[name]))
        results = step
    return results


@app.post("/lessons/{lesson_id}/step/outline_gen")
async def outline_gen(lesson_id: str, request: Request):
    body = await request.json()
    topic = body["topic"]
    return run_and_get_state("topic_expansion", {"topic": topic}, THREAD_ID)

@app.post("/lessons/{lesson_id}/step/{step_id}")
async def step(lesson_id: str, step_id: str, request: Request):
    body = await request.json()
    state = body["state"]
    return run_and_get_state(step_id, body, THREAD_ID, state)
