#!/bin/bash

# ============================================
# NYAYA-SAHAYAK - Google Cloud Run Deployment Script
# ============================================
# This script automates the entire deployment process:
# 1. Prepares frontend static files
# 2. Builds Docker image
# 3. Deploys to Google Cloud Run
# ============================================

set -e  # Exit on any error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   NYAYA-SAHAYAK - CLOUD RUN DEPLOYMENT                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: Copy Frontend to Backend
# ============================================
echo -e "${BLUE}[STEP 1/5]${NC} Preparing Frontend Files..."

# Copy frontend files to backend static_frontend directory
mkdir -p project/static_frontend
cp -r index.html script.js style.css constitution.jpg project/static_frontend/

echo -e "${GREEN}✓${NC} Frontend files copied to project/static_frontend/"

# ============================================
# STEP 2: Get Google Cloud Project ID
# ============================================
echo ""
echo -e "${BLUE}[STEP 2/5]${NC} Google Cloud Configuration"

# Try to get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -n "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}Current project:${NC} $CURRENT_PROJECT"
    read -p "Use this project? (y/n): " USE_CURRENT
    if [[ $USE_CURRENT == "y" || $USE_CURRENT == "Y" ]]; then
        PROJECT_ID=$CURRENT_PROJECT
    else
        read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    fi
else
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
fi

echo -e "${GREEN}✓${NC} Using project: $PROJECT_ID"

# Set the project
gcloud config set project $PROJECT_ID

# ============================================
# STEP 3: Enable Required APIs
# ============================================
echo ""
echo -e "${BLUE}[STEP 3/5]${NC} Enabling Google Cloud APIs..."

gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet

echo -e "${GREEN}✓${NC} APIs enabled"

# ============================================
# STEP 4: Build Docker Image
# ============================================
echo ""
echo -e "${BLUE}[STEP 4/5]${NC} Building Docker Image..."

# Build with Cloud Build
gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/nyaya-sahayak \
    --timeout=20m \
    ./project

echo -e "${GREEN}✓${NC} Docker image built: gcr.io/$PROJECT_ID/nyaya-sahayak"

# ============================================
# STEP 5: Deploy to Cloud Run
# ============================================
echo ""
echo -e "${BLUE}[STEP 5/5]${NC} Deploying to Cloud Run..."

# Ask for region
echo "Select deployment region:"
echo "1) us-central1 (Iowa)"
echo "2) asia-south1 (Mumbai)"
echo "3) europe-west1 (Belgium)"
read -p "Enter choice (1-3, default: 2): " REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="us-central1" ;;
    3) REGION="europe-west1" ;;
    *) REGION="asia-south1" ;;  # Default to Mumbai
esac

echo -e "${YELLOW}Deploying to region:${NC} $REGION"

# Deploy to Cloud Run
gcloud run deploy nyaya-sahayak \
    --image gcr.io/$PROJECT_ID/nyaya-sahayak \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY,PROJECT_ID=$PROJECT_ID,LOCATION=us-central1" \
    --quiet

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ DEPLOYMENT SUCCESSFUL!                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe nyaya-sahayak --region $REGION --format 'value(status.url)')

echo -e "${BLUE}Your application is live at:${NC}"
echo -e "${GREEN}${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}Legal Console:${NC} ${SERVICE_URL}/legal-console/"
echo ""
echo "To view logs:"
echo "  gcloud run logs read nyaya-sahayak --region $REGION"
echo ""
echo "To update environment variables:"
echo "  gcloud run services update nyaya-sahayak --region $REGION --set-env-vars KEY=VALUE"
echo ""

# Copy URL to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    echo $SERVICE_URL | pbcopy
    echo -e "${GREEN}✓${NC} URL copied to clipboard!"
fi
