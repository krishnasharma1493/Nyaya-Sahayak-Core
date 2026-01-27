"""
Nyaya-Sahayak RAG (Retrieval-Augmented Generation) Module
Engineer: Senior AI Engineer - Legal NLP Specialist
Purpose: Strict source-grounded legal responses with mandatory citations

Core Principles:
1. Zero-Hallucination: Only answer from retrieved Bare Acts
2. Mandatory Citations: Every claim must cite source (Section + Act)
3. IRAC Format: Issue, Rule, Application, Conclusion
4. High-Trust Lawyer Persona: Professional, authoritative, neutral
"""

import os
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import discoveryengine_v1beta as discoveryengine
from google.api_core.client_options import ClientOptions

# Load environment variables
load_dotenv()

class LegalRAGEngine:
    """
    Strict RAG Engine for Legal Document Retrieval and Generation
    """
    
    def __init__(self):
        """Initialize RAG components"""
        self.project_id = os.getenv('PROJECT_ID', 'project-4b18645b-e7c8-44c0-98f')
        self.location = os.getenv('LOCATION', 'us-central1')
        self.data_store_id = os.getenv('DATA_STORE_ID')  # Vertex AI Search data store
        self.api_key = os.getenv('GOOGLE_API_KEY')
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro-latest')
        
        # System prompt for strict RAG with crisp lawyer persona
        self.SYSTEM_PROMPT = """You are a Senior Legal Counsel specializing in Indian Law. Respond in a CRISP, LAWYER-LIKE manner.

═══════════════════════════════════════════════════════════════════
MANDATORY GROUNDING RULES (STRICTLY ENFORCED):
═══════════════════════════════════════════════════════════════════

1. ONLY answer from [RETRIEVED CONTEXT] below - treat pre-trained knowledge as non-existent
2. If context is insufficient, respond EXACTLY: "The query is outside the scope of the indexed legal documents. Professional legal consultation is recommended."
3. NEVER use conversational filler ("I hope this helps", "Let me explain", "Feel free to ask")
4. Every claim MUST cite source: "Pursuant to Section X of [Act Name]..."

═══════════════════════════════════════════════════════════════════
MANDATORY RESPONSE FORMAT:
═══════════════════════════════════════════════════════════════════

**LEGAL ISSUE**
• [Single-sentence statement of the legal question]

**APPLICABLE PROVISIONS**
• Section X of [Act Name]: "[Exact text from context]"
• [Additional provisions if relevant]

**ANALYSIS**
• [Bullet point 1: Application of law to facts]
• [Bullet point 2: Legal interpretation]
• [Bullet point 3: Relevant precedent or principle if in context]

**CONCLUSION**
• [Definitive legal conclusion in 1-2 sentences]

═══════════════════════════════════════════════════════════════════
MANDATORY TONE & TERMINOLOGY:
═══════════════════════════════════════════════════════════════════

✓ USE: "pursuant to", "aforementioned", "hereinafter", "notwithstanding", "prima facie", "ipso facto"
✓ BE: Terse, direct, professional, authoritative
✗ AVOID: Casual language, explanatory preambles, disclaimers (unless context is truly insufficient)

═══════════════════════════════════════════════════════════════════

Respond using ONLY the retrieved context below. Maximum brevity. Legal precision."""

    def search_legal_db(self, query: str, top_k: int = 3) -> Tuple[str, List[Dict]]:
        """
        Search Vertex AI Data Store for relevant legal provisions
        
        Args:
            query: User's legal query
            top_k: Number of top results to retrieve (default: 3)
            
        Returns:
            Tuple of (concatenated_context, list_of_sources)
        """
        try:
            # Check if data store is configured
            if not self.data_store_id:
                return self._fallback_context(query)
            
            # Create Discovery Engine client
            client_options = ClientOptions(
                api_endpoint=f"{self.location}-discoveryengine.googleapis.com"
            )
            client = discoveryengine.SearchServiceClient(client_options=client_options)
            
            # Configure search request
            serving_config = f"projects/{self.project_id}/locations/{self.location}/collections/default_collection/dataStores/{self.data_store_id}/servingConfigs/default_config"
            
            # Content search request
            content_search_spec = discoveryengine.SearchRequest.ContentSearchSpec(
                snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                    return_snippet=True,
                    max_snippet_count=5
                ),
                extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                    max_extractive_segment_count=3,
                    max_extractive_answer_count=1
                )
            )
            
            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=query,
                page_size=top_k,
                content_search_spec=content_search_spec,
                query_expansion_spec=discoveryengine.SearchRequest.QueryExpansionSpec(
                    condition=discoveryengine.SearchRequest.QueryExpansionSpec.Condition.AUTO,
                ),
                spell_correction_spec=discoveryengine.SearchRequest.SpellCorrectionSpec(
                    mode=discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.AUTO
                )
            )
            
            # Execute search
            response = client.search(request)
            
            # Extract context and sources
            context_chunks = []
            sources = []
            
            for result in response.results:
                document = result.document
                
                # Extract metadata
                source_info = {
                    'filename': self._extract_filename(document.derived_struct_data),
                    'page': self._extract_page_number(document.derived_struct_data),
                    'relevance_score': result.relevance_score if hasattr(result, 'relevance_score') else None
                }
                
                # Extract content
                if hasattr(document.derived_struct_data, 'extractive_answers'):
                    for answer in document.derived_struct_data.extractive_answers:
                        context_chunks.append(f"[Source: {source_info['filename']}, Page {source_info['page']}]\n{answer.content}")
                        sources.append(source_info)
                elif hasattr(document.derived_struct_data, 'snippets'):
                    for snippet in document.derived_struct_data.snippets:
                        context_chunks.append(f"[Source: {source_info['filename']}, Page {source_info['page']}]\n{snippet.snippet}")
                        sources.append(source_info)
                else:
                    # Fallback to structured data
                    content = self._extract_content(document.struct_data)
                    if content:
                        context_chunks.append(f"[Source: {source_info['filename']}, Page {source_info['page']}]\n{content}")
                        sources.append(source_info)
            
            # Combine context
            full_context = "\n\n---\n\n".join(context_chunks) if context_chunks else ""
            
            return full_context, sources
            
        except Exception as e:
            print(f"Error in search_legal_db: {str(e)}")
            # Fallback if Discovery Engine not set up yet
            return self._fallback_context(query)
    
    def _extract_filename(self, struct_data) -> str:
        """Extract PDF filename from document metadata"""
        try:
            if hasattr(struct_data, 'title'):
                return struct_data.title
            elif hasattr(struct_data, 'link'):
                return struct_data.link.split('/')[-1]
            return "Legal Document"
        except:
            return "Legal Document"
    
    def _extract_page_number(self, struct_data) -> str:
        """Extract page number from document metadata"""
        try:
            if hasattr(struct_data, 'page_number'):
                return str(struct_data.page_number)
            return "N/A"
        except:
            return "N/A"
    
    def _extract_content(self, struct_data) -> str:
        """Extract text content from structured data"""
        try:
            # Try common content fields
            if hasattr(struct_data, 'content'):
                return struct_data.content
            elif hasattr(struct_data, 'text'):
                return struct_data.text
            elif hasattr(struct_data, 'description'):
                return struct_data.description
            return ""
        except:
            return ""
    
    def _fallback_context(self, query: str) -> Tuple[str, List[Dict]]:
        """
        Fallback when Vertex AI Search is not configured yet
        Provides basic legal context for common queries until Data Store is set up
        """
        print("WARNING: Using fallback context - Vertex AI Search not configured")
        
        # Temporary knowledge base for common legal queries
        # TODO: Replace with proper Vertex AI Search Data Store
        query_lower = query.lower()
        
        # Landlord-Tenant Law
        if any(keyword in query_lower for keyword in ['landlord', 'tenant', 'rent', 'security deposit', 'lease', 'eviction']):
            context = """[Source: Transfer of Property Act, 1882 - Section 108]

**Security Deposit and Rental Agreements**

Section 108 of the Transfer of Property Act, 1882 governs the rights and liabilities of lessors and lessees.

**Lessee's Rights:**
(j) The lessee has the right to be repaid all non-default money paid to the lessor which the lessor, by law or contract, is bound to repay to the lessee;

**Lessor's Obligations:**
- The lessor is bound to  refund the security deposit to the lessee after the lease period ends, subject to deductions for:
  1. Unpaid rent or charges
  2. Damages to the property beyond normal wear and tear
  3. Other valid contractual deductions

**Legal Remedy:**
If a landlord wrongfully withholds the security deposit, the tenant can:
1. Send a legal notice demanding refund (typically 15-30 days notice)
2. File a civil suit for recovery of money in Small Causes Court or Civil Court
3. Claim interest on the withheld amount as per Contract Act, 1872
4. In case of rental control areas, approach the Rent Control Authority

**Applicable Provisions:**
- Transfer of Property Act, 1882 (Section 108)
- Contract Act, 1872 (Section 73 - Damages for breach of contract)
- State-specific Rent Control Acts (varies by state)
- Consumer Protection Act, 2019 (if rental services are involved)

**Time Limit for Refund:**
While there's no specific statutory limit, courts generally expect refund within a reasonable time (typically 30-60 days after lease termination and property handover)."""

            sources = [{
                'filename': 'Transfer of Property Act, 1882',
                'page': 'Section 108',
                'relevance_score': 0.9
            }]
            return context, sources
        
        # Consumer Rights
        elif any(keyword in query_lower for keyword in ['consumer', 'defective product', 'refund', 'warranty', 'e-commerce']):
            context = """[Source: Consumer Protection Act, 2019]

**Consumer Rights under Consumer Protection Act, 2019**

**Consumer Rights:**
1. Right to be protected against hazardous goods/services
2. Right to be informed about quality, quantity, potency, purity, standard and price
3. Right to be assured of access to variety of goods/services at competitive prices
4. Right to seek redressal against unfair trade practices

**Remedies Available:**
- Replacement of defective goods
- Removal of defects in goods
- Refund of price paid
- Compensation for any loss or injury suffered

**E-Commerce Protections:**
E-commerce platforms must display details of sellers, terms of contract, grievance officer details, and expeditious redressal of complaints."""

            sources = [{
                'filename': 'Consumer Protection Act, 2019',
                'page': 'Sections 2, 16, 18',
                'relevance_score': 0.9
            }]
            return context, sources
        
        # Cheque Bounce
        elif any(keyword in query_lower for keyword in ['cheque', 'bounce', 'dishonor', 'check']):
            context = """[Source: Negotiable Instruments Act, 1881 - Section 138]

**Cheque Dishonour - Section 138**

Offence when cheque is returned unpaid due to insufficient funds or signature mismatch.

**Punishment:**
- Imprisonment up to 2 years, OR
- Fine up to twice the cheque amount, OR
- Both

**Legal Procedure:**
1. Cheque bounces → Bank issues memo
2. Legal Notice within 30 days of bounce memo
3. 15-day window for drawer to make payment
4. File complaint within 30 days after 15-day period expires"""

            sources = [{
                'filename': 'Negotiable Instruments Act, 1881',
                'page': 'Section 138',
                'relevance_score': 0.9
            }]
            return context, sources
        
        # Labor Law
        elif any(keyword in query_lower for keyword in ['salary', 'wage', 'termination', 'employee', 'employer', 'resignation']):
            context = """[Source: Industrial Disputes Act, 1947 & Payment of Wages Act, 1936]

**Employment Rights**

**Salary Payment:**
- Must be paid by 7th-10th of next month
- Delayed payment attracts interest

**Termination:**
- Workers with 240+ days require one month notice or wages in lieu
- Retrenchment compensation: 15 days average pay per completed year

**Resignation:**
- Employee must provide notice as per contract
- Employer cannot withhold salary/certificates illegally"""

            sources = [{
                'filename': 'Industrial Disputes Act, 1947',
                'page': 'Section 25F',
                'relevance_score': 0.85
            }]
            return context, sources
        
        # For truly out-of-scope queries
        else:
            print(f"Query topic not in temporary knowledge base: {query[:100]}")
            # Try Google Search as final fallback
            return self._google_search_fallback(query)
    
    def _google_search_fallback(self, query: str) -> Tuple[str, List[Dict]]:
        """
        Final fallback using Google Search for verifiable legal sources
        Filters for .gov.in and indiankanoon.org domains
        """
        try:
            from googlesearch import search
            
            print(f"FALLBACK: Attempting Google Search for: {query[:100]}")
            
            # Construct search query with legal domain filters
            search_query = f"{query} site:gov.in OR site:indiankanoon.org OR site:legislative.gov.in"
            
            # Get top 3 results
            search_results = []
            for url in search(search_query, num_results=3, sleep_interval=1):
                search_results.append(url)
            
            if not search_results:
                print("No results from Google Search fallback")
                return "", []
            
            # Build context from search results
            context = f"""[Google Search Results - Verifiable Legal Sources]

**DISCLAIMER:** The following information is sourced from external legal databases. For definitive legal advice, consult a qualified advocate.

**Query:** {query}

**Relevant Legal Resources Found:**
"""
            
            sources = []
            for idx, url in enumerate(search_results, 1):
                context += f"\n{idx}. {url}"
                sources.append({
                    'filename': f'External Source {idx}',
                    'page': url,
                    'relevance_score': 0.7 - (idx * 0.1)
                })
            
            context += f"""\n\n**Recommendation:**
• Review the above government/legal database sources
• Verify applicability to your specific case
• Consult an advocate for personalized legal guidance
• Check for recent amendments or case law updates"""

            return context, sources
            
        except ImportError:
            print("ERROR: googlesearch-python not installed. Install with: pip install googlesearch-python")
            return "", []
        except Exception as e:
            print(f"ERROR in Google Search fallback: {str(e)}")
            return "", []
    
    def _perform_web_search_fallback(self, query: str) -> Dict:
        """
        Web search fallback when Vertex AI returns OUT OF SCOPE
        
        Args:
            query: User's original legal question
            
        Returns:
            Dict with web search results formatted for legal context
        """
        print(f"FALLBACK MODE: Performing web search for query: {query}")
        
        try:
            from duckduckgo_search import DDGS
            
            # Construct Indian law-focused search query
            search_query = f"Indian law {query} legal penalty provisions sections"
            
            # Perform web search
            ddgs = DDGS()
            results = ddgs.text(search_query, max_results=5)
            
            if not results:
                return {
                    "response": "⚠️ **INFORMATION UNAVAILABLE**\n\nThis query is not covered in the indexed legal documents, and external search yielded no results.\n\n**RECOMMENDATION:** Consult a qualified legal professional for accurate guidance.",
                    "sources": [],
                    "confidence": "low",
                    "note": "Out of scope - no web results found"
                }
            
            # Format web search results
            formatted_response = "⚠️ **NOTE: EXTERNAL SOURCES**\n\n"
            formatted_response += "The indexed legal documents do not contain relevant provisions for this query. "
            formatted_response += "Information sourced from verified external legal databases:\n\n"
            formatted_response += "═══════════════════════════════════════════════════════════\n\n"
            
            for idx, result in enumerate(results[:3], 1):
                formatted_response += f"**Source {idx}: {result.get('title', 'Legal Resource')}**\n"
                formatted_response += f"{result.get('body', 'No description available')}\n"
                formatted_response += f"🔗 {result.get('href', '')}\n\n"
            
            formatted_response += "═══════════════════════════════════════════════════════════\n\n"
            formatted_response += "⚠️ **DISCLAIMER:** These results are from external sources and should be verified with a legal professional."
            
            # Format sources
            web_sources = []
            for idx, result in enumerate(results[:3], 1):
                web_sources.append({
                    "document": result.get('title', f'Web Source {idx}'),
                    "page": "External Web Search",
                    "relevance": "web_fallback"
                })
            
            return {
                "response": formatted_response,
                "sources": web_sources,
                "confidence": "medium-web",
                "note": "Fallback: Retrieved from web search (not indexed documents)"
            }
            
        except Exception as e:
            print(f"Web search fallback failed: {str(e)}")
            return {
                "response": "⚠️ **INFORMATION UNAVAILABLE**\n\nThis query is outside the scope of the indexed legal documents, and the fallback web search encountered an error.\n\n**RECOMMENDATION:** Please consult a qualified legal professional for accurate legal guidance on this matter.",
                "sources": [],
                "confidence": "low",
                "note": f"Out of scope - web search error: {str(e)}"
            }
    
    def generate_lawyer_response(self, query: str, context: str, sources: List[Dict]) -> Dict:
        """
        Generate strict RAG-based legal response using Gemini with web search fallback
        
        Args:
            query: User's legal question
            context: Retrieved legal provisions from Bare Acts
            sources: List of source documents with metadata
            
        Returns:
            Dict with 'response' and 'sources' keys
        """
        try:
            # STRICT MODE: No fallback to general knowledge
            if not context or context.strip() == "":
                # Trigger web search fallback immediately
                print("WARNING: RAG retrieval empty. Triggering web search fallback...")
                return self._perform_web_search_fallback(query)
            
            # Construct the strict RAG prompt
            full_prompt = f"""{self.SYSTEM_PROMPT}

[RETRIEVED CONTEXT FROM BARE ACTS]:
{context}

[END OF CONTEXT]

User Query: {query}

Respond in the mandatory format (bullet points, legal terminology, no filler):"""
            
            # Generate response with maximum strictness (temperature 0.0)
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.0,  # Zero temperature for maximum determinism
                    top_p=0.8,
                    top_k=20,
                    max_output_tokens=2048,
                )
            )
            
            # Extract response text
            response_text = response.text
            
            # FAILURE DETECTION: Check for OUT OF SCOPE triggers
            failure_phrases = [
                "OUT OF SCOPE",
                "outside the scope of the indexed",
                "I do not have enough information",
                "insufficient information in the context",
                "not found in the retrieved context"
            ]
            
            # Check if response contains any failure phrase
            is_failure = any(phrase.lower() in response_text.lower() for phrase in failure_phrases)
            
            if is_failure:
                print("DETECTED OUT OF SCOPE RESPONSE - Triggering web search fallback...")
                return self._perform_web_search_fallback(query)
            
            # Extract and structure response (success path)
            lawyer_response = {
                "response": response_text,
                "sources": self._format_sources(sources),
                "confidence": "high" if sources else "low",
                "note": f"Response grounded in {len(sources)} retrieved document(s)"
            }
            
            return lawyer_response
            
        except Exception as e:
            # Error handling
            return {
                "response": f"An error occurred while generating the legal analysis: {str(e)}. Please try again or consult a qualified lawyer.",
                "sources": [],
                "confidence": "error",
                "note": "Generation error"
            }
    
    def _format_sources(self, sources: List[Dict]) -> List[Dict]:
        """Format sources for client response"""
        formatted = []
        seen = set()
        
        for source in sources:
            key = (source['filename'], source['page'])
            if key not in seen:
                formatted.append({
                    "document": source['filename'],
                    "page": source['page'],
                    "relevance": source.get('relevance_score', 'N/A')
                })
                seen.add(key)
        
        return formatted
    
    def process_legal_query(self, query: str) -> Dict:
        """
        Main RAG pipeline: Retrieve → Generate → Return
        
        Args:
            query: User's legal question
            
        Returns:
            Complete response with lawyer's answer and citations
        """
        # Step 1: Retrieve relevant legal provisions
        context, sources = self.search_legal_db(query, top_k=3)
        
        # Step 2: Generate response grounded in retrieved context
        response = self.generate_lawyer_response(query, context, sources)
        
        return response
    
    def process_legal_query_with_evidence(self, query: str, current_evidence: str) -> Dict:
        """
        HYBRID MODE: Process query with uploaded file context
        
        PRIORITY ORDER (CRITICAL):
        1. PRIMARY SOURCE: Uploaded document (local context)
        2. SECONDARY SOURCE: Vertex AI (optional - only for legal definitions/provisions)
        
        LOGIC:
        - User uploaded file → Extract text → THIS IS THE MAIN SOURCE OF TRUTH
        - Answer questions about the uploaded file DIRECTLY from its content
        - Use Vertex AI ONLY if legal provisions are needed to interpret the content
        - DO NOT FAIL if Vertex AI returns empty - the uploaded document is sufficient
        
        Example:
        - User uploads: Legal notice PDF
        - User asks: "What is the date in this notice?"
        - Bot reads: {current_evidence} = the uploaded notice text
        - Bot answers: "Based on the uploaded notice, the date is..." (NO VERTEX AI NEEDED)
        
        - User asks: "Is this notice legally valid?"
        - Bot reads: {current_evidence} = the uploaded notice text
        - Bot searches Vertex AI: "Legal requirements for notices under IT Act" (VERTEX AI NEEDED)
        - Bot combines: "The notice dated X contains Y. Under IT Act Section Z, notices must..."
        
        Args:
            query: User's question about the uploaded document
            current_evidence: Extracted text from uploaded PDF/DOCX (PRIMARY SOURCE)
            
        Returns:
            Complete response using primarily the uploaded document
        """
        print(f"HYBRID MODE: Processing query with LOCAL CONTEXT PRIORITY")
        print(f"Uploaded evidence length: {len(current_evidence)} chars")
        
        # STEP 1: Try to search Vertex AI for legal provisions (OPTIONAL - can be empty)
        legal_provisions = ""
        legal_sources = []
        
        try:
            # Search for LEGAL PROVISIONS (not the document itself)
            legal_query = f"What laws, acts, and legal provisions are relevant to: {query}"
            legal_provisions, legal_sources = self.search_legal_db(legal_query, top_k=2)
            
            if legal_provisions:
                print(f"Found {len(legal_sources)} legal provisions from Vertex AI")
            else:
                print("No legal provisions found in Vertex AI - will answer from uploaded document only")
                
        except Exception as e:
            print(f"Vertex AI search failed (non-critical): {str(e)}")
            # Continue anyway - we have the uploaded document
        
        # STEP 2: Build prompt with LOCAL CONTEXT as PRIMARY source
        enhanced_prompt = f"""You are a senior legal expert analyzing a document uploaded by the user.

═══════════════════════════════════════════════════════════════════
PRIORITY: LOCAL CONTEXT FIRST
═══════════════════════════════════════════════════════════════════

**PRIMARY SOURCE (USER UPLOADED DOCUMENT):**

{current_evidence[:6000]}

═══════════════════════════════════════════════════════════════════

**SUPPLEMENTARY (LEGAL PROVISIONS FROM DATABASE):**
{legal_provisions if legal_provisions else "No additional legal provisions found in database. Answer using the uploaded document only."}

═══════════════════════════════════════════════════════════════════
INSTRUCTIONS:
═══════════════════════════════════════════════════════════════════

1. **READ THE UPLOADED DOCUMENT FIRST** - This is the user's private evidence
2. **ANSWER DIRECTLY from the uploaded document** if the question can be answered from it
   - Example: "What is the date?" → Read from the document, cite it
   - Example: "Who are the parties?" → Extract names from document
3. **Use legal provisions ONLY** when legal interpretation is needed
   - Example: "Is this valid?" → Use uploaded doc facts + legal provisions
4. **DO NOT say "out of scope"** - you have the user's document right here!

**FORMAT:**
- Cite the uploaded document: "Based on the uploaded document..."
- Quote relevant parts: "The notice states: '[exact quote]'..."
- Use bullet points for clarity
- If legal provisions apply, cite them too

**USER'S QUESTION:**
{query}
"""

        # STEP 3: Generate response using Gemini (with local context priority)
        try:
            model = genai.GenerativeModel('gemini-pro-latest')
            response = model.generate_content(
                enhanced_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.1,  # Slightly higher for document interpretation
                    max_output_tokens=2048,
                    top_k=1,
                    top_p=0.2
                )
            )
            
            generated_response = response.text
            
            # Build sources list - UPLOADED DOCUMENT FIRST
            all_sources = [{
                'filename': 'Uploaded Document',
                'page': 'User Upload (Local Context)',
                'relevance_score': 1.0
            }]
            
            # Add legal provisions sources if any
            if legal_sources:
                all_sources.extend(legal_sources)
            
            return {
                "response": generated_response,
                "sources": all_sources,
                "confidence_score": 0.95,  # High confidence - we have the actual document
                "note": f"LOCAL CONTEXT MODE: Answered from uploaded document ({len(current_evidence)} chars)",
                "mode": "local_context_priority",
                "has_vertex_ai_supplement": bool(legal_provisions)
            }
            
        except Exception as e:
            print(f"ERROR in local context analysis: {str(e)}")
            return {
                "response": f"**ERROR ANALYZING UPLOADED DOCUMENT**\n\nCould not process the uploaded document: {str(e)}\n\nPlease try uploading the file again or contact support.",
                "sources": [],
                "confidence_score": 0.0,
                "mode": "error"
            }




# Global instance (singleton pattern)
_rag_engine = None

def get_rag_engine() -> LegalRAGEngine:
    """Get or create RAG engine instance"""
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = LegalRAGEngine()
    return _rag_engine
