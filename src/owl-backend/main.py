import os
import requests
import sys
import logging
from dotenv import load_dotenv

# Set up logging to file and console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("/tmp/owl-worker.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("OWL")

logger.info("=== OWL Worker Starting up ===")
logger.info(f"CWD: {os.getcwd()}")
logger.info(f"Python: {sys.version}")

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
logger.info(f"Loading .env from: {dotenv_path}")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
else:
    logger.warning(f".env file NOT FOUND at {dotenv_path}")
    load_dotenv(override=True)

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
    logger.info("Base dependencies loaded successfully (FastAPI, uvicorn)")
except ImportError as e:
    logger.error(f"Failed to load base dependencies: {e}")
    sys.exit(1)

try:
    from camel.agents import ChatAgent
    from camel.messages import BaseMessage
    from camel.models import ModelFactory, OpenRouterModel
    from camel.types import ModelPlatformType, ModelType, RoleType
    from camel.societies.workforce import Workforce
    from camel.tasks import Task
    from camel.configs import OpenRouterConfig
    CAMEL_AVAILABLE = True
    logger.info("CAMEL-AI dependencies loaded successfully")
except ImportError as e:
    logger.error(f"CAMEL-AI not available: {e}")
    CAMEL_AVAILABLE = False
    
# Initialize OpenRouter API keys if available
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if OPENROUTER_API_KEY:
    # Aggressive stripping of ANY hidden characters or quotes
    OPENROUTER_API_KEY = OPENROUTER_API_KEY.strip().strip('"').strip("'").strip()
    
    # Masked logging for debugging (only showing prefix and suffix)
    key_display = f"{OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-4:]}" if len(OPENROUTER_API_KEY) > 15 else "INVALID_LENGTH"
    logger.info(f"Loaded API Key: {key_display} (Length: {len(OPENROUTER_API_KEY)})")
    if len(OPENROUTER_API_KEY) < 20:
        logger.warning(f"API Key seems too short ({len(OPENROUTER_API_KEY)})! Check .env")
else:
    logger.warning("OPENROUTER_API_KEY not found in environment!")
    # Check if .env exists in current directory as well
    if os.path.exists(".env"):
        logger.info("Found .env file, but key not loaded. Check file encoding/content.")

app = FastAPI(title="MAYA OWL Remote Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    prompt: str
    target_model: str = "auto"
    
@app.get("/health")
async def health_check():
    return {"status": "ok", "agent": "owl-worker", "camel_available": CAMEL_AVAILABLE}

@app.get("/ping")
async def ping():
    """Simple ping to verify proxy connectivity."""
    return {"message": "pong", "loaded_key_length": len(OPENROUTER_API_KEY) if OPENROUTER_API_KEY else 0}

@app.get("/debug/test-key")
async def test_key():
    """Directly test the OpenRouter key without CAMEL-AI."""
    if not OPENROUTER_API_KEY:
        return {"status": "error", "message": "No API key found in worker environment."}
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "google/gemini-2.0-flash-lite:free", # Using a free model for test
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 10
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        return {
            "status": "success" if response.status_code == 200 else "error",
            "http_status": response.status_code,
            "key_prefix": f"{OPENROUTER_API_KEY[:10]}...",
            "response": response.json()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/task")
async def run_task(req: TaskRequest):
    if not CAMEL_AVAILABLE:
        return {
            "status": "success", 
            "result": f"(Mock) Simulated OWL execution for prompt: {req.prompt}",
            "llm_used": "mock-llm-1",
            "warning": "camel-ai is not installed or importable."
        }
        
    try:
        # Require API Key context
        if not OPENROUTER_API_KEY:
            raise HTTPException(status_code=400, detail="OPENROUTER_API_KEY is not configured in the backend environment.")
            
        os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
        os.environ["OPENAI_API_KEY"] = OPENROUTER_API_KEY  # Fallback for some CAMEL components
        os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"
            
        # 1. Determine the Model
        #    If "auto", we use a strong reasoning model to orchestrate. 
        #    If "byo:<model_id>", we force all agents to use that specific OpenRouter model.
        
        target_model = req.target_model.lower().strip()
        actual_model_string = "anthropic/claude-3-opus" # High quality orchestrator default for 'auto'
        
        if target_model.startswith("byo:"):
            actual_model_string = req.target_model[4:].strip()
            
        # Prepare the CAMEL-AI Model Factory configured strictly for OpenRouter
        # Setting max_tokens to 1000 to prevent 402 Insufficient Credit errors
        # Simplified headers to match working test.py
        logger.info(f"Creating OpenRouterModel for {actual_model_string}...")
        model_config = OpenRouterConfig(
            max_tokens=1000
        ).as_dict()

        model = OpenRouterModel(
            model_type=actual_model_string,
            api_key=OPENROUTER_API_KEY,
            model_config_dict=model_config,
        )
        
        # 2. Build the Multi-Agent Workforce
        logger.info("Building workforce with Orchestrator, Researcher, and Developer...")
        workforce = Workforce(
            id="maya_workforce",
            description="Multi-agent workforce to solve development tasks."
        )
        
        # Orchestrator (master agent)
        sys_msg = BaseMessage.make_assistant_message(
            role_name="OWL Orchestrator",
            content="You are the MAYA OWL orchestrator agent. Break tasks down into smaller steps if needed, and rely on sub-agents to synthesize data."
        )
        orchestrator_agent = ChatAgent(system_message=sys_msg, model=model)
        
        # Sub-agents with the same/specific targeted OpenRouter models
        researcher = ChatAgent(
            system_message=BaseMessage.make_assistant_message(
                role_name="Web Researcher", 
                content="Search and structure context related to the user task."
            ),
            model=model
        )
        developer = ChatAgent(
            system_message=BaseMessage.make_assistant_message(
                role_name="Developer Agent", 
                content="You are an expert developer. Generate specific code snippets or technical logic for the task."
            ),
            model=model
        )
        
        workforce.add_single_agent_worker(
            "Orchestrator", worker=orchestrator_agent, description="The master task delegator and synthesizer."
        )
        workforce.add_single_agent_worker(
            "Researcher", worker=researcher, description="Retrieves structural context and gathers insights."
        )
        workforce.add_single_agent_worker(
            "Developer", worker=developer, description="Writes all the necessary code logic."
        )

        task = Task(
            content=req.prompt,
            id="0",
        )
        
        response = workforce.process_task(task)
        
        return {
            "status": "success",
            "result": response.result if hasattr(response, 'result') else str(response),
            "llm_used": f"openrouter/{actual_model_string}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
