from django.shortcuts import render
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from google.oauth2 import service_account

# Create your views here.
def home(request):
    return render(request, 'index.html')

@csrf_exempt
def analyze_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        local_path = fs.path(filename)
        
        try:
            # Load credentials and init Vertex AI
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            key_path = os.path.join(base_dir, 'key.json')
            
            if not os.path.exists(key_path):
                 raise FileNotFoundError(f"Key file not found at: {key_path}")

            credentials = service_account.Credentials.from_service_account_file(key_path)
            
            # Get project_id from credentials or file
            with open(key_path, 'r') as f:
                creds_data = json.load(f)
                project_id = creds_data.get('project_id')

            vertexai.init(project=project_id, location="us-central1", credentials=credentials)
            
            # Use a multimodal model
            model = GenerativeModel("gemini-1.5-flash-001")
            
            with open(local_path, "rb") as f:
                file_data = f.read()

            # Create the Part object
            document_part = Part.from_data(
                mime_type=uploaded_file.content_type,
                data=file_data
            )
            
            prompt = """
            You are a legal expert AI. Analyze the attached legal document.
            Provide a structured JSON response with the following fields:
            - summary: A brief summary of the document.
            - key_clauses: A list of important clauses found.
            - risks: Potential legal risks or liabilities.
            - verdict: A probabilistic success score (0-100) and brief reasoning for case viability.
            
            Output ONLY the JSON.
            """
            
            response = model.generate_content(
                [document_part, prompt]
            )
            
            # parse response text to json
            analysis_text = response.text.replace('```json', '').replace('```', '').strip()
            # Try to parse it to ensure valid JSON, or just return text
            try:
                analysis_json = json.loads(analysis_text)
            except:
                analysis_json = {"raw_text": analysis_text}

            # Cleanup
            if os.path.exists(local_path):
                os.remove(local_path)

            return JsonResponse({'status': 'success', 'data': analysis_json})

        except Exception as e:
            # Cleanup on error
            if os.path.exists(local_path):
                os.remove(local_path)
            print(f"Error in analyze_document: {str(e)}") # Add debug logging
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def chat_query(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            
            # Simple static response for now, as requested to revert "added facility"
            response_text = "I am Nyaya-Sahayak. Please upload a document for legal analysis."
            
            return JsonResponse({'status': 'success', 'response': response_text})
            
        except Exception as e:
             print(f"Error in chat_query: {str(e)}") 
             return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
