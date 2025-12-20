import json
import faiss
from sentence_transformers import SentenceTransformer
from model import generate_answer
import re
import os
from dotenv import load_dotenv

load_dotenv()

USE_GEMINI = os.getenv("USE_GEMINI", "false").lower() == "true"

# Load FAISS index
index = faiss.read_index("portfolio.index")

# Load documents with metadata
with open("texts.json", "r", encoding="utf-8") as f:
    documents = json.load(f)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

def is_valid_gemini_answer(answer: str, query: str) -> bool:
    answer_lower = answer.lower()

    # Hard reject empty or very short answers
    if not answer or len(answer.strip()) < 30:
        return False

    # Allow standard refusal
    if "not available in mayank's portfolio" in answer_lower:
        return True

    # Reject obvious generic / non-portfolio answers
    forbidden = [
        "generally", "in general", "as an ai", "typically",
        "most people", "usually", "commonly"
    ]
    if any(f in answer_lower for f in forbidden):
        return False

    # For synthesis queries, be more lenient
    synthesis_keywords = ["connect", "relate", "relationship", "impact"]
    query_lower = query.lower()
    is_synthesis_query = any(keyword in query_lower for keyword in synthesis_keywords)
    
    if is_synthesis_query:
        # Synthesis answers should reference multiple aspects of the portfolio
        portfolio_references = 0
        portfolio_terms = [
            "mayank", "phishguard", "part number", "yogar", "vision transformer",
            "machine learning", "ai", "artificial intelligence", "project",
            "education", "experience", "skill", "technology"
        ]
        
        for term in portfolio_terms:
            if term in answer_lower:
                portfolio_references += 1
        
        # Require at least 2 portfolio references for synthesis
        return portfolio_references >= 2

    # Regular queries require at least ONE portfolio anchor
    portfolio_anchors = [
        "mayank",
        "phishguard",
        "part number",
        "yogar",
        "vision transformer",
        "machine learning",
        "fastapi",
        "llm",
        "ai"
    ]

    if not any(anchor in answer_lower for anchor in portfolio_anchors):
        return False

    return True


# ---------- INTENT DETECTION ----------
def detect_section(question: str):
    q = question.lower()

    # Keep out-of-context filtering first
    # "AI in general" should not trigger profile section
    if "ai in general" in q or "artificial intelligence in general" in q:
        return None
    
    # "What is AI?" should not trigger any section
    if ("what is ai" in q or "what is artificial intelligence" in q) and "mayank" not in q:
        return None
    
    # "Who won" questions should not trigger any section
    if q.startswith("who won") or q.startswith("who is the") or q.startswith("who are the"):
        if "mayank" not in q and "his" not in q and "he" not in q:
            return None

    # ---------- COMBINATION QUERIES ----------
    # Queries asking for multiple sections should go to comprehensive
    if ("and" in q or "both" in q or "also" in q):
        # Check for education + experience combinations
        if ("education" in q and "experience" in q) or \
           ("education" in q and "work" in q) or \
           ("study" in q and "work" in q):
            return "comprehensive"
        
        # Check for other combinations
        sections_count = 0
        portfolio_sections = ["education", "experience", "projects", "skills", 
                             "background", "work", "career", "achievements"]
        
        for section in portfolio_sections:
            if section in q:
                sections_count += 1
        
        if sections_count >= 2:
            return "comprehensive"

    # ---------- SYNTHESIS/REASONING QUERIES ----------
    synthesis_keywords = ["connect", "relate", "relationship", "impact", "influence", "how does", "how do"]
    if any(keyword in q for keyword in synthesis_keywords):
        # But ONLY if they're about Mayank's portfolio
        if any(k in q for k in ["mayank", "his", "he", "portfolio"]):
            return "synthesis"
        else:
            return None

    # ---------- HARD-LOCKED SECTIONS ----------
    # "Credentials" should go to education or a comprehensive response
    if "credential" in q or "qualification" in q or "background" in q:
        return "comprehensive"
    
    # First, check for specific spoken languages
    spoken_languages = ["german", "english", "hindi", "marathi", "french", "spanish"]
    if any(lang in q for lang in spoken_languages):
        if "speak" in q or "spoken" in q or "language" in q or "know" in q or "proficiency" in q:
            return "profile"
    
    # Check for programming language queries
    if "programming" in q or "coding" in q or "code" in q:
        return "skills"
    
    # Check for specific programming languages
    programming_languages = ["python", "javascript", "java", "c++", "c#", "php", "ruby", "go", "rust", "html", "css", "sql"]
    if any(lang in q for lang in programming_languages):
        return "skills"
    
    if "language" in q:
        # Distinguish between programming languages and spoken languages
        if "programming" in q or "code" in q or "develop" in q or "coding" in q:
            return "skills"
        if "speak" in q or "spoken" in q or "talk" in q or "communicate" in q or "proficiency" in q:
            return "profile"
    
    # "What does Mayank do?" should go to profile
    if "what does" in q and ("do" in q or "work as" in q or "job" in q):
        return "profile"
    
    # Profile-related queries
    if ("available" in q or "hire" in q or "contact" in q or 
        "where" in q or "location" in q or "interests" in q):
        return "profile"
    
    if "project" in q or "built" in q or "developed" in q:
        return "projects"
    
    if ("education" in q or "degree" in q or "college" in q or 
        "school" in q or "study" in q or "academic" in q or 
        "background" in q or "student" in q or "learn" in q):
        return "education"
    
    if ("experience" in q or "work" in q or "intern" in q or 
        "job" in q or "role" in q or "position" in q or 
        "company" in q or "employed" in q):
        return "experience"
    
    if ("skill" in q or "technical" in q or "programming" in q or 
        "technology" in q or "expertise" in q or "proficient" in q):
        return "skills"
    
    if ("award" in q or "achievement" in q or "prize" in q or 
        "winner" in q or "recognition" in q or "honor" in q):
        return "awards"
    
    if ("certification" in q or "certificate" in q or "certified" in q):
        return "certifications"
    
    if ("profile" in q or "about" in q or "bio" in q or 
        "who" in q or "introduce" in q or "background" in q or
        "what does" in q or "tell me about" in q):
        return "profile"
    
    return None

# Add this function at the top of rag.py, right after detect_section()
def is_out_of_context(query: str) -> bool:
    """Check if query is clearly unrelated to Mayank's portfolio"""
    query_lower = query.lower()
    
    # Clearly out-of-context topics that should be rejected immediately
    out_of_context_keywords = [
        "weather", "cricket", "football", "sports", "movie", "music",
        "news", "politics", "stock", "market", "recipe", "cooking",
        "travel", "holiday", "health", "medical", "doctor",
        "physics", "chemistry", "biology", "math", "history",
        "world cup", "tournament", "match", "game", "player",
        "president", "prime minister", "government", "height", "hobby", "election"
    ]
    
    # FIRST: Check for specific out-of-context patterns
    if any(keyword in query_lower for keyword in out_of_context_keywords):
        return True
    
    # SECOND: Check for general knowledge questions
    if query_lower.startswith(("tell me about ", "explain ", "what is ")):
        # Extract the topic
        for prefix in ["tell me about ", "explain ", "what is "]:
            if query_lower.startswith(prefix):
                topic = query_lower[len(prefix):].strip()
                # Check if it's about Mayank or his portfolio
                if any(term in topic for term in ["mayank", "his", "he", "him"]):
                    return False  # It's about Mayank, so it's in context
                
                # Check if topic contains portfolio keywords
                portfolio_terms = [
                    "portfolio", "ai", "ml", "machine learning", "artificial intelligence",
                    "education", "experience", "projects", "skills", "background",
                    "work", "job", "career", "certification", "award"
                ]
                
                if any(term in topic for term in portfolio_terms):
                    return False  # It's portfolio-related
                
                # If no portfolio keywords, it's out of context
                return True
        return False
    
    # THIRD: Check for "who" questions that aren't about Mayank
    if query_lower.startswith("who "):
        # Allow "who is mayank" or "who is he" or questions about his background
        if any(term in query_lower for term in ["mayank", "he", "his", "him", "portfolio"]):
            return False
        # Reject all other "who" questions
        return True
    
    # FOURTH: Check for "tell me about" without Mayank reference but about portfolio
    if query_lower.startswith("tell me about"):
        # Check if it's about portfolio sections
        portfolio_sections = [
            "education", "experience", "projects", "skills", "background",
            "work", "job", "career", "achievements", "certifications"
        ]
        if any(section in query_lower for section in portfolio_sections):
            return False  # It's portfolio-related
    
    # FIFTH: Check for combination queries (experience AND education, etc.)
    portfolio_combination_terms = [
        "experience and education", "education and experience",
        "projects and skills", "skills and projects",
        "background and experience", "education and projects",
        "work and education", "career and education"
    ]
    
    if any(combo in query_lower for combo in portfolio_combination_terms):
        return False  # Combination queries are in-context
    
    # SIXTH: Check for general questions without "Mayank" reference but about portfolio
    portfolio_keywords = [
        "education", "experience", "projects", "skills", "background",
        "work", "job", "career", "achievement", "award", "certification",
        "degree", "college", "university", "school", "study", "intern",
        "role", "position", "company", "technology", "programming",
        "development", "design", "ai", "ml", "machine learning"
    ]
    
    # If query contains portfolio keywords, it's in context
    if any(keyword in query_lower for keyword in portfolio_keywords):
        # Additional check: make sure it's not asking about general topics
        if "in general" in query_lower or "generally" in query_lower:
            return True  # "AI in general" is out of context
        return False  # Portfolio-related
    
    # Check for questions starting with portfolio-related question words
    portfolio_question_patterns = [
        "tell me about his", "what is his", "what are his",
        "describe his", "explain his", "how is his"
    ]
    
    if any(pattern in query_lower for pattern in portfolio_question_patterns):
        return False  # Questions about "his" are in context
    
    return False  # Default: assume it's in context if not clearly out-of-context

# ---------- RETRIEVAL ----------
def retrieve_context(query: str, k: int = 5) -> str:
    """Retrieve context with better handling for diverse queries"""
    query_embedding = embedder.encode([query]).astype("float32")
    _, indices = index.search(query_embedding, k * 5) 

    target_section = detect_section(query)

    selected = []
    for idx in indices[0]:
        doc = documents[idx]
        if target_section is None or doc["section"] == target_section:
            selected.append(doc["content"])
        if len(selected) == k:
            break
    
    # If we didn't get enough from target section, add from any section
    if len(selected) < k:
        for idx in indices[0]:
            doc = documents[idx]
            if doc["content"] not in selected:
                selected.append(doc["content"])
            if len(selected) == k:
                break

    # If STILL no context, add some default profile info
    if len(selected) == 0:
        for doc in documents:
            if doc["section"] == "profile":
                selected.append(doc["content"])
                break

    return "\n\n".join(selected)


# ---------- DIRECT DOCUMENT ACCESS ----------
def get_documents_by_section(section_name: str):
    """Get all documents for a specific section"""
    return [doc for doc in documents if doc["section"] == section_name]

# ---------- IMPROVED STRUCTURED EXTRACTORS ----------
def extract_education(context: str) -> str:
    """Extract all education entries from context"""
    # Get education documents directly
    edu_docs = get_documents_by_section("education")
    
    if not edu_docs:
        return "Education information is not available in Mayank's portfolio."
    
    education_entries = []
    
    for doc in edu_docs:
        lines = doc["content"].split("\n")
        entry = {}
        for line in lines:
            line = line.strip()
            if line.startswith("Degree:"):
                degree = line.replace("Degree:", "").strip()
                degree = degree.replace("[EDUCATION]", "").strip()
                entry["degree"] = degree
            elif line.startswith("Institution:"):
                entry["institution"] = line.replace("Institution:", "").strip()
            elif line.startswith("Years:"):
                entry["years"] = line.replace("Years:", "").strip()
        
        if entry and "degree" in entry:
            education_entries.append(entry)
    
    if not education_entries:
        return "Education information is not available in Mayank's portfolio."
    
    # Sort by year (most recent first)
    def get_start_year(years_str):
        try:
            # Extract first year (e.g., "2023" from "2023 – 2026")
            year_part = years_str.split("–")[0].strip()
            return int(year_part)
        except:
            return 0
    
    education_entries.sort(key=lambda x: get_start_year(x.get("years", "0")), reverse=True)
    
    response = ["Mayank's Education:"]
    for edu in education_entries:
        response.append(f"• {edu['degree']} at {edu['institution']} ({edu['years']})")
    
    return "\n".join(response)

def extract_experience(context: str) -> str:
    """Extract all experience entries from context"""
    # Get experience documents directly
    exp_docs = get_documents_by_section("experience")
    
    if not exp_docs:
        return "Experience information is not available in Mayank's portfolio."
    
    experience_entries = []
    
    for doc in exp_docs:
        lines = doc["content"].split("\n")
        entry = {}
        for line in lines:
            line = line.strip()
            if line.startswith("Role:"):
                role = line.replace("Role:", "").strip()
                role = role.replace("[EXPERIENCE]", "").strip()
                entry["role"] = role
            elif line.startswith("Company:"):
                entry["company"] = line.replace("Company:", "").strip()
            elif line.startswith("Period:"):
                entry["period"] = line.replace("Period:", "").strip()
            elif line.startswith("Technologies:"):
                entry["technologies"] = line.replace("Technologies:", "").strip()
        
        if entry and "role" in entry:
            experience_entries.append(entry)
    
    if not experience_entries:
        return "Experience information is not available in Mayank's portfolio."
    
    # Sort by period (most recent first)
    def get_year(period_str):
        try:
            # Extract first year from period like "January 2026 – Present"
            match = re.search(r'\d{4}', period_str)
            return int(match.group()) if match else 0
        except:
            return 0
    
    experience_entries.sort(key=lambda x: get_year(x.get("period", "0")), reverse=True)
    
    response = ["Mayank's Work Experience:"]
    for exp in experience_entries:
        response.append(f"\n{exp['role']}")
        response.append(f"  Company: {exp['company']}")
        response.append(f"  Period: {exp['period']}")
        if 'technologies' in exp and exp['technologies']:
            response.append(f"  Technologies: {exp['technologies']}")
    
    return "\n".join(response)

def extract_projects(context: str, query: str = "") -> str:
    """Extract project entries from context, with support for specific project queries"""
    # Get project documents directly
    proj_docs = get_documents_by_section("projects")
    
    if not proj_docs:
        return "Project information is not available in Mayank's portfolio."
    
    project_entries = []
    
    for doc in proj_docs:
        lines = doc["content"].split("\n")
        entry = {}
        for line in lines:
            line = line.strip()
            if line.startswith("Project Name:"):
                name = line.replace("Project Name:", "").strip()
                name = name.replace("[PROJECT]", "").strip()
                entry["name"] = name
                entry["original_name"] = name  # Keep original for matching
            elif line.startswith("Description:"):
                entry["description"] = line.replace("Description:", "").strip()
            elif line.startswith("Technologies:"):
                entry["technologies"] = line.replace("Technologies:", "").strip()
            elif line.startswith("Role:"):
                entry["role"] = line.replace("Role:", "").strip()
            elif line.startswith("Timeline:"):
                entry["timeline"] = line.replace("Timeline:", "").strip()
            elif line.startswith("Features:"):
                entry["features"] = line.replace("Features:", "").strip()
        
        if entry and "name" in entry:
            project_entries.append(entry)
    
    if not project_entries:
        return "Project information is not available in Mayank's portfolio."
    
    # Check if query asks for a specific project
    query_lower = query.lower() if query else ""
    
    # Check for specific project mentions
    specific_projects = {
        "phishguard": ["phishguard", "phishing", "url detector"],
        "yogar": ["yogar", "yoga", "augmented reality", "ar yoga"],
        "part number": ["part number", "vision transformer", "machine vision"]
    }
    
    for project_name, keywords in specific_projects.items():
        if any(keyword in query_lower for keyword in keywords):
            # Find the specific project
            for proj in project_entries:
                proj_lower = proj.get("original_name", "").lower()
                if any(keyword in proj_lower for keyword in keywords):
                    # Return only this project with detailed information
                    response = [f"Mayank's Project: {proj['name']}"]
                    
                    if 'description' in proj and proj['description']:
                        response.append(f"\nDescription: {proj['description']}")
                    
                    if 'features' in proj and proj['features']:
                        response.append(f"\nFeatures: {proj['features']}")
                    
                    if 'technologies' in proj and proj['technologies']:
                        response.append(f"\nTechnologies: {proj['technologies']}")
                    
                    if 'role' in proj and proj['role']:
                        response.append(f"\nRole: {proj['role']}")
                    
                    if 'timeline' in proj and proj['timeline']:
                        response.append(f"\nTimeline: {proj['timeline']}")
                    
                    return "\n".join(response)
    
    # If no specific project requested, show all projects
    response = ["Mayank's Projects:"]
    for proj in project_entries:
        response.append(f"\n{proj['name']}")
        if 'description' in proj and proj['description']:
            response.append(f"  Description: {proj['description']}")
        if 'technologies' in proj and proj['technologies']:
            response.append(f"  Technologies: {proj['technologies']}")
        if 'role' in proj and proj['role']:
            response.append(f"  Role: {proj['role']}")
        if 'timeline' in proj and proj['timeline']:
            response.append(f"  Timeline: {proj['timeline']}")
    
    return "\n".join(response)

def extract_awards(context: str) -> str:
    """Extract awards from context"""
    # Get awards documents directly
    awards_docs = get_documents_by_section("awards")
    
    if not awards_docs:
        return "Awards information is not available in Mayank's portfolio."
    
    awards_entries = []
    
    for doc in awards_docs:
        lines = doc["content"].split("\n")
        entry = {}
        for line in lines:
            line = line.strip()
            if line.startswith("Award Title:"):
                entry["title"] = line.replace("Award Title:", "").strip()
            elif line.startswith("Description:"):
                entry["description"] = line.replace("Description:", "").strip()
        
        if entry and "title" in entry:
            awards_entries.append(entry)
    
    if not awards_entries:
        return "Awards information is not available in Mayank's portfolio."
    
    response = ["Mayank's Awards:"]
    for award in awards_entries:
        response.append(f"\n• {award['title']}")
        if 'description' in award and award['description']:
            response.append(f"  {award['description']}")
    
    return "\n".join(response)

def extract_certifications(context: str) -> str:
    """Extract certifications from context"""
    # Get certifications documents directly
    cert_docs = get_documents_by_section("certifications")
    
    if not cert_docs:
        return "Certifications information is not available in Mayank's portfolio."
    
    certifications = []
    
    for doc in cert_docs:
        lines = doc["content"].split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("Certification:"):
                cert = line.replace("Certification:", "").strip()
                certifications.append(cert)
    
    if not certifications:
        return "Certifications information is not available in Mayank's portfolio."
    
    response = ["Mayank's Certifications:"]
    for cert in certifications:
        response.append(f"• {cert}")
    
    return "\n".join(response)

def extract_skills(context: str) -> str:
    """Extract skills information from context"""
    # Get skills documents directly
    skills_docs = get_documents_by_section("skills")
    
    if not skills_docs:
        return "Skills information is not available in Mayank's portfolio."
    
    skills_content = skills_docs[0]["content"]
    lines = skills_content.split("\n")
    
    response = ["Mayank's Technical Skills:"]
    for line in lines:
        line = line.strip()
        if line and not line.startswith("["):
            response.append(f"• {line}")
    
    if len(response) == 1:
        return "Skills information is not available in Mayank's portfolio."
    
    return "\n".join(response)

def extract_profile(context: str) -> str:
    """Extract profile information from context"""
    # Get profile document directly
    profile_docs = get_documents_by_section("profile")
    
    if not profile_docs:
        return "Profile information is not available in Mayank's portfolio."
    
    profile_content = profile_docs[0]["content"]
    return f"Mayank's Profile:\n\n{profile_content}"

# ---------- COMPREHENSIVE EXTRACTOR ----------
def extract_comprehensive_credentials(context: str) -> str:
    """Extract comprehensive credentials (education + experience + skills)"""
    response_parts = []
    
    # Check what parts are being asked for (we'll get this from query context)
    query_lower = context.lower() if "query:" in context.lower() else ""
    
    # Always include education for comprehensive queries
    education = extract_education(context)
    if "Education:" in education:
        response_parts.append(education)
    
    # Add experience
    experience = extract_experience(context)
    if "Experience:" in experience:
        response_parts.append(experience)
    
    # Add certifications
    certifications = extract_certifications(context)
    if "Certifications:" in certifications:
        response_parts.append(certifications)
    
    # Add key skills summary
    skills_docs = get_documents_by_section("skills")
    if skills_docs:
        skills_content = skills_docs[0]["content"]
        # Extract key skills
        key_skills = []
        lines = skills_content.split("\n")
        for line in lines:
            if "AI & ML:" in line:
                key_skills.append("AI/ML technologies")
            elif "Development:" in line:
                key_skills.append("Full-stack development")
            elif "Backend & Databases:" in line:
                key_skills.append("Backend systems & databases")
        
        if key_skills:
            response_parts.append(f"Key Expertise: {', '.join(key_skills)}")
    
    if not response_parts:
        return "Credential information is not available in Mayank's portfolio."
    
    # Add a summary at the beginning
    summary = "Mayank's Background Summary:"
    response_parts.insert(0, summary)
    
    return "\n\n".join(response_parts)

# ---------- SPECIALIZED EXTRACTOR FOR LANGUAGES ----------
def extract_languages(context: str, query: str) -> str:
    """Extract only language information from profile"""
    # Get profile document directly
    profile_docs = get_documents_by_section("profile")
    
    if not profile_docs:
        return "Language information is not available in Mayank's portfolio."
    
    profile_content = profile_docs[0]["content"]
    lines = profile_content.split("\n")
    
    # Look for languages spoken line
    languages_line = None
    for line in lines:
        if line.startswith("Languages Spoken:"):
            languages_line = line.replace("Languages Spoken:", "").strip()
            break
    
    if not languages_line:
        return "Language information is not available in Mayank's portfolio."
    
    # Check if query is about a specific language
    query_lower = query.lower()
    spoken_languages = ["german", "english", "hindi", "marathi"]
    
    for lang in spoken_languages:
        if lang in query_lower:
            # Check proficiency for this specific language
            if "german" in query_lower:
                if "fluent" in query_lower or "native" in query_lower:
                    return "No, Mayank's German proficiency is Intermediate (A2 certified), not fluent or native."
                return "Mayank's German proficiency: Intermediate (A2 certified)"
            elif "english" in query_lower:
                return "Mayank's English proficiency: Fluent"
            elif "hindi" in query_lower:
                return "Mayank's Hindi proficiency: Native"
            elif "marathi" in query_lower:
                return "Mayank's Marathi proficiency: Native"
    
    # General language query
    return f"Mayank speaks: {languages_line}"

# ---------- HARD HALLUCINATION BLOCK ----------
def enforce_no_hallucination(answer: str, context: str) -> str:
    """Improved hallucination check"""
    answer_lower = answer.lower()
    context_lower = context.lower()

        # ALLOW the standard "not available" message
    if "this information is not available" in answer_lower:
        return answer.strip()  # Always allow this response
    
    # BLOCK IIT and University of Mumbai hallucinations
    forbidden_institutions = [
        "indian institute of technology", "iit", "iit kanpur",
        "university of mumbai", "mumbai university",
        "bachelor's degree", "bachelor of science", "b.sc",
        "master's degree", "master of", "m.sc", "m.tech"
    ]
    
    for institution in forbidden_institutions:
        if institution in answer_lower and institution not in context_lower:
            return "This information is not available in Mayank's portfolio. According to his portfolio, his credentials include:\n\n" + extract_comprehensive_credentials(context)
    
    # Check for language proficiency hallucinations
    if "german" in answer_lower:
        if "fluent" in answer_lower or "native" in answer_lower:
            # German is intermediate, not fluent or native
            if "intermediate" not in context_lower and "a2" not in context_lower:
                return "This information is not available in Mayank's portfolio."
    
    # If answer is very short and factual, allow it
    if len(answer) < 100:
        # Check if it's a direct fact from context
        answer_words = answer_lower.split()
        if len(answer_words) < 10:  # Short factual answer
            # Check if key terms are in context
            key_terms = [word for word in answer_words if len(word) > 3 and word not in ["this", "that", "these", "those", "mayank", "his", "her", "what", "where", "when", "yes", "no"]]
            for term in key_terms:
                if term not in context_lower:
                    return "This information is not available in Mayank's portfolio."
            return answer.strip()
    
    # Check for education hallucinations
    if ("bachelor of science" in answer_lower or "b.sc" in answer_lower) and "bachelor of science" not in context_lower:
        return "This information is not available in Mayank's portfolio."
    
    if "bachelor of technology" in answer_lower and "btech" not in context_lower:
        return "This information is not available in Mayank's portfolio."
    
    # Check for completion claims
    completion_phrases = ["completed in", "graduated in", "finished in", "received his degree in"]
    for phrase in completion_phrases:
        if phrase in answer_lower:
            # If talking about education completion, verify it's in context
            if "education" in answer_lower or "degree" in answer_lower:
                return "This information is not available in Mayank's portfolio."
    
    return answer.strip()

def handle_synthesis_query(query: str, context: str) -> str:
    """Handle synthesis/reasoning queries that connect different aspects"""
    query_lower = query.lower()
    
    # For AI experience connecting to projects
    if "ai" in query_lower and ("project" in query_lower or "connect" in query_lower or "relate" in query_lower):
        # Get AI skills
        skills_docs = get_documents_by_section("skills")
        ai_skills = []
        for doc in skills_docs:
            lines = doc["content"].split("\n")
            for line in lines:
                if "AI & ML:" in line:
                    skills_text = line.replace("AI & ML:", "").strip()
                    ai_skills = [s.strip() for s in skills_text.split(",")]
                    break
        
        # Get projects
        project_docs = get_documents_by_section("projects")
        projects_with_ai = []
        for doc in project_docs:
            content = doc["content"]
            if any(skill.lower() in content.lower() for skill in ai_skills):
                projects_with_ai.append(doc["content"])
        
        if not projects_with_ai:
            return "This information is not available in Mayank's portfolio."
        
        # Create a synthesis response
        response = ["Mayank's AI skills connect to his projects in several ways:"]
        
        # PhishGuard AI
        response.append("\n1. **PhishGuard AI**:")
        response.append("   - Uses Machine Learning for phishing URL detection")
        response.append("   - Implements LLM-based semantic analysis")
        response.append("   - Demonstrates AI skills in cybersecurity applications")
        
        # Part Number Recognition System
        response.append("\n2. **Part Number Recognition System**:")
        response.append("   - Uses Vision Transformers for computer vision")
        response.append("   - Applies AI for industrial automation")
        response.append("   - Shows practical AI implementation in manufacturing")
        
        response.append("\nThese projects showcase Mayank's ability to apply AI/ML technologies to solve real-world problems.")
        return "\n".join(response)
    
    # For education and experience combination
    if ("education" in query_lower and "experience" in query_lower) or \
       ("study" in query_lower and "work" in query_lower):
        
        # Get education
        education = extract_education(context)
        
        # Get experience
        experience = extract_experience(context)
        
        # Create a combined response
        response = ["Mayank combines his education and experience effectively:"]
        response.append("\n" + education)
        response.append("\n" + experience)
        
        # Add synthesis
        response.append("\n**How they connect:**")
        response.append("• His technical education provides the foundation for his AI/ML work")
        response.append("• Hands-on experience complements academic learning")
        response.append("• Current role allows application of both diploma and degree learnings")
        
        return "\n".join(response)
    
    # For skills and projects combination
    if ("skill" in query_lower and "project" in query_lower) or \
       ("technology" in query_lower and "project" in query_lower):
        
        skills = extract_skills(context)
        projects = extract_projects(context, query)
        
        response = ["Mayank's skills directly apply to his projects:"]
        response.append("\n" + skills)
        response.append("\n" + projects)
        
        response.append("\n**Key Connections:**")
        response.append("• AI/ML skills → PhishGuard AI and Part Number Recognition")
        response.append("• Full-stack development → Web applications and mobile apps")
        response.append("• Database skills → Backend systems for all projects")
        
        return "\n".join(response)
    
    # For general "tell me about" queries
    if query_lower.startswith("tell me about"):
        if "his" in query_lower:
            # Check if it's asking about a specific aspect
            if "background" in query_lower or "overview" in query_lower:
                return extract_comprehensive_credentials(context)
    
    return None

# Then update the answer() function to add synthesis handling:
def answer(query: str) -> str:
    """Main function to answer queries with Gemini primary + RAG fallback"""

    query_lower = query.lower()

    # QUICK REJECT: "Who won" questions without Mayank reference
    if query_lower.startswith("who won") and not any(k in query_lower for k in ["mayank", "his", "he"]):
        return (
            "This information is not available in Mayank's portfolio. "
            "Please ask about Mayank's background, skills, projects, experience, or education."
        )

    # FIRST: Check if query is clearly out-of-context
    if is_out_of_context(query):
        return (
            "This information is not available in Mayank's portfolio. "
            "Please ask about Mayank's background, skills, projects, experience, or education."
        )

    # Retrieve context
    context = retrieve_context(query, k=5)

    # Detect section
    section = detect_section(query)

    # Special handling for AI general questions
    if "ai" in query_lower or "artificial intelligence" in query_lower:
        if "general" in query_lower or query_lower.startswith("what is"):
            return (
                "This information is not available in Mayank's portfolio. "
                "If you're asking about Mayank's AI skills, please ask about his skills or experience."
            )

    # ---------- SYNTHESIS QUERIES ----------
    if section == "synthesis":
        synthesis_response = handle_synthesis_query(query, context)
        if synthesis_response:
            return synthesis_response
        # If no specialized handler, fall through to Gemini/RAG

    # Language queries (hard-locked)
    language_terms = ["speak", "language", "german", "english", "hindi", "marathi", "proficiency"]
    if any(t in query_lower for t in language_terms):
        if not any(t in query_lower for t in ["programming", "coding", "code"]):
            return extract_languages(context, query)

    # ---------- HARD-LOCKED SECTIONS ----------
    if section == "education":
        return extract_education(context)
    elif section == "experience":
        return extract_experience(context)
    elif section == "projects":
        return extract_projects(context, query)  # Pass query for specific project handling
    elif section == "skills":
        return extract_skills(context)
    elif section == "awards":
        return extract_awards(context)
    elif section == "certifications":
        return extract_certifications(context)
    elif section == "profile":
        if not any(k in query_lower for k in ["mayank", "his", "he", "him"]):
            return "This information is not available in Mayank's portfolio."
        return extract_profile(context)
    elif section == "comprehensive":
        return extract_comprehensive_credentials(context)

    # ---------- GEMINI PRIMARY ----------
    if USE_GEMINI:
        try:
            gemini_response = gemini_answer(query, context)

            if is_valid_gemini_answer(gemini_response, query):
                # Enforce hallucination safety one last time
                return enforce_no_hallucination(gemini_response, context)

        except Exception as e:
            print(f"[Gemini Error] {e}")

    # ---------- RAG FALLBACK (TRUSTED) ----------
    raw_answer = generate_answer(context, query)
    return enforce_no_hallucination(raw_answer, context)

# ---------- DIRECT ACCESS FUNCTIONS ----------
def get_all_education() -> str:
    """Direct access to all education entries"""
    return extract_education("")

def get_all_experience() -> str:
    """Direct access to all experience entries"""
    return extract_experience("")

def get_all_projects() -> str:
    """Direct access to all project entries"""
    return extract_projects("")

def get_all_skills() -> str:
    """Direct access to skills"""
    return extract_skills("")

def get_all_awards() -> str:
    """Direct access to all awards"""
    return extract_awards("")

def get_all_certifications() -> str:
    """Direct access to all certifications"""
    return extract_certifications("")

def get_profile() -> str:
    """Direct access to profile"""
    return extract_profile("")