import json
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime

load_dotenv()

# Load knowledge base
with open("data/rag_knowledge.json", "r", encoding="utf-8") as f:
    PORTFOLIO_DATA = json.load(f)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize model
model = genai.GenerativeModel('gemini-2.5-flash')

# Create system prompt with the portfolio data
SYSTEM_PROMPT = f"""
You are Mayank's Portfolio Assistant, an AI assistant that provides information about Mayank D. Kulkarni's portfolio. 
You ONLY answer questions based on the following structured data. If information is not in this data, respond with: 
"This information is not available in Mayank's portfolio."

=== PORTFOLIO DATA ===
{json.dumps(PORTFOLIO_DATA, indent=2)}
=== END PORTFOLIO DATA ===

IMPORTANT RULES:
1. ONLY use information from the portfolio data above
2. Never invent or assume information not in the data
3. For dates: Current year is {datetime.now().year}
4. Language proficiency:
   - German: Intermediate (A2 certified) - NOT fluent, NOT native
   - English: Fluent
   - Hindi: Native
   - Marathi: Native
5. Do NOT mention IIT, University of Mumbai, or any university not in the data
6. For specific queries:
   - If asking about a specific project (PhishGuard, Part Number, YogAR), provide detailed info
   - If asking about education, list all degrees
   - If asking about experience, list all roles chronologically (most recent first)
   - If asking about skills, categorize them properly
   - If asking about languages, be precise about proficiency levels

RESPONSE FORMAT:
- Be concise but informative
- Use bullet points for lists
- Include relevant details from the data
- Always reference Mayank by name in responses
"""

def is_out_of_context(query: str) -> bool:
    """Check if query is unrelated to Mayank's portfolio"""
    query_lower = query.lower()
    
    # Out-of-context topics
    out_of_context_topics = [
        "weather", "cricket", "football", "sports", "movie", "music",
        "news", "politics", "stock", "market", "recipe", "cooking",
        "travel", "holiday", "health", "medical", "doctor",
        "physics", "chemistry", "biology", "math", "history",
        "world cup", "tournament", "match", "game", "player",
        "president", "prime minister", "government", "election",
        "religion", "philosophy"
    ]
    
    # Check for general knowledge questions without Mayank reference
    if any(topic in query_lower for topic in out_of_context_topics):
        return True
    
    # Check for "who is" questions not about Mayank
    if query_lower.startswith("who is "):
        topic = query_lower[7:].strip()
        if not any(name in topic for name in ["mayank", "kulkarni"]):
            return True
    
    # Check for "what is" questions about general topics
    if query_lower.startswith("what is ") and "mayank" not in query_lower:
        topic = query_lower[8:].strip()
        # Allow if it's about portfolio-related terms
        portfolio_terms = [
            "ai", "ml", "machine learning", "artificial intelligence",
            "rag", "llm", "vision transformer", "phishing",
            "data science", "computer engineering", "diploma", "btech"
        ]
        if not any(term in topic for term in portfolio_terms):
            return True
    
    # Check for "tell me about" without Mayank reference
    if query_lower.startswith("tell me about "):
        topic = query_lower[14:].strip()
        portfolio_sections = [
            "mayank", "his", "education", "experience", "projects",
            "skills", "background", "work", "portfolio", "certifications",
            "awards", "languages", "contact", "email"
        ]
        if not any(section in topic for section in portfolio_sections):
            return True
    
    return False

def format_specific_response(query: str) -> Optional[str]:
    """Handle specific query types with structured responses"""
    query_lower = query.lower()
    
    # Language queries
    language_queries = {
        "german": "Mayank's German proficiency: Intermediate (A2 certified)",
        "english": "Mayank's English proficiency: Fluent",
        "hindi": "Mayank's Hindi proficiency: Native",
        "marathi": "Mayank's Marathi proficiency: Native",
    }
    
    for lang, response in language_queries.items():
        if f"speak {lang}" in query_lower or f"know {lang}" in query_lower or f"{lang} proficiency" in query_lower:
            return response
    
    # What languages does Mayank speak?
    if "what language" in query_lower or "languages does" in query_lower:
        languages = PORTFOLIO_DATA["profile"]["languages"]
        return f"Mayank speaks: {', '.join(languages)}"
    
    # Specific project queries
    projects = PORTFOLIO_DATA["projects"]
    for project in projects:
        project_name = project["name"].lower()
        if "phishguard" in query_lower or "phishing" in query_lower:
            return format_project_response(project) if "phishguard" in project_name else None
        elif "part number" in query_lower:
            return format_project_response(project) if "part number" in project_name else None
        elif "yogar" in query_lower or "yoga" in query_lower:
            return format_project_response(project) if "yogar" in project_name else None
    
    # Education list
    if "education" in query_lower or "degree" in query_lower or "study" in query_lower:
        education = PORTFOLIO_DATA["education"]
        response = ["Mayank's Education:"]
        for edu in education:
            degree = edu["degree"].replace("[EDUCATION] ", "")
            response.append(f"• {degree} at {edu['institution']} ({edu['year']})")
        return "\n".join(response)
    
    # Experience list
    if "experience" in query_lower or "work" in query_lower or "job" in query_lower:
        experience = PORTFOLIO_DATA["experience"]
        response = ["Mayank's Work Experience (most recent first):"]
        for exp in experience:
            role = exp["role"].replace("[EXPERIENCE] ", "")
            response.append(f"\n{role}")
            response.append(f"  Company: {exp['company']}")
            response.append(f"  Period: {exp['period']}")
            if 'description' in exp:
                response.append(f"  Description: {exp['description']}")
            if 'technologies' in exp:
                response.append(f"  Technologies: {', '.join(exp['technologies'])}")
        return "\n".join(response)
    
    # Skills
    if "skill" in query_lower or "technical" in query_lower:
        skills = PORTFOLIO_DATA["skills"]
        response = ["Mayank's Technical Skills:"]
        response.append("\nAI & ML:")
        response.extend([f"  • {skill}" for skill in skills["ai_ml"]])
        response.append("\nDevelopment:")
        response.extend([f"  • {skill}" for skill in skills["development"]])
        response.append("\nBackend & Databases:")
        response.extend([f"  • {skill}" for skill in skills["backend_database"]])
        response.append("\nSoft Skills:")
        response.extend([f"  • {skill}" for skill in skills["soft_skills"]])
        return "\n".join(response)
    
    # Contact/email
    if "contact" in query_lower or "email" in query_lower or "reach" in query_lower:
        profile = PORTFOLIO_DATA["profile"]
        return f"Mayank can be contacted at: {profile['email']}\nLocation: {profile['location']}\nAvailability: {profile['availability']}"
    
    return None

def format_project_response(project: Dict) -> str:
    """Format detailed project response"""
    response = [f"Project: {project['name'].replace('[PROJECT] ', '')}"]
    
    if 'description' in project:
        response.append(f"\nDescription: {project['description']}")
    
    if 'features' in project:
        response.append(f"\nFeatures:")
        for feature in project['features']:
            response.append(f"  • {feature}")
    
    if 'technologies' in project:
        response.append(f"\nTechnologies: {', '.join(project['technologies'])}")
    
    if 'role' in project:
        response.append(f"\nMayank's Role: {project['role']}")
    
    if 'timeline' in project:
        response.append(f"\nTimeline: {project['timeline']}")
    
    return "\n".join(response)

def answer(query: str) -> str:
    """Main function to answer queries about Mayank's portfolio"""
    # First check for out-of-context queries
    if is_out_of_context(query):
        return "This information is not available in Mayank's portfolio. Please ask about Mayank's background, skills, projects, experience, or education."
    
    # Try to get a structured response first
    structured_response = format_specific_response(query)
    if structured_response:
        return structured_response
    
    # For complex or synthesis queries, use Gemini
    try:
        prompt = f"""
        {SYSTEM_PROMPT}
        
        User Question: {query}
        
        Answer based ONLY on the portfolio data. If the information is not in the data, say "This information is not available in Mayank's portfolio."
        
        Important: Be precise about language proficiency (German is Intermediate/A2, not fluent or native).
        """
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Gemini error: {e}")
        return "I apologize, but I'm having trouble accessing the portfolio information. Please try again or ask about specific sections like education, experience, or projects."

# Direct access functions
def get_all_education() -> str:
    education = PORTFOLIO_DATA["education"]
    response = ["Mayank's Education:"]
    for edu in education:
        degree = edu["degree"].replace("[EDUCATION] ", "")
        response.append(f"• {degree} at {edu['institution']} ({edu['year']})")
    return "\n".join(response)

def get_all_experience() -> str:
    experience = PORTFOLIO_DATA["experience"]
    response = ["Mayank's Work Experience:"]
    for exp in experience:
        role = exp["role"].replace("[EXPERIENCE] ", "")
        response.append(f"\n{role}")
        response.append(f"  Company: {exp['company']}")
        response.append(f"  Period: {exp['period']}")
    return "\n".join(response)

def get_all_projects() -> str:
    projects = PORTFOLIO_DATA["projects"]
    response = ["Mayank's Projects:"]
    for project in projects:
        name = project["name"].replace("[PROJECT] ", "")
        response.append(f"\n{name}")
        if 'description' in project:
            response.append(f"  Description: {project['description']}")
    return "\n".join(response)

def get_all_skills() -> str:
    skills = PORTFOLIO_DATA["skills"]
    response = ["Mayank's Technical Skills:"]
    response.append("\nAI & ML:")
    response.extend([f"  • {skill}" for skill in skills["ai_ml"]])
    response.append("\nDevelopment:")
    response.extend([f"  • {skill}" for skill in skills["development"]])
    response.append("\nBackend & Databases:")
    response.extend([f"  • {skill}" for skill in skills["backend_database"]])
    response.append("\nSoft Skills:")
    response.extend([f"  • {skill}" for skill in skills["soft_skills"]])
    return "\n".join(response)

def get_profile() -> str:
    profile = PORTFOLIO_DATA["profile"]
    response = [f"Name: {profile['name']}",
                f"Title: {profile['title']}",
                f"Location: {profile['location']}",
                f"Email: {profile['email']}",
                f"\nBio: {profile['bio']}",
                f"\nFocus Areas:",
                *[f"  • {area}" for area in profile['focus']],
                f"\nLanguages:",
                *[f"  • {lang}" for lang in profile['languages']],
                f"\nInterests:",
                *[f"  • {interest}" for interest in profile['interests']]]
    return "\n".join(response)