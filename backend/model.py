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

def build_prompt(context: str, question: str):
    return f"""
You are an AI assistant for Mayank Kulkarni's portfolio.

CRITICAL RULES:
1. Answer ONLY using the EXACT text from the context below.
2. DO NOT invent, infer, or assume ANY information not explicitly in the context.
3. If the context doesn't contain the answer, say: "This information is not available in Mayank's portfolio."
4. DO NOT rephrase, translate, or reinterpret any information.
5. Keep answers concise and factual.

Context:
{context}

Question:
{question}

Answer ONLY based on the context above. If unsure, say "This information is not available in Mayank's portfolio."

Answer:
"""

def generate_answer(context: str, question: str):
    prompt = build_prompt(context, question)

    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.1,
            do_sample=True,  # Changed to True to fix warnings
            top_p=0.9,
            top_k=50,
            repetition_penalty=1.1
        )

    full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extract only the answer
    if "Answer:" in full_output:
        answer_text = full_output.split("Answer:")[-1].strip()
        # Remove any additional instructions or questions
        if "\nQuestion:" in answer_text:
            answer_text = answer_text.split("\nQuestion:")[0]
        if "\nContext:" in answer_text:
            answer_text = answer_text.split("\nContext:")[0]
        return answer_text

    return full_output.strip()