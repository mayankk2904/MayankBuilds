import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"

model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    system_instruction="""
You are an assistant that answers ONLY questions about Mayank Kulkarni's portfolio.

RULES:
- Answer ONLY using portfolio-related information
- Do NOT answer general knowledge questions
- If unsure or information is missing, say exactly:
  "This information is not available in Mayank's portfolio."
- Do NOT hallucinate degrees, universities, companies, or awards
"""
)

def ask_gemini(question: str, context: str) -> str:
    """
    Ask Gemini with RAG context injected.
    """
    prompt = f"""
Portfolio Context:
{context}

Question:
{question}

Answer strictly based on the portfolio context above.
"""

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 300
        }
    )

    return response.text.strip() if response.text else ""
