from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the Gemini-based system
from gemini_portfolio import answer, get_all_education, get_all_experience, get_all_projects, get_all_skills, get_profile

app = FastAPI(
    title="Mayank's Portfolio API", 
    description="API for querying Mayank D. Kulkarni's portfolio information using Gemini AI",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "https://mayankbuilds.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# Add Hugging Face Space URL to allowed origins
HUGGING_FACE_SPACE_URL = os.getenv("SPACE_URL", "")
if HUGGING_FACE_SPACE_URL and HUGGING_FACE_SPACE_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(HUGGING_FACE_SPACE_URL)

# Clean up origins (remove any empty strings)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["*"]
)

class ChatRequest(BaseModel):
    question: str

class DirectAccessRequest(BaseModel):
    section: str

@app.post("/chat", response_model=dict)
async def chat(req: ChatRequest):
    """
    Endpoint to answer questions about Mayank's portfolio.
    Uses the Gemini AI system with structured portfolio data.
    """
    try:
        response = answer(req.question)
        return {
            "answer": response,
            "success": True,
            "system": "gemini"
        }
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="I encountered an error processing your question. Please try again."
        )

@app.get("/sections/{section_name}", response_model=dict)
async def get_section(section_name: str):
    """
    Direct access to specific portfolio sections.
    Available sections: education, experience, projects, skills, profile
    """
    try:
        section_name = section_name.lower().strip()
        
        if section_name == "education":
            content = get_all_education()
        elif section_name == "experience":
            content = get_all_experience()
        elif section_name == "projects":
            content = get_all_projects()
        elif section_name == "skills":
            content = get_all_skills()
        elif section_name == "profile":
            content = get_profile()
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Section '{section_name}' not found. Available sections: education, experience, projects, skills, profile"
            )
        
        return {
            "section": section_name,
            "content": content,
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in section endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving section data")

@app.get("/test", response_model=dict)
async def test_endpoint():
    """Test endpoint to verify the system is working"""
    test_queries = [
        "What is Mayank's education?",
        "Tell me about Mayank's experience",
        "Does Mayank speak German?",
        "What projects has Mayank worked on?",
        "What skills does Mayank have?"
    ]
    
    results = []
    for query in test_queries:
        try:
            result = answer(query)
            
            # Check for key indicators
            status = "PASS"
            if "not available" in str(result).lower() and "german" not in query.lower():
                status = "WARNING: Missing data"
            elif "error" in str(result).lower():
                status = "ERROR"
            
            results.append({
                "query": query,
                "result_preview": str(result)[:150] + "..." if len(str(result)) > 150 else str(result),
                "status": status,
                "length": len(str(result))
            })
        except Exception as e:
            results.append({
                "query": query,
                "error": str(e),
                "status": "ERROR"
            })
    
    return {
        "system": "gemini",
        "status": "operational",
        "tests": results,
        "note": "Testing key portfolio queries"
    }

@app.get("/health", response_model=dict)
async def health_check():
    """Health check endpoint for monitoring"""
    # Quick test to ensure system is working
    try:
        test_response = answer("What is Mayank's current role?")
        is_healthy = "glidecloud" in test_response.lower() or "ai engineer" in test_response.lower()
        
        return {
            "status": "healthy" if is_healthy else "degraded",
            "service": "portfolio-api",
            "version": "2.0.0",
            "system": "gemini",
            "timestamp": os.getenv("DEPLOYMENT_TIME", "unknown"),
            "quick_test": "passed" if is_healthy else "failed"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "portfolio-api",
            "error": str(e),
            "system": "gemini"
        }

@app.get("/info", response_model=dict)
async def get_info():
    """Get API information and available endpoints"""
    endpoints = {
        "POST /chat": "Ask questions about Mayank's portfolio",
        "GET /sections/{section}": "Direct access to portfolio sections",
        "GET /test": "Test the system with sample queries",
        "GET /health": "Health check",
        "GET /info": "This information",
        "GET /": "Root endpoint"
    }
    
    sections = ["education", "experience", "projects", "skills", "profile"]
    
    return {
        "message": "Mayank's Portfolio API",
        "version": "2.0.0",
        "system": "gemini-ai",
        "description": "API for querying Mayank D. Kulkarni's portfolio using structured data and Gemini AI",
        "endpoints": endpoints,
        "available_sections": sections,
        "features": [
            "Structured portfolio data",
            "Gemini AI-powered responses",
            "Hallucination prevention",
            "Direct section access",
            "CORS-enabled for web apps",
            "Out-of-context filtering"
        ]
    }

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Mayank's Portfolio API",
        "description": "This API provides information about Mayank D. Kulkarni's portfolio using Gemini AI",
        "quick_start": "POST to /chat with {\"question\": \"your question here\"}",
        "examples": [
            "What is Mayank's education?",
            "Tell me about Mayank's projects",
            "Does Mayank speak German?",
            "What is Mayank's email?",
            "What skills does Mayank have?"
        ],
        "documentation": "Visit /info for complete API details",
        "health_check": "Visit /health to check system status"
    }

# Optional: Add request logging middleware
from fastapi import Request
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Check if Gemini API key is set
    if not os.getenv("GEMINI_API_KEY"):
        print("WARNING: GEMINI_API_KEY environment variable is not set!")
        print("The system will fail to answer questions.")
        print("Please set GEMINI_API_KEY in your .env file or environment variables.")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )