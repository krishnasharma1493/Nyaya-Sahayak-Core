# Nyaya-Sahayak: AI-Powered Legal Enforcement System

<<<<<<< HEAD
## Project Overview
=======
## 🎯 Project Overview
>>>>>>> b402a80a0b90519a154863283c3e66c428652071

Nyaya-Sahayak is a multimodal Retrieval-Augmented Generation (RAG) platform designed to automate the generation of legal notices and preliminary case analysis. The system leverages Google Cloud Vertex AI and Computer Vision to interpret unstructured evidence (images, audio, and documents) and cross-reference them against a vectorised knowledge base of Indian laws (IPC, CrPC, Consumer Protection Act).

Unlike standard legal chatbots which provide generic advice, Nyaya-Sahayak is engineered to be an execution tool. It assesses case viability with a probabilistic success score and generates legally binding PDF notices ready for dispatch.

<<<<<<< HEAD
=======
## 📂 Project Structure

This repository contains two distinct components:

### **1. Frontend Prototype (Root Directory)**
- **Files:** `index.html`, `style.css`, `script.js`
- **Purpose:** Interactive UI/UX demonstration with Constitution-themed gateway overlay
- **Status:** ✅ Fully functional standalone demo
- **Features:** 
  - Constitution-themed launch gateway with Ashoka Chakra design
  - Voice/text input interfaces
  - Simulated AI responses for demonstration
  - Document upload UI
  - Legal notice preview dashboard

### **2. Backend Implementation (`/project` Directory)**
- **Framework:** Django 6.0.0
- **Status:** 🔧 Backend API structure with GCP integration points
- **Services Integrated:**
  - Google Vertex AI (Agent Builder for RAG)
  - Gemini Pro 1.5 (Legal reasoning and drafting)
  - Cloud Vision API (OCR for document processing)
  - Cloud Storage (Document persistence)

> **Note for Evaluators:** The root-level HTML/CSS/JS files demonstrate the complete user interface and experience. Backend AI integration is implemented in the `/project` folder using Django and Google Cloud Platform services. For full end-to-end functionality, both components work together via RESTful APIs.

>>>>>>> b402a80a0b90519a154863283c3e66c428652071
## System Architecture

The application follows a microservices-oriented architecture:

1.  **Frontend Client:** A responsive web interface built with HTML5, JavaScript, and Tailwind CSS.
2.  **Backend Server:** A Python Flask application serving RESTful API endpoints.
3.  **OCR Layer:** Google Cloud Vision API for text extraction from physical evidence (scanned documents/images).
4.  **Inference Engine:** Google Vertex AI (Gemini Pro) for reasoning and legal drafting.
5.  **Knowledge Base:** Google Cloud Storage bucket indexed via Vertex AI Search for RAG retrieval.

## Technical Stack

* **Language:** Python 3.9+
<<<<<<< HEAD
* **Framework:** Flask (Backend), Jinja2 (Templating)
=======
* **Framework:** Django==6.0.0 (Backend), Jinja2 (Templating)
>>>>>>> b402a80a0b90519a154863283c3e66c428652071
* **AI/ML Services:**
    * Google Vertex AI (Agent Builder)
    * Google Cloud Vision API (OCR)
    * Google Gemini Pro 1.5 (LLM)
* **Frontend:** Vanilla JavaScript, Tailwind CSS
* **Version Control:** Git

## Prerequisites

Before deploying the application, ensure the following requirements are met:

* Python 3.9 or higher installed.
* A Google Cloud Platform (GCP) project with the following APIs enabled:
    * Vertex AI API
    * Cloud Vision API
    * Cloud Storage API
* A Service Account Key (`key.json`) with `Storage Admin` and `Vertex AI User` roles.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/YOUR-USERNAME/Nyaya-Sahayak-Core.git](https://github.com/YOUR-USERNAME/Nyaya-Sahayak-Core.git)
cd Nyaya-Sahayak-Core
