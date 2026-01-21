# Nyaya-Sahayak: AI-Powered Legal Enforcement System

## Project Overview

Nyaya-Sahayak is a multimodal Retrieval-Augmented Generation (RAG) platform designed to automate the generation of legal notices and preliminary case analysis. The system leverages Google Cloud Vertex AI and Computer Vision to interpret unstructured evidence (images, audio, and documents) and cross-reference them against a vectorised knowledge base of Indian laws (IPC, CrPC, Consumer Protection Act).

Unlike standard legal chatbots which provide generic advice, Nyaya-Sahayak is engineered to be an execution tool. It assesses case viability with a probabilistic success score and generates legally binding PDF notices ready for dispatch.

## System Architecture

The application follows a microservices-oriented architecture:

1.  **Frontend Client:** A responsive web interface built with HTML5, JavaScript, and Tailwind CSS.
2.  **Backend Server:** A Python Flask application serving RESTful API endpoints.
3.  **OCR Layer:** Google Cloud Vision API for text extraction from physical evidence (scanned documents/images).
4.  **Inference Engine:** Google Vertex AI (Gemini Pro) for reasoning and legal drafting.
5.  **Knowledge Base:** Google Cloud Storage bucket indexed via Vertex AI Search for RAG retrieval.

## Technical Stack

* **Language:** Python 3.9+
* **Framework:** Django==6.0.0 (Backend), Jinja2 (Templating)
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
