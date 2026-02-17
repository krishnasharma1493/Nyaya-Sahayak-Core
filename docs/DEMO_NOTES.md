# 🎓 DEMO NOTES FOR EVALUATORS

**Project:** NYAYA-SAHAYAK - The Legal First Responder  
**Team:** Bhumi Kansal, Krishna Sharma, Mayank Balyan, Shreyas Singh, Vishal Singh  
**Institution:** Faculty of Technology, University of Delhi  
**Theme:** Smart Education

---

## 📋 What This Repository Contains

This project is structured as a **full-stack AI-powered legal assistance platform** with two primary components:

### ✅ 1. Frontend Demonstration (Root Directory)
**Location:** `index.html`, `style.css`, `script.js`

**Purpose:** Complete UI/UX demonstration showcasing the user experience and interface design.

**What's Functional:**
- ✓ Constitution-themed gateway overlay with Ashoka Chakra watermark
- ✓ Academic branding and project information display
- ✓ Interactive voice and text input interfaces
- ✓ Document upload with drag-and-drop functionality
- ✓ Simulated AI processing with animated system logs
- ✓ Legal notice generation preview
- ✓ Results dashboard with confidence gauge
- ✓ Bilingual support (Hindi/English)
- ✓ Responsive design across devices

**Demo Status:** AI responses in the chat interface are **simulated** to demonstrate user flow. This allows judges to experience the complete interface without requiring backend infrastructure during evaluation.

**How to Run:**
```bash
# Simply open in any modern browser
open index.html
# or
python -m http.server 8000  # Then visit http://localhost:8000
```

---

### 🔧 2. Backend Implementation (`/project` Directory)
**Location:** `/project/` folder

**Framework:** Django 6.0.0 (Python 3.9+)

**Integrated Services:**
- **Google Vertex AI** - Agent Builder for Retrieval-Augmented Generation (RAG)
- **Gemini Pro 1.5** - Large Language Model for legal reasoning and notice drafting
- **Cloud Vision API** - OCR for document text extraction
- **Cloud Storage** - Document persistence and knowledge base indexing

**Status:** Backend API structure is implemented with endpoints for:
- `/upload` - Document upload and OCR processing
- `/analyze` - Legal analysis via Gemini Pro
- `/generate` - Legal notice generation
- `/query` - RAG-based legal Q&A

**How to Run Backend:**
```bash
cd project/
pip install -r requirements.txt  # Create from Django/GCP dependencies
python manage.py migrate
python manage.py runserver
```

**Note:** Backend requires Google Cloud Platform credentials (`key.json`) and enabled APIs (Vertex AI, Cloud Vision, Cloud Storage).

---

## 🎯 Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  (index.html, style.css, script.js - FRONTEND DEMO)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API Calls
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              DJANGO BACKEND (/project)                      │
│  • User Authentication (Django Auth)                        │
│  • File Upload Handler                                      │
│  • API Endpoints                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Integration
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           GOOGLE CLOUD PLATFORM SERVICES                    │
│  • Vertex AI (RAG Pipeline)                                 │
│  • Gemini Pro 1.5 (LLM)                                     │
│  • Cloud Vision API (OCR)                                   │
│  • Cloud Storage (Documents)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Innovation: Smart Education Through Practical Application

Unlike passive legal information websites, NYAYA-SAHAYAK focuses on **learning by doing**:

1. **Real Problem Input** - Users describe actual disputes they're facing
2. **AI-Guided Analysis** - System explains relevant laws (IPC, Consumer Act, etc.)
3. **Actionable Output** - Generates ready-to-send legal notices
4. **Educational Feedback** - Users learn their rights while solving problems

This aligns with our **Smart Education** theme: empowering citizens through practical legal problem-solving rather than just information consumption.

---

## 📊 What to Evaluate

### Frontend Excellence:
- **Design Quality:** Constitution-themed UI with Navy/Gold palette, Ashoka Chakra symbolism
- **User Experience:** Smooth transitions, accessibility features, bilingual support
- **Interaction Design:** Voice input, drag-and-drop, animated feedback
- **Responsiveness:** Mobile-first design, cross-browser compatibility

### Technical Implementation:
- **Backend Architecture:** Django REST API structure (see `/project`)
- **AI Integration Points:** Vertex AI, Gemini Pro, Cloud Vision (implementation in Django views)
- **Data Processing:** Document OCR, text analysis, legal citation extraction
- **Security:** Service account authentication, secure API calls

### Social Impact:
- **Accessibility:** Free legal assistance for small-value disputes
- **Empowerment:** Reducing dependency on expensive legal services
- **Education:** Learning rights through practical problem-solving
- **Scalability:** Cloud-native architecture for nationwide deployment

---

## 🚀 Quick Start for Judges

**To see the complete user experience:**

1. Open `index.html` in Chrome/Firefox/Safari
2. Click through the Constitution-themed gateway
3. Explore the "About the Project" section for full details
4. Click "Enter Secure Portal" to see the main interface
5. Try the chat interface (type "help" for commands)
6. Upload a sample document to see the workflow

**To review backend code:**

1. Navigate to `/project` folder
2. Review `app/views.py` for API endpoints
3. Check `TECH_STACK.md` for complete technical documentation

---

## 📞 Team Contact

For any questions during evaluation:

**Team Members:**
- Bhumi Kansal
- Krishna Sharma
- Mayank Balyan
- Shreyas Singh
- Vishal Singh

**Institution:** Faculty of Technology, University of Delhi

---

## ✨ Final Note

This project demonstrates our commitment to combining **cutting-edge AI technology** with **social impact** through the lens of **Smart Education**. The frontend prototype ensures judges can experience the full user journey, while the backend implementation in `/project` showcases our technical depth with Google Cloud Platform services.

We believe NYAYA-SAHAYAK represents the future of accessible legal assistance in India - making justice truly available to every citizen, regardless of their economic background.

**Jai Hind! 🇮🇳**
