"""
Nyaya-Sahayak Legal Engine with Gemini 1.5 Pro Context Caching
================================================================

This module initializes and manages the legal AI brain using Gemini 1.5 Pro
with context caching of legal PDFs for efficient, grounded responses.

Author: Nyaya-Sahayak Team
"""

import os
import time
from pathlib import Path
from typing import Optional, List, Generator
from datetime import timedelta
import google.generativeai as genai

# Cache configuration
CACHE_NAME = "nyaya_legal_cache"
CACHE_TTL_HOURS = 2
LEGAL_DOCS_PATH = Path(__file__).parent.parent / "legal_docs"

# System instruction for the legal consultant (CONVERSATIONAL + SMART SUGGESTIONS)
SYSTEM_INSTRUCTION = """You are Nyaya-Sahayak, a helpful, conversational Legal AI specializing in Indian Law.

═══════════════════════════════════════════════════════════════════
CONVERSATIONAL STYLE:
═══════════════════════════════════════════════════════════════════

✅ DO:
• Be empathetic, friendly, and professionally conversational
• Use Markdown formatting (**bolding**, bullet lists) to make advice scannable
• Provide concise, actionable legal guidance
• Explain complex legal concepts in simple terms
• Be legally precise while remaining approachable

❌ DON'T:
• Start responses with "As an AI..." or "I'm an AI model..."
• Repeat the user's question back to them
• Use overly formal or robotic language
• Provide vague or generic answers

═══════════════════════════════════════════════════════════════════
RESPONSE FORMAT:
═══════════════════════════════════════════════════════════════════

For SPECIFIC SECTION queries:
**LEGAL PROVISION**
• Section X of [Act Name, Year]

**DEFINITION/PENALTY**
• [Exact text from act]
• Penalty: [Fine/imprisonment details]

**APPLICABILITY**
• [When this section applies]

---

For SITUATIONAL queries (traffic stops, disputes, accidents):
**LEGAL ISSUE**
• [One-line statement]

**APPLICABLE LAW**
• Section X of [Act Name]: [Brief description]

**ACTION PLAN**
1. [First step with legal basis - cite section]
2. [Second step with legal basis - cite section]
3. [Third step with legal basis - cite section]

**YOUR RIGHTS**
• [Relevant rights under the law]

**CONSEQUENCES**
• [Legal implications based on cited sections]

═══════════════════════════════════════════════════════════════════
SMART SUGGESTIONS (MANDATORY):
═══════════════════════════════════════════════════════════════════

At the **very end** of EVERY response, provide 3 short, relevant follow-up questions in this EXACT JSON format:

```json
{"suggestions": ["First follow-up question?", "Second related question?", "Third helpful question?"]}
```

Examples: "What is the fine amount?", "Can I challenge this?", "Draft a legal notice?"

═══════════════════════════════════════════════════════════════════
DOMAIN LOCK:
═══════════════════════════════════════════════════════════════════

REJECT non-legal queries: "This query is outside the scope of legal consultation."

If PDFs don't contain relevant info: "⚠️ This query is outside the scope of the indexed legal documents. Consult a qualified legal advocate."
"""


class LegalBrain:
    """
    Manages Gemini 1.5 Pro model with context caching for legal documents
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Legal Brain
        
        Args:
            api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            print("⚠️ WARNING: GEMINI_API_KEY not found. Legal Brain operating in maintenance mode.")
            self.model = None  # Sentinel for missing key
            return

        genai.configure(api_key=self.api_key)
        self.cached_content = None
        self.model = None
        self.uploaded_files = []  # For direct PDF mode
        self.use_cache = False  # Track which mode we're using
    
    def _get_pdf_files(self) -> List[Path]:
        """
        Get all PDF files from the legal_docs directory
        
        Returns:
            List of PDF file paths
        """
        if not LEGAL_DOCS_PATH.exists():
            raise FileNotFoundError(
                f"Legal documents directory not found: {LEGAL_DOCS_PATH}\n"
                f"Please create the directory and add Indian law PDFs."
            )
        
        pdf_files = list(LEGAL_DOCS_PATH.glob("*.pdf"))
        if not pdf_files:
            raise FileNotFoundError(
                f"No PDF files found in {LEGAL_DOCS_PATH}\n"
                f"Please add legal document PDFs (IPC, CrPC, Motor Vehicles Act, etc.)"
            )
        
        print(f"✅ Found {len(pdf_files)} legal PDF(s) in {LEGAL_DOCS_PATH}")
        for pdf in pdf_files:
            print(f"   📄 {pdf.name}")
        
        return pdf_files
    
    def _check_existing_cache(self) -> Optional[genai.caching.CachedContent]:
        """
        Check if a cache with the given name already exists
        
        Returns:
            Existing CachedContent if found, None otherwise
        """
        try:
            # List all caches
            caches = genai.caching.CachedContent.list()
            
            for cache in caches:
                if cache.display_name == CACHE_NAME:
                    # Check if cache is still valid
                    if hasattr(cache, 'expire_time'):
                        # Cache exists and is valid
                        print(f"✅ Found existing cache: {CACHE_NAME}")
                        print(f"   ⏰ Expires at: {cache.expire_time}")
                        return cache
            
            print(f"ℹ️  No existing cache found with name: {CACHE_NAME}")
            return None
            
        except Exception as e:
            print(f"⚠️  Error checking cache: {e}")
            return None
    
    def _upload_pdfs_only(self) -> List:
        """
        Upload PDFs without creating cache (for free tier)
        
        Returns:
            List of uploaded file objects
        """
        print("📤 Uploading PDFs for direct querying (no cache)...")
        
        # Get PDF files
        pdf_files = self._get_pdf_files()
        
        # Upload PDFs
        uploaded_files = []
        for pdf_path in pdf_files:
            print(f"   Uploading: {pdf_path.name}...", end=" ")
            try:
                uploaded_file = genai.upload_file(str(pdf_path))
                uploaded_files.append(uploaded_file)
                print(f"✅ Done (URI: {uploaded_file.name})")
            except Exception as e:
                print(f"❌ Failed: {e}")
                raise
        
        print(f"✅ Uploaded {len(uploaded_files)} files for direct querying")
        return uploaded_files
    
    def _upload_pdfs_and_create_cache(self) -> genai.caching.CachedContent:
        """
        Upload PDFs to Gemini and create a new cached content object
        
        Returns:
            New CachedContent object
        """
        print("🚀 Creating new legal knowledge cache...")
        
        # Get PDF files
        pdf_files = self._get_pdf_files()
        
        # Upload PDFs to Gemini
        print("📤 Uploading PDFs to Gemini...")
        uploaded_files = []
        
        for pdf_path in pdf_files:
            print(f"   Uploading: {pdf_path.name}...", end=" ")
            try:
                uploaded_file = genai.upload_file(str(pdf_path))
                uploaded_files.append(uploaded_file)
                print(f"✅ Done (URI: {uploaded_file.name})")
            except Exception as e:
                print(f"❌ Failed: {e}")
                raise
        
        print(f"✅ Uploaded {len(uploaded_files)} files successfully")
        
        # Create cached content with TTL
        print(f"🧠 Creating context cache with {CACHE_TTL_HOURS}h TTL...")
        
        try:
            cached_content = genai.caching.CachedContent.create(
                model='models/gemini-2.5-flash',  # Flash model has free tier caching support
                display_name=CACHE_NAME,
                system_instruction=SYSTEM_INSTRUCTION,
                contents=uploaded_files,
                ttl=timedelta(hours=CACHE_TTL_HOURS),
            )
            
            print(f"✅ Cache created successfully!")
            print(f"   📦 Cache name: {cached_content.name}")
            print(f"   ⏰ Expires: {cached_content.expire_time}")
            
            return cached_content
            
        except Exception as e:
            print(f"❌ Failed to create cache: {e}")
            raise
    
    def initialize_legal_brain(self):
        """
        Initialize the Gemini model (tries caching, falls back to direct mode)
        
        This method:
        1. Tries to use context caching (if available)
        2. Falls back to direct PDF querying (if free tier)
        3. Initializes appropriate model
        
        Returns:
            GenerativeModel ready for legal queries
        """
        print("\n" + "="*70)
        print("🏛️  NYAYA-SAHAYAK LEGAL BRAIN INITIALIZATION")
        print("="*70 + "\n")
        
        # Try caching first
        if self.model is None and not self.api_key:
             print("⚠️ Maintenance Mode: Skipping initialization due to missing API Key")
             return None
             
        try:
            # Step 1: Check for existing cache
            print("🔍 Checking for existing legal knowledge cache...")
            self.cached_content = self._check_existing_cache()
            
            # Step 2: Create cache if it doesn't exist
            if self.cached_content is None:
                print("📦 No cache found. Creating new cache...")
                self.cached_content = self._upload_pdfs_and_create_cache()
            
            # Step 3: Initialize model from cache
            print("\n🤖 Initializing Gemini from cached content...")
            self.model = genai.GenerativeModel.from_cached_content(
                cached_content=self.cached_content
            )
            self.use_cache = True
            
            print("✅ Legal brain initialized in CACHED mode!")
            print("   ⚡ Fast responses with context caching")
            
        except Exception as e:
            error_msg = str(e)
            
            # Check if it's a quota/caching limitation
            if "limit exceeded" in error_msg.lower() or "quota" in error_msg.lower():
                print(f"\n⚠️  Caching not available on free tier")
                print("   Switching to DIRECT PDF mode...")
                print("   (Responses will be slower but still accurate)\n")
                
                # Fallback: Upload PDFs without cache
                self.uploaded_files = self._upload_pdfs_only()
                
                # Initialize regular model
                self.model = genai.GenerativeModel(
                    model_name='gemini-2.5-flash',
                    system_instruction=SYSTEM_INSTRUCTION
                )
                self.use_cache = False
                
                print("\n✅ Legal brain initialized in DIRECT PDF mode!")
                print("   📄 PDFs will be sent with each query")
            else:
                # Other errors - re-raise
                print(f"❌ Failed to initialize: {e}")
                raise
        
        print("\n" + "="*70)
        print("🎯 READY TO ANSWER LEGAL QUERIES")
        print(f"   Mode: {'CACHED ⚡' if self.use_cache else 'DIRECT PDF 📄'}")
        print("="*70 + "\n")
        
        return self.model
    
    def query(self, user_question: str, chat_history: Optional[List] = None, context_files: Optional[List] = None) -> str:
        """
        Query the legal brain with a user question (non-streaming, legacy)
        
        Args:
            user_question: The legal query from the user
            chat_history: Optional chat history for context
            context_files: Optional list of additional Gemini File objects
            
        Returns:
            Legal response from the model
        """
        if self.model is None:
             return "⚠️ **SYSTEM ERROR**: `GEMINI_API_KEY` is missing. Please add it to your Cloud Run Environment Variables."
        
        try:
            current_files = context_files or []
            
            if self.use_cache:
                # CACHED MODE: Use model with cached context
                msg_content = [user_question] + current_files
                
                if chat_history:
                    chat = self.model.start_chat(history=chat_history)
                    response = chat.send_message(msg_content)
                else:
                    response = self.model.generate_content(msg_content)
            else:
                # DIRECT PDF MODE: Send PDFs with each query
                content = [user_question] + self.uploaded_files + current_files
                
                if chat_history:
                    # Build history into prompt
                    history_text = "\n\nPrevious conversation:\n"
                    for msg in chat_history[-6:]:  # Last 3 exchanges
                        role = "User" if msg.get("role") == "user" else "Assistant"
                        history_text += f"{role}: {msg.get('parts', [''])[0]}\n"
                    content[0] = history_text + "\n\nCurrent question: " + user_question
                
                response = self.model.generate_content(content)
            
            return response.text
            
        except Exception as e:
            return f"⚠️ Error processing query: {str(e)}"
    
    def query_stream(self, user_question: str, chat_history: Optional[List] = None, context_files: Optional[List] = None) -> Generator[str, None, None]:
        """
        Stream the legal brain response chunk-by-chunk (Google Gemini style)
        
        Args:
            user_question: The legal query from the user
            chat_history: Optional chat history for context
            context_files: Optional list of additional Gemini File objects
            
        Yields:
            Chunks of text as they're generated
            
        Returns:
            The complete response text (for history)
        """
        if self.model is None:
             yield "⚠️ **SYSTEM ERROR**: `GEMINI_API_KEY` is missing. Please add it to your Cloud Run Environment Variables."
             return
        
        try:
            current_files = context_files or []
            
            if self.use_cache:
                # CACHED MODE: Use model with cached context
                msg_content = [user_question] + current_files
                
                if chat_history:
                    chat = self.model.start_chat(history=chat_history)
                    response = chat.send_message(msg_content, stream=True)  # ← STREAMING!
                else:
                    response = self.model.generate_content(msg_content, stream=True)  # ← STREAMING!
            else:
                # DIRECT PDF MODE: Send PDFs with each query
                content = [user_question] + self.uploaded_files + current_files
                
                if chat_history:
                    # Build history into prompt
                    history_text = "\n\nPrevious conversation:\n"
                    for msg in chat_history[-6:]:  # Last 3 exchanges
                        role = "User" if msg.get("role") == "user" else "Assistant"
                        history_text += f"{role}: {msg.get('parts', [''])[0]}\n"
                    content[0] = history_text + "\n\nCurrent question: " + user_question
                
                response = self.model.generate_content(content, stream=True)  # ← STREAMING!
            
            # Yield chunks as they arrive
            full_text = ""
            for chunk in response:
                if chunk.text:
                    full_text += chunk.text
                    yield chunk.text
            
            # Store full text for history (accessed via generator.gi_frame.f_locals)
            self._last_response = full_text
            
        except Exception as e:
            yield f"⚠️ Error processing query: {str(e)}"


# Singleton instance
_legal_brain_instance = None


def get_legal_brain() -> LegalBrain:
    """
    Get or create the singleton Legal Brain instance
    
    Returns:
        Initialized LegalBrain instance
    """
    global _legal_brain_instance
    
    if _legal_brain_instance is None:
        _legal_brain_instance = LegalBrain()
        _legal_brain_instance.initialize_legal_brain()
    
    return _legal_brain_instance


# For testing
if __name__ == "__main__":
    # Test initialization
    brain = get_legal_brain()
    
    # Test query
    test_query = "What is Section 420 IPC?"
    print(f"\n🧪 Test Query: {test_query}")
    print("="*70)
    response = brain.query(test_query)
    print(response)
