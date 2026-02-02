"""
Streaming chat endpoint for Google Gemini-style instant responses
"""
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def chat_api_stream(request):
    """
    Handle legal queries with STREAMING responses (Google Gemini style)
    
    This endpoint:
    1. Gets the user's query
    2. Retrieves chat history from session
    3. Streams the response chunk-by-chunk
    4. Returns SSE (Server-Sent Events) format
    5. Updates session with chat history
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)
    
    def event_stream():
        """Generator that yields Server-Sent Events"""
        try:
            # Parse request body
            data = json.loads(request.body)
            user_query = data.get('query', '').strip()
            
            if not user_query:
                yield f'data: {json.dumps({"error": "Query cannot be empty"})}\n\n'
                return
            
            print(f"\n🔍 [STREAMING QUERY] User asked: {user_query}")
            
            # Get or initialize chat history from session
            chat_history = request.session.get('chat_history', [])
            
            # Get the legal brain (singleton instance)
            from app.views import get_legal_brain
            brain = get_legal_brain()
            
            # Send initial metadata
            yield f'data: {json.dumps({"type": "start", "query": user_query})}\n\n'
            
            # Stream the response
            print("🧠 [PROCESSING] Streaming legal brain response...")
            full_response = ""
            
            for chunk in brain.query_stream(user_query, chat_history):
                full_response += chunk
                # Send each chunk as SSE
                yield f'data: {json.dumps({"type": "chunk", "text": chunk})}\n\n'
            
            # Get full response from generator
            if hasattr(brain, '_last_response'):
                full_response = brain._last_response
            
            # Update chat history in session
            chat_history.append({
                "role": "user",
                "parts": [user_query]
            })
            chat_history.append({
                "role": "model",
                "parts": [full_response]
            })
            
            # Store updated history (keep last 10 exchanges = 20 messages)
            request.session['chat_history'] = chat_history[-20:]
            
            # Send completion event
            yield f'data: {json.dumps({"type": "done", "metadata": {"model": "gemini-1.5-pro-001", "method": "streaming", "length": len(full_response)}})}\n\n'
            
            print(f"✅ [STREAMING COMPLETE] Generated {len(full_response)} characters")
            
        except json.JSONDecodeError:
            yield f'data: {json.dumps({"type": "error", "message": "Invalid JSON in request body"})}\n\n'
        except Exception as e:
            import traceback
            error_msg = str(e)
            error_trace = traceback.format_exc()
            print(f"❌ [STREAMING ERROR] {error_msg}")
            print(f"📋 [TRACE] {error_trace}")
            yield f'data: {json.dumps({"type": "error", "message": error_msg})}\n\n'
    
    # Return streaming response with SSE headers
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
    return response
