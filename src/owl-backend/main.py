import os
import sys
import logging
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ─── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("OWL")

logger.info("=== OWL Worker Starting up ===")
logger.info(f"Python: {sys.version}")

# ─── Load .env ────────────────────────────────────────────────────────────────
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
    logger.info(f"Loaded .env from: {dotenv_path}")
else:
    load_dotenv(override=True)
    logger.warning(".env NOT FOUND — relying on environment variables")

# ─── API Key ──────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip().strip('"').strip("'").strip()
if OPENROUTER_API_KEY:
    logger.info(f"API key loaded: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-4:]} (len={len(OPENROUTER_API_KEY)})")
else:
    logger.warning("OPENROUTER_API_KEY not found!")

# ─── Try to load camel-ai OWL multi-agent stack ───────────────────────────────
CAMEL_AVAILABLE = False
try:
    from camel.agents import ChatAgent
    from camel.messages import BaseMessage
    from camel.models import OpenRouterModel
    from camel.types import ModelPlatformType
    from camel.societies.workforce import Workforce
    from camel.tasks import Task
    from camel.configs import OpenRouterConfig
    CAMEL_AVAILABLE = True
    logger.info("✓ camel-ai loaded — OWL multi-agent is ACTIVE")
except ImportError as e:
    logger.warning(f"camel-ai not available ({e}) — using direct OpenRouter fallback")

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(title="MAYA OWL Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    prompt: str
    target_model: str = "google/gemini-2.5-flash"

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/ping")
async def ping():
    return {
        "message": "pong",
        "key_loaded": bool(OPENROUTER_API_KEY),
        "camel_available": CAMEL_AVAILABLE
    }

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "owl-worker", "camel_available": CAMEL_AVAILABLE}

@app.get("/debug/test-key")
async def test_key():
    """Test the OpenRouter API key directly (no camel-ai required)."""
    if not OPENROUTER_API_KEY:
        return {"status": "error", "message": "No API key in worker environment"}
    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://maya.ai",
                "X-Title": "MAYA"
            },
            json={
                "model": "google/gemini-2.0-flash-lite:free",
                "messages": [{"role": "user", "content": "Say hi"}],
                "max_tokens": 10
            },
            timeout=15
        )
        return {
            "status": "success" if resp.status_code == 200 else "error",
            "http_status": resp.status_code,
            "key_prefix": f"{OPENROUTER_API_KEY[:10]}...",
            "response": resp.json()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def _run_with_openrouter_direct(prompt: str, model_id: str) -> str:
    """Direct OpenRouter call — works without camel-ai (exactly like test.py)."""
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://maya.ai",
            "X-Title": "MAYA"
        },
        json={
            "model": model_id,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        },
        timeout=60
    )
    data = resp.json()
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter error {resp.status_code}: {data.get('error', {}).get('message', str(data))}")
    return data["choices"][0]["message"]["content"]

def _run_with_camel_owl(prompt: str, model_id: str) -> str:
    """Full OWL multi-agent execution using camel-ai Workforce."""
    os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
    os.environ["OPENAI_API_KEY"] = OPENROUTER_API_KEY
    os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"

    logger.info(f"Building OWL workforce with model: {model_id}")

    model_config = OpenRouterConfig(max_tokens=1000).as_dict()
    model = OpenRouterModel(
        model_type=model_id,
        api_key=OPENROUTER_API_KEY,
        model_config_dict=model_config,
    )

    # Master orchestrator agent
    orchestrator_agent = ChatAgent(
        system_message=BaseMessage.make_assistant_message(
            role_name="OWL Orchestrator",
            content=(
                "You are the MAYA OWL orchestrator. You break tasks down into steps, "
                "delegate to specialist sub-agents, and synthesize their results into a final answer."
            )
        ),
        model=model
    )

    # Researcher sub-agent
    researcher = ChatAgent(
        system_message=BaseMessage.make_assistant_message(
            role_name="Researcher",
            content="You research and gather relevant facts and context for whatever task you are given."
        ),
        model=model
    )

    # Developer sub-agent
    developer = ChatAgent(
        system_message=BaseMessage.make_assistant_message(
            role_name="Developer",
            content="You write high-quality code and provide technical solutions."
        ),
        model=model
    )

    workforce = Workforce(
        id="maya_workforce",
        description="Multi-agent workforce for solving development and research tasks."
    )
    workforce.add_single_agent_worker("Orchestrator", worker=orchestrator_agent, description="Master task delegator.")
    workforce.add_single_agent_worker("Researcher", worker=researcher, description="Gathers facts and context.")
    workforce.add_single_agent_worker("Developer", worker=developer, description="Writes code and technical logic.")

    task = Task(content=prompt, id="0")
    response = workforce.process_task(task)

    return response.result if hasattr(response, 'result') else str(response)

@app.post("/task")
async def run_task(req: TaskRequest):
    """
    Run a task using OWL multi-agent (camel-ai) if available,
    otherwise fall back to direct OpenRouter call.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=400, detail="OPENROUTER_API_KEY not configured")

    model_id = req.target_model or "google/gemini-2.5-flash"
    logger.info(f"Task received — model={model_id}: {req.prompt[:80]}...")

    try:
        if CAMEL_AVAILABLE:
            logger.info("Using OWL multi-agent (camel-ai Workforce)")
            result = _run_with_camel_owl(req.prompt, model_id)
            mode = "owl-multi-agent"
        else:
            logger.info("Using direct OpenRouter (camel-ai not installed)")
            result = _run_with_openrouter_direct(req.prompt, model_id)
            mode = "direct-openrouter"

        logger.info(f"Task completed ({mode}): {len(result)} chars")
        return {
            "status": "success",
            "result": result,
            "llm_used": f"openrouter/{model_id}",
            "mode": mode
        }

    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000)
