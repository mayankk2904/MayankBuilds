from rag import answer

questions = [
    "What is Mayank's education?",
    "What is his project YogAR about?",
    "How does Mayank's AI experience connect to his projects?",
    "Tell me about his experience and education",
    "What is the Part Number Recognition system project?",
    "Does Mayank speak German?",
]

for q in questions:
    print("\nQ:", q)
    print("A:", answer(q))
