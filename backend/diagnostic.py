# diagnostic.py
import json

with open("texts.json", "r", encoding="utf-8") as f:
    documents = json.load(f)

print("Document Structure Analysis:")
print("=" * 80)

for i, doc in enumerate(documents):
    print(f"\nDocument {i}:")
    print(f"Section: {doc['section']}")
    print("Content preview (first 200 chars):")
    print(doc['content'][:200])
    print("-" * 80)

# Count by section
section_counts = {}
for doc in documents:
    section = doc['section']
    section_counts[section] = section_counts.get(section, 0) + 1

print("\nSection Distribution:")
for section, count in section_counts.items():
    print(f"{section}: {count} document(s)")