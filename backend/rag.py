import json
import faiss
from sentence_transformers import SentenceTransformer
from model import generate_answer
import re

# Load FAISS index
index = faiss.read_index("portfolio.index")

# Load documents with metadata
with open("texts.json", "r", encoding="utf-8") as f:
    documents = json.load(f)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ---------- INTENT DETECTION ----------
def detect_section(question: str):
    q = question.lower()
    
    # "Credentials" should go to education or a comprehensive response
    if "credential" in q or "qualification" in q or "background" in q:
        return "comprehensive"  # We'll handle this specially
    
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
        "what does" in q):
        return "profile"
    
    return None

# ---------- RETRIEVAL ----------
def retrieve_context(query: str, k: int = 3) -> str:
    query_embedding = embedder.encode([query]).astype("float32")
    _, indices = index.search(query_embedding, k * 3)

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

def extract_projects(context: str) -> str:
    """Extract all project entries from context"""
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
            elif line.startswith("Description:"):
                entry["description"] = line.replace("Description:", "").strip()
            elif line.startswith("Technologies:"):
                entry["technologies"] = line.replace("Technologies:", "").strip()
            elif line.startswith("Role:"):
                entry["role"] = line.replace("Role:", "").strip()
            elif line.startswith("Timeline:"):
                entry["timeline"] = line.replace("Timeline:", "").strip()
        
        if entry and "name" in entry:
            project_entries.append(entry)
    
    if not project_entries:
        return "Project information is not available in Mayank's portfolio."
    
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

def extract_skills(context: str) -> str:
    """Extract skills information from context"""
    # Get skills document directly
    skills_docs = get_documents_by_section("skills")
    
    if not skills_docs:
        return "Skills information is not available in Mayank's portfolio."
    
    skills_content = skills_docs[0]["content"]
    return f"Mayank's Skills:\n\n{skills_content}"

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
    
    # Add education
    education = extract_education(context)
    if "Education:" in education:
        response_parts.append(education)
    
    # Add certifications
    certifications = extract_certifications(context)
    if "Certifications:" in certifications:
        response_parts.append(certifications)
    
    # Add experience summary
    exp_docs = get_documents_by_section("experience")
    if exp_docs:
        # Get current/most recent role
        current_role = None
        for doc in exp_docs:
            lines = doc["content"].split("\n")
            for line in lines:
                line = line.strip()
                if line.startswith("Role:"):
                    role = line.replace("Role:", "").replace("[EXPERIENCE]", "").strip()
                    if "Present" in doc["content"] or "present" in doc["content"].lower():
                        current_role = role
                        break
            if current_role:
                break
        
        if current_role:
            response_parts.append(f"Current Role: {current_role}")
    
    # Add skills summary
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

# ---------- MAIN ANSWER FUNCTION ----------
def answer(query: str) -> str:
    """Main function to answer queries with appropriate hard-locks"""
    # Get context for general queries
    context = retrieve_context(query, k=3)
    
    # Determine the section and use appropriate hard-lock
    section = detect_section(query)
    
    # Check for language-specific queries first
    query_lower = query.lower()
    language_queries = ["speak", "language", "german", "english", "hindi", "marathi", "proficiency"]
    if any(term in query_lower for term in language_queries):
        # Check if it's about spoken languages
        if "programming" not in query_lower and "code" not in query_lower and "coding" not in query_lower:
            return extract_languages(context, query)
    
    if section == "education":
        return extract_education(context)
    elif section == "experience":
        return extract_experience(context)
    elif section == "projects":
        return extract_projects(context)
    elif section == "skills":
        return extract_skills(context)
    elif section == "awards":
        return extract_awards(context)
    elif section == "certifications":
        return extract_certifications(context)
    elif section == "profile":
        return extract_profile(context)
    elif section == "comprehensive":
        return extract_comprehensive_credentials(context)
    else:
        # For general queries or mixed queries, use LLM with validation
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