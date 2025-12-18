from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import answer  # Use the complete RAG pipeline with safety features
import os

app = FastAPI()

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "https://mayankbuilds.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# Add Hugging Face Space URL to allowed origins
HUGGING_FACE_SPACE_URL = os.getenv("SPACE_URL", "")
if HUGGING_FACE_SPACE_URL and HUGGING_FACE_SPACE_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(HUGGING_FACE_SPACE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
def chat(req: ChatRequest):
    """
    Endpoint to answer questions about Mayank's portfolio.
    Uses the complete RAG pipeline with education hard-lock and hallucination prevention.
    """
    try:
        # Use the complete answer() function from rag.py which includes:
        # 1. Intent detection (education queries go to hard-lock)
        # 2. Hallucination prevention
        # 3. Proper context filtering
        response = answer(req.question)
        return {"answer": response}
    except Exception as e:
        # Fallback to simple error message (don't expose internal errors)
        print(f"Error in chat endpoint: {e}")
        return {"answer": "I encountered an error processing your question. Please try again."}

@app.get("/test")
def test_endpoint():
    """Test that the education hard-lock is working"""
    test_query = "What is Mayank's education?"
    try:
        result = answer(test_query)
        return {
            "test_query": test_query,
            "result": result,
            "status": "Education hard-lock is working" if "BTech" in result and "Diploma" in result else "WARNING: Education hard-lock may not be working"
        }
    except Exception as e:
        return {
            "test_query": test_query,
            "error": str(e),
            "status": "ERROR: System not working"
        }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "portfolio-rag-api",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "message": "Portfolio RAG API",
        "endpoints": {
            "POST /chat": "Ask questions about Mayank's portfolio",
            "GET /test": "Test education hard-lock",
            "GET /health": "Health check",
            "GET /": "This information"
        },
        "documentation": "See README for more details"
    }