import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("all-MiniLM-L6-v2")

with open("data/rag_knowledge.json", "r", encoding="utf-8") as f:
    data = json.load(f)

documents = []

def add_doc(section: str, content: str):
    documents.append({
        "section": section,
        "content": content.strip()
    })

# ---------- PROFILE ----------
profile = data["profile"]
add_doc(
    "profile",
    f"""
Name: {profile['name']}
Title: {profile['title']}
Location: {profile['location']}
Bio: {profile['bio']}
Availability: {profile['availability']}
Focus Areas: {", ".join(profile['focus'])}
Languages Spoken: {", ".join(profile['languages'])}
Interests: {", ".join(profile['interests'])}
"""
)

# ---------- EXPERIENCE ----------
for exp in data["experience"]:
    add_doc(
        "experience",
        f"""
Role: {exp['role']}
Company: {exp['company']}
Period: {exp['period']}
Description: {exp['description']}
Achievements: {", ".join(exp.get("achievements", []))}
Technologies: {", ".join(exp['technologies'])}
"""
    )

# ---------- EDUCATION ----------
for edu in data["education"]:
    add_doc(
        "education",
        f"""
Degree: {edu['degree']}
Institution: {edu['institution']}
Years: {edu['year']}
"""
    )

# ---------- CERTIFICATIONS ----------
for cert in data["certifications"]:
    add_doc(
        "certifications",
        f"""
Certification: {cert}
"""
    )

# ---------- AWARDS ----------
for award in data["awards"]:
    add_doc(
        "awards",
        f"""
Award Title: {award['title']}
Description: {award['description']}
"""
    )

# ---------- SKILLS ----------
skills = data["skills"]
add_doc(
    "skills",
    f"""
AI & ML: {", ".join(skills['ai_ml'])}
Development: {", ".join(skills['development'])}
Backend & Databases: {", ".join(skills['backend_database'])}
Soft Skills: {", ".join(skills['soft_skills'])}
"""
)

# ---------- PROJECTS ----------
for proj in data["projects"]:
    add_doc(
        "projects",
        f"""
Project Name: {proj['name']}
Description: {proj['description']}
Features: {", ".join(proj.get('features', []))}
Technologies: {", ".join(proj['technologies'])}
Role: {proj['role']}
Timeline: {proj['timeline']}
"""
    )

# ---------- CREATE EMBEDDINGS ----------
texts = [doc["content"] for doc in documents]
embeddings = embedder.encode(texts)
embeddings = np.array(embeddings).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "portfolio.index")

with open("texts.json", "w", encoding="utf-8") as f:
    json.dump(documents, f, indent=2)

print("✅ Portfolio RAG knowledge indexed successfully")
