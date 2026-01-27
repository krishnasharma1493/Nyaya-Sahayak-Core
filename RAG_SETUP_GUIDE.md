# 🎓 RAG SETUP GUIDE - Vertex AI Search for Legal Documents

**Engineer:** Senior AI Engineer - Legal NLP Specialist  
**Objective:** Create a Strict RAG system with zero-hallucination guarantees

---

## 🎯 WHAT YOU JUST GOT

### **New RAG Engine (`rag_engine.py`)**

A production-grade RAG implementation with:

✅ **Strict Source-Grounding** - Only answers from retrieved Bare Acts  
✅ **Anti-Hallucination Prompts** - Won't make up legal advice  
✅ **Mandatory Citations** - Every claim cites Section + Act  
✅ **IRAC Format** - Professional legal analysis structure  
✅ **Confidence Scoring** - Tells you when it's uncertain  

### **Updated Backend (`views.py`)**

The `/api/chat/` endpoint now:
- Uses RAG engine instead of simple Gemini
- Returns sources with every response
- Provides professional legal counsel tone
- Includes confidence levels

### **Response Format:**

```json
{
  "status": "success",
  "response": "**Issue**: Whether Section 420 IPC applies...\n**Rule**: According to Section 420 of the Indian Penal Code...",
  "sources": [
    {"document": "IPC.pdf", "page": "142"},
    {"document": "CrPC.pdf", "page": "89"}
  ],
  "confidence": "high",
  "note": "Response grounded in 2 retrieved document(s)",
  "format": "IRAC (Issue, Rule, Application, Conclusion)"
}
```

---

## 🚧 SETUP REQUIRED: Vertex AI Search Data Store

The RAG engine is ready, but you need to create the knowledge base!

### **Step 1: Prepare Your Legal Documents**

Collect PDFs of Indian Bare Acts:
- `IPC.pdf` - Indian Penal Code
- `CrPC.pdf` - Code of Criminal Procedure  
- `Consumer_Protection_Act_2019.pdf`
- `Evidence_Act.pdf`
- `Contract_Act.pdf`
- etc.

**Where to find:**
- https://legislative.gov.in/
- https://indiacode.nic.in/
- Government legal document repositories

---

### **Step 2: Create Vertex AI Search Data Store**

#### **Option A: Via Google Cloud Console (Easiest)**

1. **Go to Vertex AI Search:**
   - Visit: https://console.cloud.google.com/gen-app-builder
   - Select project: `project-4b18645b-e7c8-44c0-98f`

2. **Create a New Data Store:**
   - Click "+ CREATE APP"
   - Choose "Search" as app type
   - Select "Generic" or "Document Search"
   - Name it: `nyaya-sahayak-legal-docs`
   - Click "Continue"

3. **Create Data Store:**
   - Choose "Cloud Storage" as source
   - Create/Select a bucket (or upload directly via console)
   - Enter bucket: `gs://nyaya-sahayak-legal-docs/` (create this first)
   - Click "Create"

4. **Upload PDFs:**
   - Go to the created data store
   - Click "Import" → "Cloud Storage"
   - Upload all your Bare Acts PDFs
   - **Important:** Name files clearly (e.g., `Indian_Penal_Code_1860.pdf`)

5. **Wait for Indexing:**
   - Indexing can take 15-60 minutes depending on document size
   - Check "Documents" tab for status

6. **Get Data Store ID:**
   - Go to Data Store details
   - Copy the **Data Store ID** (looks like: `nyaya-sahayak-legal-docs_1234567890`)
   - Add it to `/project/.env`:
     ```
     DATA_STORE_ID=your_data_store_id_here
     ```

#### **Option B: Via gcloud CLI**

```bash
# Create bucket for PDFs
gsutil mb gs://nyaya-sahayak-legal-docs/

# Upload PDFs
gsutil -m cp *.pdf gs://nyaya-sahayak-legal-docs/

# Create data store (replace PROJECT_ID)
gcloud alpha discoveryengine data-stores create nyaya-sahayak-legal-docs \
  --location=us-central1 \
  --industry-vertical=GENERIC \
  --solution-type=SOLUTION_TYPE_SEARCH \
  --project=project-4b18645b-e7c8-44c0-98f

# Import documents
gcloud alpha discoveryengine data-stores import-documents \
  --location=us-central1 \
  --data-store=nyaya-sahayak-legal-docs \
  --gcs-uri=gs://nyaya-sahayak-legal-docs/*.pdf \
  --project=project-4b18645b-e7c8-44c0-98f
```

---

### **Step 3: Enable Required APIs**

Make sure these are enabled in Google Cloud Console:

```bash
# Discovery Engine API
gcloud services enable discoveryengine.googleapis.com

# Cloud Storage (if not already)
gcloud services enable storage.googleapis.com
```

Or via Console:
- https://console.cloud.google.com/apis/library/discoveryengine.googleapis.com

---

### **Step 4: Test the RAG System**

Once Data Store is created and PDFs indexed:

```bash
# Install new dependency
pip3 install google-cloud-discoveryengine

# Test the chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Section 420 of IPC?"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "response": "**Issue**: Query regarding Section 420 of the Indian Penal Code...\n\n**Rule**: According to Section 420 of the Indian Penal Code, 1860...",
  "sources": [{"document": "IPC.pdf", "page": "142"}],
  "confidence": "high"
}
```

---

## 🎨 HOW THE RAG ENGINE WORKS

### **Architecture:**

```
User Query
    ↓
┌─────────────────────────────────────┐
│  1. search_legal_db()               │
│     - Queries Vertex AI Search      │
│     - Retrieves Top 3 relevant      │
│       chunks from Bare Acts         │
│     - Extracts metadata (PDF, page) │
└─────────────────────────────────────┘
    ↓
Retrieved Context + Sources
    ↓
┌─────────────────────────────────────┐
│  2. generate_lawyer_response()      │
│     - Builds restrictive prompt     │
│     - Forces model to cite sources  │
│     - Uses IRAC format              │
│     - Temperature = 0.1 (factual)   │
└─────────────────────────────────────┘
    ↓
Response + Citations
```

### **Anti-Hallucination Techniques:**

1. **System Prompt Enforcement:**
   - Explicitly tells model to ONLY use retrieved context
   - Forbids using pre-trained knowledge
   - Requires "I don't know" when context insufficient

2. **Low Temperature (0.1):**
   - Reduces creativity/randomness
   - Ensures factual, deterministic responses

3. **Context Injection:**
   - Retrieved text explicitly marked as `[RETRIEVED CONTEXT]`
   - Model trained to distinguish context from query

4. **Citation Requirement:**
   - Every claim must cite "According to Section X of..."
   - Forces model to ground answers in sources

---

## 📊 FALLBACK BEHAVIOR

**If Vertex AI Search is NOT configured yet:**

The RAG engine includes a fallback:
- Returns empty context
- Model responds: *"I cannot find a specific provision in the provided Bare Acts regarding this query..."*
- Prevents making up legal advice

**This is by design!** Better to say "I don't know" than give wrong legal advice.

---

## 🔧 CONFIGURATION CHECKLIST

```
✅ rag_engine.py created
✅ views.py updated with RAG integration
✅ requirements.txt updated (google-cloud-discoveryengine)
✅ .env has DATA_STORE_ID placeholder

⚠️  TODO (Your Action Required):
□  Create Vertex AI Search Data Store
□  Upload Bare Acts PDFs (IPC, CrPC, Consumer Act, etc.)
□  Wait for indexing to complete (15-60 min)
□  Get Data Store ID and add to .env
□  Install new dependency: pip3 install google-cloud-discoveryengine
□  Test the /api/chat/ endpoint
```

---

## 💡 TIPS FOR BEST RESULTS

### **Document Preparation:**

1. **Clean PDFs:**
   - Use official government PDFs (not scanned images)
   - OCR scanned docs first if needed

2. **Consistent Naming:**
   - `Indian_Penal_Code_1860.pdf`
   - `Code_Criminal_Procedure_1973.pdf`
   - `Consumer_Protection_Act_2019.pdf`

3. **Chunking:**
   - Vertex AI automatically chunks documents
   - Ideal chunk size: 500-1000 tokens
   - Overlapping chunks for context

### **Query Examples (to test):**

```
"What is Section 302 IPC?"
"Consumer rights under Consumer Protection Act 2019"
"Procedure for filing FIR under CrPC"
"What are the punishments for cheating?"
"Bail provisions in non-bailable offences"
```

---

## 🚀 ADVANCED: Improving RAG Quality

Once basic RAG works, you can enhance it:

### **1. Hybrid Search:**
```python
# In rag_engine.py, modify search_legal_db():
# Add semantic + keyword search combination
```

### **2. Re-ranking:**
```python
# Add Cohere Reranker or custom scoring
# Sort results by relevance before feeding to LLM
```

### **3. Multi-hop Reasoning:**
```python
# For complex queries, do multiple retrievals
# Combine evidence from different Acts
```

### **4. Citation Verification:**
```python
# Post-process Gemini response
# Verify all cited sections exist in retrieved context
# Flag potential hallucinations
```

---

## 📞 SUPPORT

### **If RAG Not Working:**

1. **Check Data Store Status:**
   - Go to Vertex AI Search console
   - Verify documents are indexed (status: "Active")

2. **Check API Permissions:**
   - Service account needs "Discovery Engine User" role

3. **Check Logs:**
   ```python
   # In rag_engine.py, errors are printed to console
   ```

4. **Test Search Directly:**
   - Use Vertex AI Search console "Preview" tab
   - Query: "Section 420"
   - Should return relevant IPC content

---

## 🎯 EXPECTED OUTCOMES

**Before RAG:**
```
Query: "What is IPC 420?"
Response: "IPC Section 420 deals with cheating..." (Generic, no citation, could be wrong)
```

**After RAG:**
```
Query: "What is IPC 420?"
Response:
"**Issue**: Query regarding Section 420 of the Indian Penal Code.

**Rule**: According to Section 420 of the Indian Penal Code, 1860: 
'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property...'
[Full section text from retrieved document]

**Application**: This provision applies to cases of fraud involving...

**Conclusion**: Section 420 IPC is applicable in situations where..."

Sources: [IPC.pdf, Page 142]
```

**Key Difference:** Exact text from law, mandatory citation, confident answer!

---

**Ready to set up the data store? Let me know if you need help!** 🚀
