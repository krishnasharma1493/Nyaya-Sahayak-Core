# Test Script for Legal Engine
# =============================

import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyAQRK98O2VIy6_RiDxTKB4IOo-UvDJkI7o'

from app.legal_engine import get_legal_brain

print("\n" + "="*70)
print("🧪 TESTING LEGAL BRAIN INITIALIZATION")
print("="*70 + "\n")

try:
    # This will initialize the brain
    brain = get_legal_brain()
    
    print("\n✅ SUCCESS! Legal brain initialized.")
    print("\nNow you can test a query:")
    print("brain.query('What is Section 420 IPC?')")
    
except FileNotFoundError as e:
    print(f"\n⚠️  EXPECTED ERROR: {e}")
    print("\n📋 ACTION REQUIRED:")
    print("   1. Add legal PDF files to: project/legal_docs/")
    print("   2. Run this test again")
    print("\n   PDFs needed:")
    print("   - IPC.pdf (Indian Penal Code)")
    print("   - CrPC.pdf (Criminal Procedure Code)")
    print("   - Motor_Vehicles_Act.pdf")
    print("   - etc.")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
