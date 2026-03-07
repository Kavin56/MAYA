from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

try:
    from camel.agents import ChatAgent
    from camel.messages import BaseMessage
    from camel.models import ModelFactory
    from camel.types import ModelPlatformType, ModelType, RoleType
    CAMEL_AVAILABLE = True
except ImportError:
    CAMEL_AVAILABLE = False

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
        # Determine the model. OWL handles routing implicitly, 
        # but here we can define a basic setup based on the request.
        model = ModelFactory.create(
            model_platform=ModelPlatformType.OPENAI,
            model_type=ModelType.DEFAULT
        )
        
        sys_msg = BaseMessage.make_assistant_message(
            role_name="OWL Orchestrator",
            content="You are the OWL master agent. You break down tasks and direct them to appropriate tools or sub-agents."
        )
        
        agent = ChatAgent(system_message=sys_msg, model=model)
        
        user_msg = BaseMessage.make_user_message(
            role_name="User",
            content=req.prompt
        )
        
        response = agent.step(user_msg)
        
        return {
            "status": "success",
            "result": response.msgs[0].content if response.msgs else "No response",
            "llm_used": str(model.model_type)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
