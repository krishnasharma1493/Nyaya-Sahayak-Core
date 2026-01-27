#!/usr/bin/env python3
"""
Alternative test using Google GenerativeAI SDK
"""
import os
import json

def test_with_genai():
    """Test with the google-generativeai package"""
    print("🔍 Testing with Google GenerativeAI SDK...")
    print("=" * 60)
    
    key_path = os.path.join(os.path.dirname(__file__), 'key.json')
    
    try:
        with open(key_path, 'r') as f:
            credentials = json.load(f)
        
        project_id = credentials.get('project_id')
        print(f"✅ Credentials loaded")
        print(f"   Project: {project_id}")
        
        # Set environment variable
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path
        
        # Try using google-generativeai (simpler API)
        import google.generativeai as genai
        
        # Configure with API key approach (if available)
        # For service accounts, we'll use the default credentials
        print("\n🤖 Testing Gemini via GenerativeAI SDK...")
        print("=" * 60)
        
        # Create model instance
        model = genai.GenerativeModel('gemini-pro')
        
        print("✅ Model created: gemini-pro")
        
        # Test generation
        print("\n💬 Testing AI Generation...")
        response = model.generate_content("Say 'Nyaya-Sahayak is ready!' in one sentence.")
        
        print(f"✅ AI Response: {response.text}")
        
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Google AI is working!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nℹ️  Note: The google-generativeai SDK may need an API key")
        print("   instead of service account credentials.")
        print("\n   For service accounts, we'll use the Django endpoints")
        print("   which work with Vertex AI directly.")
        return False

def check_permissions():
    """Check service account permissions"""
    print("\n\n📋 Checking Service Account Setup...")
    print("=" * 60)
    
    key_path = os.path.join(os.path.dirname(__file__), 'key.json')
    
    try:
        with open(key_path, 'r') as f:
            credentials = json.load(f)
        
        email = credentials.get('client_email')
        project_id = credentials.get('project_id')
        
        print(f"Service Account: {email}")
        print(f"Project: {project_id}")
        print("\n⚠️  IMPORTANT: This service account needs these IAM roles:")
        print("   1. Vertex AI User (or Administrator)")
        print("   2. Service Account Token Creator (if not owner)")
        print("\n🔧 To grant permissions:")
        print(f"   1. Go to: https://console.cloud.google.com/iam-admin/iam?project={project_id}")
        print(f"   2. Find: {email}")
        print("   3. Click Edit (pencil icon)")
        print("   4. Add role: 'Vertex AI User'")
        print("   5. Save")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading credentials: {e}")
        return False

if __name__ == "__main__":
    # Test with GenAI SDK
    success = test_with_genai()
    
    # Show permission info
    check_permissions()
    
    if not success:
        print("\n\n" + "=" * 60)
        print("ℹ️  ALTERNATIVE: Use Django Backend Directly")
        print("=" * 60)
        print("\nThe backend endpoints in views.py should still work!")
        print("Let's test the Django server instead:")
        print("\n  1. python3 manage.py runserver")
        print("  2. Test the API endpoints")
        print("\nThis will bypass the SDK compatibility issues.")
