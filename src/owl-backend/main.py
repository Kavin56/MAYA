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
    return {"message": "pong", "key_loaded": bool(OPENROUTER_API_KEY)}

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "owl-worker"}

@app.get("/debug/test-key")
async def test_key():
    """Test the OpenRouter API key directly."""
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

@app.post("/task")
async def run_task(req: TaskRequest):
    """
    Run a task using OpenRouter directly (no camel-ai required).
    Calls the OpenRouter API exactly like test.py.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=400, detail="OPENROUTER_API_KEY not configured")

    # Use the model from the request, or fall back to a sensible default
    model_id = req.target_model or "google/gemini-2.5-flash"

    logger.info(f"Running task with model={model_id}: {req.prompt[:80]}...")

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
                "model": model_id,
                "messages": [{"role": "user", "content": req.prompt}],
                "max_tokens": 1000
            },
            timeout=60
        )

        data = resp.json()

        if resp.status_code != 200:
            logger.error(f"OpenRouter error {resp.status_code}: {data}")
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"OpenRouter error: {data.get('error', {}).get('message', str(data))}"
            )

        result = data["choices"][0]["message"]["content"]
        logger.info(f"Task completed successfully ({len(result)} chars)")

        return {
            "status": "success",
            "result": result,
            "llm_used": f"openrouter/{model_id}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000)
