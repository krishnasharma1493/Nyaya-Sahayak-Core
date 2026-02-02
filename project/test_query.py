import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyAQRK98O2VIy6_RiDxTKB4IOo-UvDJkI7o'

from app.legal_engine import get_legal_brain

print("\n🧪 TESTING ACTUAL LEGAL QUERY\n")

# Get the brain (should use existing cache)
brain = get_legal_brain()

# Test query
test_query = "What is Section 420 IPC? Give me a brief explanation."
print(f"📝 Query: {test_query}\n")
print("="*70)

response = brain.query(test_query)

print(response)
print("="*70)
print("\n✅ TEST COMPLETE!")
