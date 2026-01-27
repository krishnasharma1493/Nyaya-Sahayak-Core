#!/usr/bin/env python3
"""
Test script to verify Google Cloud Vertex AI credentials and connection
"""
import os
import json
import sys

def test_credentials():
    """Test if the key.json file is valid and accessible"""
    print("🔍 Testing Google Cloud Credentials...")
    print("=" * 60)
    
    # Check if key.json exists
    key_path = os.path.join(os.path.dirname(__file__), 'key.json')
    
    if not os.path.exists(key_path):
        print("❌ ERROR: key.json not found!")
        print(f"   Expected location: {key_path}")
        return False
    
    print(f"✅ key.json found at: {key_path}")
    
    # Load and validate JSON
    try:
        with open(key_path, 'r') as f:
            credentials = json.load(f)
        
        # Check required fields
        required_fields = [
            'type', 'project_id', 'private_key_id', 
            'private_key', 'client_email', 'client_id'
        ]
        
        for field in required_fields:
            if field not in credentials:
                print(f"❌ ERROR: Missing field '{field}' in key.json")
                return False
        
        print("✅ key.json structure is valid")
        print(f"   Project ID: {credentials['project_id']}")
        print(f"   Service Account: {credentials['client_email']}")
        
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in key.json - {e}")
        return False
    except Exception as e:
        print(f"❌ ERROR: Failed to read key.json - {e}")
        return False
    
    # Test Vertex AI connection
    print("\n🔌 Testing Vertex AI Connection...")
    print("=" * 60)
    
    try:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path
        
        import vertexai
        from vertexai.generative_models import GenerativeModel
        
        project_id = credentials.get('project_id')
        location = "us-central1"
        
        print(f"   Initializing Vertex AI...")
        print(f"   Project: {project_id}")
        print(f"   Location: {location}")
        
        vertexai.init(project=project_id, location=location)
        
        print("✅ Vertex AI initialized successfully!")
        
        # Test simple model loading
        print("\n🤖 Testing Gemini Model...")
        print("=" * 60)
        
        model = GenerativeModel("gemini-1.5-flash-001")
        print(f"✅ Model loaded: gemini-1.5-flash-001")
        
        # Test simple generation
        print("\n💬 Testing AI Generation...")
        print("=" * 60)
        
        response = model.generate_content("Say 'Hello from Nyaya-Sahayak!' in one sentence.")
        print(f"✅ AI Response: {response.text}")
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)
        print("\n✨ Your backend is ready to use Vertex AI!")
        print("   Next steps:")
        print("   1. Run: python manage.py runserver")
        print("   2. Test the API endpoints")
        print("   3. Connect your frontend!")
        
        return True
        
    except ImportError as e:
        print(f"❌ ERROR: Missing required package - {e}")
        print("   Run: pip3 install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ ERROR: Vertex AI connection failed - {e}")
        print("\n   Possible issues:")
        print("   - Vertex AI API not enabled in Google Cloud")
        print("   - Service account doesn't have correct permissions")
        print("   - Project ID is incorrect")
        return False

if __name__ == "__main__":
    success = test_credentials()
    sys.exit(0 if success else 1)
