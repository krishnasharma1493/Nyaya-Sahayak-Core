#!/usr/bin/env python3
"""
Quick test to verify API key works with Google Gemini
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

print("🔍 Testing Google API Key with Gemini...")
print("=" * 60)

try:
    # Get API key
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        print("❌ ERROR: GOOGLE_API_KEY not found in .env file")
        exit(1)
    
    print(f"✅ API Key loaded (ends with: ...{api_key[-10:]})")
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    
    # Create model
    model = genai.GenerativeModel('gemini-pro-latest')
    
    print("✅ Gemini Pro model initialized")
    
    # Test generation
    print("\n💬 Testing AI Generation...")
    print("   Prompt: 'Say Hello from Nyaya-Sahayak!'")
    
    response = model.generate_content("Say 'Hello from Nyaya-Sahayak!' in one sentence.")
    
    print(f"\n✅ AI Response:")
    print(f"   {response.text}")
    
    print("\n" + "=" * 60)
    print("🎉 SUCCESS! API Key Works Perfectly!")
    print("=" * 60)
    print("\n✨ Your backend is ready!")
    print("   Next: Start Django server with: python3 manage.py runserver")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nTroubleshooting:")
    print("1. Check if .env file exists in /project/ folder")
    print("2. Verify GOOGLE_API_KEY is set correctly")
    print("3. Make sure google-generativeai package is installed")
