"""
Nyaya-Sahayak Django Views (Gemini 1.5 Pro Version)
===================================================

Simplified views using Gemini Context Caching for legal queries.

Author: Nyaya-Sahayak Team
"""

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import traceback
import os
import tempfile
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file  
# Get path to project directory (parent of app/)
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

# Import our new legal engine
from app.legal_engine import get_legal_brain


def home(request):
    """Render the home page"""
    return render(request, 'index.html')


def legal_console(request):
    """Render the hyper-modern legal console interface"""
    return render(request, 'legal_console.html')


@csrf_exempt
def chat(request):
    """
    Handle legal queries using Gemini 1.5 Pro with Context Caching
    
    This endpoint:
    1. Gets the user's query
    2. Retrieves chat history from session
   3. Queries the cached legal brain
    4. Returns the response
    5. Updates session with chat history
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)
    
    try:
        user_query = ""
        context_files = []
        uploaded_context_file = None
        temp_path = None

        # Determine request type (JSON vs Multipart)
        content_type = request.META.get('CONTENT_TYPE', '')
        
        if 'multipart/form-data' in content_type:
            # Handle Hybrid Mode (File + Query)
            user_query = request.POST.get('query', '').strip()
            
            if request.FILES.get('file'):
                print(f"📂 [UPLOAD] Processing file upload via chat...")
                uploaded_file = request.FILES['file']
                
                # Save to temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{uploaded_file.name}") as tmp:
                    for chunk in uploaded_file.chunks():
                        tmp.write(chunk)
                    temp_path = tmp.name
                
                # Upload to Gemini
                # Force configuration to ensure upload works
                api_key = os.getenv('GEMINI_API_KEY')
                if not api_key:
                    load_dotenv(BASE_DIR / '.env')
                    api_key = os.getenv('GEMINI_API_KEY')
                
                if not api_key:
                    raise ValueError("GEMINI_API_KEY not found in environment")
                    
                genai.configure(api_key=api_key)
                
                print("📤 [GEMINI] Uploading context file...")
                uploaded_context_file = genai.upload_file(temp_path)
                context_files.append(uploaded_context_file)
                
        else:
            # Handle Standard Text Mode (JSON)
            data = json.loads(request.body)
            user_query = data.get('query', '').strip()
        
        if not user_query:
            return JsonResponse({'error': 'Query cannot be empty'}, status=400)
        
        print(f"\n🔍 [QUERY] User asked: {user_query}")
        if context_files:
            print(f"📎 [CONTEXT] Including {len(context_files)} uploaded file(s)")
        
        # Get or initialize chat history from session
        chat_history = request.session.get('chat_history', [])
        
        # Get the legal brain (singleton instance)
        brain = get_legal_brain()
        
        # Query the legal brain
        print("🧠 [PROCESSING] Querying legal brain...")
        response_text = brain.query(user_query, chat_history, context_files=context_files)
        
        # Cleanup uploaded file immediately
        if uploaded_context_file:
            print("🗑️ [CLEANUP] Deleting temporary chat file...")
            try:
                uploaded_context_file.delete()
                if temp_path and os.path.exists(temp_path):
                    os.unlink(temp_path)
            except Exception as e:
                print(f"⚠️ Cleanup warning: {e}")
        
        # Update chat history in session
        chat_history.append({
            "role": "user",
            "parts": [user_query]
        })
        chat_history.append({
            "role": "model",
            "parts": [response_text]
        })
        
        # Store updated history (keep last 10 exchanges = 20 messages)
        request.session['chat_history'] = chat_history[-20:]
        
        print(f"✅ [RESPONSE] Generated {len(response_text)} characters")
        
        # Return successful response
        return JsonResponse({
            'success': True,
            'response': response_text,
            'query': user_query,
            'metadata': {
                'model': 'gemini-1.5-pro-001',
                'method': 'context_caching' if brain.use_cache else 'direct_pdf',
                'history_length': len(chat_history)
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        
        print(f"❌ [ERROR] {error_msg}")
        print(f"📋 [TRACE] {error_trace}")
        
        return JsonResponse({
            'success': False,
            'error': error_msg,
            'message': 'An error occurred while processing your query. Please try again.'
        }, status=500)


@csrf_exempt
def clear_history(request):
    """Clear the chat history from the session"""
    if request.method == 'POST':
        request.session['chat_history'] = []
        return JsonResponse({'success': True, 'message': 'Chat history cleared'})
    return JsonResponse({'error': 'Only POST requests allowed'}, status=405)


@csrf_exempt
def analyze_document(request):
    """
    Document upload endpoint (kept for compatibility with UI)
    
    Note: With Context Caching, legal PDFs are pre-loaded in the cache,
    so this endpoint is primarily for user document uploads (contracts, etc.)
    """
    if request.method == 'POST' and request.FILES.get('file'):
        try:
            uploaded_file = request.FILES.get('file')
            
            # For now, return a placeholder response
            # You can extend this to analyze user-uploaded documents
            return JsonResponse({
                'success': True,
                'note': 'Document analysis feature can be added here'
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'No file uploaded'}, status=400)


@csrf_exempt
def verify_document(request):
    """
    Contract Verification Endpoint (Gemini 1.5 Pro)
    
    1. Uploads file to Gemini (temp storage)
    2. Analyzes for risks and missing clauses
    3. Deletes file immediately for privacy
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)
        
    if not request.FILES.get('file'):
        return JsonResponse({'error': 'No file uploaded'}, status=400)
        
    temp_path = None
    uploaded_file_ref = None
    
    try:
        # 1. Save to secure temp file
        uploaded_file = request.FILES['file']
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{uploaded_file.name}") as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            temp_path = tmp.name
            
        print(f"🔒 [SECURE UPLOAD] Saved temp file: {temp_path}")
        
        # 2. Upload to Gemini
        # Ensure API key is set (loaded from .env at top of file)
        if not os.getenv('GEMINI_API_KEY'):
            raise ValueError("GEMINI_API_KEY not found in environment")
            
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        
        print("📤 [GEMINI] Uploading file for analysis...")
        uploaded_file_ref = genai.upload_file(temp_path)
        
        # 3. Analyze with strict prompt
        print("🧠 [GEMINI] Analyzing contract risks...")
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
        Analyze this legal contract STRICTLY. 
        Identify exactly 3 MAJOR legal risks and ANY missing standard clauses.
        
        Format output as Markdown:
        # 🚨 LEGAL AUDIT REPORT
        
        ## ⚠️ CRITICAL RISKS
        1. **[Risk Title]**: [Explanation]
        2. **[Risk Title]**: [Explanation]
        3. **[Risk Title]**: [Explanation]
        
        ## ❌ MISSING CLAUSES
        - [Clause Name]: [Why it's needed]
        
        ## ⚖️ VERDICT
        [One sentence summary: Safe to sign or needs revision?]
        """
        
        response = model.generate_content([uploaded_file_ref, prompt])
        
        # 4. cleanup immediately
        print("🗑️ [PRIVACY] Deleting file from Gemini...")
        uploaded_file_ref.delete()
        uploaded_file_ref = None
        
        # Cleanup local temp
        os.unlink(temp_path)
        temp_path = None
        
        return JsonResponse({
            'success': True,
            'analysis': response.text
        })
        
    except Exception as e:
        # Cleanup on error
        if uploaded_file_ref:
            try:
                uploaded_file_ref.delete()
            except:
                pass
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
            
        print(f"❌ [VERIFY ERROR] {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'No file uploaded'}, status=400)


@csrf_exempt
def draft_legal_notice(request):
    """
    Draft Legal Notice Endpoint
    Generates a formal legal notice from simple English complaint.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        sender = data.get('sender')
        receiver = data.get('receiver')
        complaint = data.get('complaint')
        
        if not all([sender, receiver, complaint]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
            
        # Ensure API Key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            load_dotenv(BASE_DIR / '.env')
            api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found")
            
        genai.configure(api_key=api_key)
        
        # Use Gemini 2.5 Flash as it works in this env
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_prompt = f"""
        ROLE: You are an expert Senior Advocate at the High Court of India.
        TASK: Convert the following 'Simple English' complaint into a formal Indian Legal Notice.
        
        INPUTS: 
        Sender: {sender}
        Receiver: {receiver}
        Complaint: {complaint}
        
        REQUIREMENTS:
        1. TONE: Strictly legal, authoritative, and formal ("My client states...", "You are legally liable...").
        2. STRUCTURE:
           - Ref. No. [Date]
           - LEGAL NOTICE (Centered, Bold)
           - To, [Receiver Name/Address]
           - Subject: [Subject Line]
           - Body Paragraphs (numbered)
           - Demand Section (specific timeline, e.g., 15 days)
           - Footer (Advocate Signature)
        3. CITATIONS: Cite relevant Indian Acts (e.g., IPC Section 406/420, Section 138 NI Act, Consumer Protection Act 2019) automatically based on the nature of the complaint.
        4. OUTPUT FORMAT: Return ONLY the legal notice text in clean Markdown. No intro/outro text.
        """
        
        print("⚖️ [NOTICE] Generating legal notice...")
        response = model.generate_content(system_prompt)
        
        return JsonResponse({
            'success': True,
            'notice': response.text
        })
        
    except Exception as e:
        print(f"❌ [NOTICE ERROR] {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# Health check endpoint
def health_check(request):
    """Check if the legal brain is initialized"""
    try:
        brain = get_legal_brain()
        return JsonResponse({
            'status': 'healthy',
            'legal_brain': 'initialized',
            'cache_status': 'active'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)


def tools_dashboard(request):
    """Render the legal tools dashboard with AI Notice Generator"""
    return render(request, 'tools_dashboard.html')
