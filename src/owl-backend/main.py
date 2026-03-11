from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
else:
    load_dotenv(override=True)

try:
    from camel.agents import ChatAgent
    from camel.messages import BaseMessage
    from camel.models import ModelFactory
    from camel.types import ModelPlatformType, ModelType, RoleType
    from camel.societies.workforce import Workforce
    from camel.tasks import Task
    from camel.configs import OpenRouterConfig
    CAMEL_AVAILABLE = True
except ImportError:
    CAMEL_AVAILABLE = False
    
# Initialize OpenRouter API keys if available
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if OPENROUTER_API_KEY:
    OPENROUTER_API_KEY = OPENROUTER_API_KEY.strip().replace('"', '').replace("'", "")
    # Masked logging for debugging (only showing prefix and suffix)
    key_display = f"{OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-4:]}" if len(OPENROUTER_API_KEY) > 15 else "INVALID_LENGTH"
    print(f"[OWL] Loaded API Key: {key_display}")
else:
    print("[OWL] WARNING: OPENROUTER_API_KEY not found in environment!")

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
        # Adding required OpenRouter headers for better compatibility
        model_config = OpenRouterConfig(
            max_tokens=1000,
            extra_headers={
                "HTTP-Referer": "https://maya.ai",
                "X-Title": "MAYA OWL",
            }
        ).as_dict()
        model = ModelFactory.create(
            model_platform=ModelPlatformType.OPENROUTER,
            model_type=actual_model_string,
            model_config_dict=model_config,
        )
        
        # 2. Build the Multi-Agent Workforce
        workforce = Workforce("MAYA OWL Local/Remote Workforce")
        
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
