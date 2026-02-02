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
        # Parse request body
        data = json.loads(request.body)
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return JsonResponse({'error': 'Query cannot be empty'}, status=400)
        
        print(f"\n🔍 [QUERY] User asked: {user_query}")
        
        # Get or initialize chat history from session
        chat_history = request.session.get('chat_history', [])
        
        # Get the legal brain (singleton instance)
        brain = get_legal_brain()
        
        # Query the legal brain
        print("🧠 [PROCESSING] Querying legal brain...")
        response_text = brain.query(user_query, chat_history)
        
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
                'method': 'context_caching',
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
                'message': f'Document uploaded: {uploaded_file.name}',
                'note': 'Document analysis feature can be added here'
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'No file uploaded'}, status=400)


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
