"""
Streaming-enabled legal query method for Google Gemini-style UX
"""
from typing import Optional, List, Generator
import json
import re

def query_stream(self, user_question: str, chat_history: Optional[List] = None) -> Generator[str, None, None]:
    """
    Stream the legal brain response chunk-by-chunk (Google Gemini style)
    
    Args:
        user_question: The legal query from the user
        chat_history: Optional chat history for context
        
    Yields:
        Chunks of text as they're generated
    """
    if self.model is None:
        raise RuntimeError("Legal brain not initialized. Call initialize_legal_brain() first.")
    
    try:
        if self.use_cache:
            # CACHED MODE: Use model with cached context
            if chat_history:
                chat = self.model.start_chat(history=chat_history)
                response = chat.send_message(user_question, stream=True)  # ← STREAMING ENABLED
            else:
                response = self.model.generate_content(user_question, stream=True)  # ← STREAMING ENABLED
        else:
            # DIRECT PDF MODE: Send PDFs with each query
            content = [user_question] + self.uploaded_files
            
            if chat_history:
                # Build history into prompt
                history_text = "\n\nPrevious conversation:\n"
                for msg in chat_history[-6:]:  # Last 3 exchanges
                    role = "User" if msg.get("role") == "user" else "Assistant"
                    history_text += f"{role}: {msg.get('parts', [''])[0]}\n"
                content[0] = history_text + "\n\nCurrent question: " + user_question
            
            response = self.model.generate_content(content, stream=True)  # ← STREAMING ENABLED
        
        # Yield chunks as they arrive
        full_text = ""
        for chunk in response:
            if chunk.text:
                full_text += chunk.text
                yield chunk.text
        
        # Return full text for history
        return full_text
        
    except Exception as e:
        yield f"⚠️ Error processing query: {str(e)}"
