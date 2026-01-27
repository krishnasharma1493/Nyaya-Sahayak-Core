from django.shortcuts import render
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Create your views here.
def home(request):
    return render(request, 'index.html')

def legal_console(request):
    """Render the hyper-modern legal console interface"""
    return render(request, 'legal_console.html')

@csrf_exempt
def analyze_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        local_path = fs.path(filename)
        
        try:
            # Configure Google AI with API key
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            
            # Use Gemini Flash model (fast for document analysis)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            # Read file
            with open(local_path, "rb") as f:
                file_data = f.read()
            
            # Upload file to Gemini
            uploaded_file_obj = genai.upload_file(local_path)
            
            prompt = """
            You are a legal expert AI. Analyze the attached legal document.
            Provide a structured JSON response with the following fields:
            - summary: A brief summary of the document.
            - key_clauses: A list of important clauses found.
            - risks: Potential legal risks or liabilities.
            - verdict: A probabilistic success score (0-100) and brief reasoning for case viability.
            
            Output ONLY the JSON.
            """
            
            response = model.generate_content([uploaded_file_obj, prompt])
            
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
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def chat_query(request):
    """
    RAG-Powered Legal Chat Endpoint with Hybrid Upload Support
    
    LOGIC:
    1. If file uploaded: Extract text directly, inject as {current_evidence}
    2. Use Vertex AI ONLY for legal provisions (not uploaded content)
    3. Combine both: uploaded facts + legal provisions = complete answer
    """
    if request.method == 'POST':
        try:
            # Parse request data
            user_message = None
            uploaded_file_text = None
            
            # Check if this is a file upload request (multipart/form-data)
            if request.FILES.get('file'):
                # FILE UPLOAD MODE: Direct Text Extraction
                uploaded_file = request.FILES['file']
                user_message = request.POST.get('message', '')
                
                # Extract text from uploaded file
                file_extension = uploaded_file.name.split('.')[-1].lower()
                
                try:
                    if file_extension == 'pdf':
                        # Extract PDF text using PyPDF2
                        import PyPDF2
                        import io
                        
                        pdf_reader = PyPDF2.PdfReader(io.BytesIO(uploaded_file.read()))
                        extracted_text = ""
                        for page in pdf_reader.pages:
                            extracted_text += page.extract_text() + "\n"
                        
                        uploaded_file_text = extracted_text.strip()
                        
                    elif file_extension in ['docx', 'doc']:
                        # Extract DOCX text using python-docx
                        from docx import Document
                        import io
                        
                        doc = Document(io.BytesIO(uploaded_file.read()))
                        extracted_text = ""
                        for paragraph in doc.paragraphs:
                            extracted_text += paragraph.text + "\n"
                        
                        uploaded_file_text = extracted_text.strip()
                    
                    else:
                        return JsonResponse({
                            'status': 'error',
                            'message': f'Unsupported file type: {file_extension}. Use PDF or DOCX.'
                        }, status=400)
                        
                except Exception as e:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'Error extracting text from file: {str(e)}'
                    }, status=500)
                    
            else:
                # TEXT-ONLY MODE: Standard JSON request
                data = json.loads(request.body)
                user_message = data.get('message', '')
            
            # Validate message
            if not user_message or user_message.strip() == "":
                return JsonResponse({
                    'status': 'error',
                    'message': 'Query cannot be empty'
                }, status=400)
            
            # Import RAG engine
            from .rag_engine import get_rag_engine
            
            # Get RAG engine instance
            rag = get_rag_engine()
            
            # HYBRID MODE: Process with optional file context
            if uploaded_file_text:
                # File uploaded - use hybrid approach
                result = rag.process_legal_query_with_evidence(
                    query=user_message,
                    current_evidence=uploaded_file_text
                )
            else:
                # No file - standard RAG query
                result = rag.process_legal_query(user_message)
            
            # Return structured response with sources
            return JsonResponse({
                'status': 'success',
                'response': result['response'],
                'sources': result['sources'],
                'confidence': result.get('confidence', 'medium'),
                'note': result.get('note', ''),
                'has_uploaded_context': uploaded_file_text is not None,
                'format': 'IRAC (Issue, Rule, Application, Conclusion)'
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error', 
                'message': f'Error processing legal query: {str(e)}'
            }, status=500)

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method. Use POST.'
    }, status=400)


@csrf_exempt
def verify_contract(request):
    """
    Contract Verification Module
    Cross-verifies uploaded contract against RAG database for discrepancies and risks
    """
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        local_path = fs.path(filename)
        
        try:
            # Configure Google AI with API key
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            
            # Use Gemini model to extract contract text
            model = genai.GenerativeModel('gemini-pro-latest')
            
            # Upload file to Gemini for text extraction
            uploaded_file_obj = genai.upload_file(local_path)
            
            # Extract contract clauses
            extraction_prompt = """
            Extract all key clauses from this legal contract/agreement. 
            For each clause, identify:
            1. Clause title/heading
            2. Full text of the clause
            3. Any monetary amounts, dates, or critical terms
            
            Format as JSON:
            {
                "contract_type": "Type of contract",
                "parties": ["Party 1", "Party 2"],
                "clauses": [
                    {
                        "title": "Clause title",
                        "text": "Full clause text",
                        "critical_terms": ["term1", "term2"]
                    }
                ]
            }
            
            Output ONLY valid JSON.
            """
            
            extraction_response = model.generate_content([uploaded_file_obj, extraction_prompt])
            
            # Parse extracted data
            contract_text = extraction_response.text.replace('```json', '').replace('```', '').strip()
            try:
                contract_data = json.loads(contract_text)
            except:
                contract_data = {"raw_text": contract_text}
            
            # Import RAG engine for cross-verification
            from .rag_engine import get_rag_engine
            rag = get_rag_engine()
            
            # Cross-verify each clause against legal database
            discrepancies = []
            risks = []
            compliance_status = []
            
            if 'clauses' in contract_data:
                for clause in contract_data['clauses']:
                    clause_text = clause.get('text', '')
                    clause_title = clause.get('title', 'Unnamed Clause')
                    
                    # Query RAG for relevant legal provisions
                    verification_query = f"What are the legal requirements and restrictions for: {clause_text[:500]}"
                    rag_result = rag.process_legal_query(verification_query)
                    
                    # Analyze for discrepancies using AI
                    comparison_prompt = f"""
                    You are a contract verification specialist. Compare this contract clause against legal provisions.
                    
                    CONTRACT CLAUSE:
                    {clause_text}
                    
                    LEGAL PROVISIONS FROM DATABASE:
                    {rag_result['response']}
                    
                    Identify:
                    1. Any conflicts between the clause and legal requirements
                    2. Missing mandatory provisions
                    3. Potential legal risks
                    4. Compliance status (COMPLIANT / NON-COMPLIANT / UNCLEAR)
                    
                    Respond in JSON:
                    {{
                        "compliance": "COMPLIANT or NON-COMPLIANT or UNCLEAR",
                        "issues": ["issue1", "issue2"],
                        "risks": ["risk1", "risk2"],
                        "recommendation": "Brief recommendation"
                    }}
                    """
                    
                    comparison_response = model.generate_content(
                        comparison_prompt,
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.2,
                            max_output_tokens=1024,
                        )
                    )
                    
                    # Parse comparison result
                    comparison_text = comparison_response.text.replace('```json', '').replace('```', '').strip()
                    try:
                        comparison = json.loads(comparison_text)
                        
                        if comparison.get('issues'):
                            discrepancies.append({
                                'clause': clause_title,
                                'issues': comparison['issues']
                            })
                        
                        if comparison.get('risks'):
                            risks.extend([{
                                'clause': clause_title,
                                'risk': risk
                            } for risk in comparison['risks']])
                        
                        compliance_status.append({
                            'clause': clause_title,
                            'status': comparison.get('compliance', 'UNCLEAR'),
                            'recommendation': comparison.get('recommendation', '')
                        })
                    except:
                        # Skip if parsing fails
                        pass
            
            # Overall compliance assessment
            overall_compliance = "COMPLIANT"
            if any(c['status'] == 'NON-COMPLIANT' for c in compliance_status):
                overall_compliance = "NON-COMPLIANT"
            elif any(c['status'] == 'UNCLEAR' for c in compliance_status):
                overall_compliance = "NEEDS REVIEW"
            
            # Cleanup
            if os.path.exists(local_path):
                os.remove(local_path)
            
            return JsonResponse({
                'status': 'success',
                'data': {
                    'contract_type': contract_data.get('contract_type', 'Unknown'),
                    'parties': contract_data.get('parties', []),
                    'overall_compliance': overall_compliance,
                    'discrepancies': discrepancies,
                    'risks': risks,
                    'clause_analysis': compliance_status,
                    'total_clauses_analyzed': len(contract_data.get('clauses', [])),
                    'issues_found': len(discrepancies),
                    'risks_identified': len(risks)
                }
            })
        
        except Exception as e:
            # Cleanup on error
            if os.path.exists(local_path):
                os.remove(local_path)
            return JsonResponse({
                'status': 'error',
                'message': f'Contract verification failed: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request. Upload a contract file (PDF/DOCX).'
    }, status=400)

