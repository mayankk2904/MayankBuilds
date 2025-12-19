from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    device_map="auto",
    torch_dtype=torch.float16
)

model.eval()

# List of portfolio-related keywords that questions MUST contain
PORTFOLIO_KEYWORDS = [
    "mayank", "portfolio", "profile", "education", "experience",
    "skill", "project", "award", "certification", "work", "job",
    "contact", "location", "available", "hire", "background",
    "degree", "college", "university", "school", "study",
    "role", "position", "company", "employ", "technical",
    "technology", "programming", "code", "ai", "ml", 
    "machine learning", "artificial intelligence", "develop",
    "build", "create", "design", "system", "certificate",
    "certified", "honor", "recognition", "language", "speak",
    "german", "english", "hindi", "marathi", "interests",
    "hobby", "passion", "focus", "area", "credentials",
    "qualification", "achievement", "accomplishment"
]

def is_portfolio_question(question: str) -> bool:
    """Check if question is about the portfolio"""
    question_lower = question.lower()
    
    # Check for explicit portfolio references
    if "mayank" in question_lower or "portfolio" in question_lower:
        return True
    
    # Check for portfolio keywords
    for keyword in PORTFOLIO_KEYWORDS:
        if keyword in question_lower:
            return True
    
    # Questions starting with "what" about work/education/skills
    if question_lower.startswith("what"):
        what_topics = ["what does", "what is", "what are", "what was", "what were"]
        if any(topic in question_lower for topic in what_topics):
            # Check if it's about Mayank's attributes
            mayank_attributes = ["his", "mayank's", "he", "him"]
            if any(attr in question_lower for attr in mayank_attributes):
                return True
    
    # Questions starting with "where", "when", "how" about Mayank
    if question_lower.startswith(("where", "when", "how")):
        mayank_attributes = ["his", "mayank", "he", "does mayank"]
        if any(attr in question_lower for attr in mayank_attributes):
            return True
    
    return False

def build_prompt(context: str, question: str):
    """Build prompt with strict instructions"""
    
    # First check if this is a portfolio question
    if not is_portfolio_question(question):
        return "REJECT: This is not a portfolio-related question."
    
    return f"""<|im_start|>system
You are an AI assistant that ONLY answers questions about Mayank Kulkarni's portfolio.

CRITICAL RULES:
1. You MUST answer questions ONLY about Mayank's portfolio content
2. Use ONLY the exact text from the provided context
3. DO NOT use any external knowledge or common sense
4. DO NOT answer questions about: weather, sports, news, current events, general knowledge, or any topic not in the portfolio
5. If information is not in the context, say EXACTLY: "This information is not available in Mayank's portfolio."
6. Do not rephrase, interpret, or add to the information
7. If the question is ambiguous or unclear, ask for clarification about Mayank's portfolio

VALID TOPICS (only answer these):
- Mayank's education, degrees, schools
- Mayank's work experience, jobs, roles
- Mayank's skills, technologies, programming languages
- Mayank's projects, applications, systems built
- Mayank's awards, certifications, recognitions
- Mayank's profile: name, title, location, bio, availability
- Mayank's spoken languages: English, Hindi, Marathi, German
- Mayank's interests, focus areas

INVALID TOPICS (do NOT answer these):
- Weather, temperature, climate
- Sports, games, tournaments
- News, politics, current events
- General knowledge questions
- Other people's information
- Any topic not specifically about Mayank's portfolio

Context:
{context}

Question: {question}

Remember: If the answer is not EXACTLY in the context above, say "This information is not available in Mayank's portfolio."<|im_end|>
<|im_start|>assistant
"""

def generate_answer(context: str, question: str):
    """Generate answer with strict validation"""
    
    # Check if this is a portfolio question before even using the model
    if not is_portfolio_question(question):
        return "This information is not available in Mayank's portfolio. Please ask about Mayank's background, skills, projects, experience, education, or other portfolio-related topics."
    
    prompt = build_prompt(context, question)
    
    # If prompt starts with REJECT, return the rejection message
    if prompt.startswith("REJECT:"):
        return "This information is not available in Mayank's portfolio. Please ask about Mayank's background, skills, projects, experience, education, or other portfolio-related topics."
    
    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,  # Reduced to prevent rambling
            temperature=0.01,     # Lower temperature for more deterministic output
            do_sample=False,      # Use greedy decoding for more consistent responses
            top_p=0.95,
            repetition_penalty=1.2,  # Higher penalty to avoid repetition
            no_repeat_ngram_size=3,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the assistant's response
    if "<|im_start|>assistant" in full_output:
        answer_text = full_output.split("<|im_start|>assistant")[-1].strip()
        # Clean up any remaining tags
        answer_text = answer_text.replace("<|im_end|>", "").strip()
    else:
        answer_text = full_output.strip()
    
    # Post-process to enforce strict rules
    answer_lower = answer_text.lower()
    
    # Check if answer contains forbidden content
    forbidden_content = [
        "weather", "forecast", "temperature", "°c", "°f", "sunshine", "rain",
        "cricket", "football", "sports", "world cup", "tournament",
        "news", "current events", "politics", "government",
        "in general", "generally speaking", "as an ai", "as a language model"
    ]
    
    for forbidden in forbidden_content:
        if forbidden in answer_lower:
            return "This information is not available in Mayank's portfolio."
    
    # Check if answer is too generic or doesn't mention portfolio
    if len(answer_text) > 0 and "mayank" not in answer_lower and "portfolio" not in answer_lower:
        # If it's a short answer that might be valid (like "Red"), check context
        if len(answer_text.split()) > 3:  # More than 3 words should mention Mayank
            if "color" in question.lower() or "favorite" in question.lower():
                # For favorite color questions, allow short answers
                pass
            else:
                return "This information is not available in Mayank's portfolio."
    
    # Ensure "not available" responses are consistent
    if "not available" in answer_lower or "not in the portfolio" in answer_lower:
        return "This information is not available in Mayank's portfolio."
    
    return answer_text.strip()