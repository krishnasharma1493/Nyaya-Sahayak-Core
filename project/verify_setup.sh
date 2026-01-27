#!/bin/bash
# Nyaya-Sahayak RAG Setup Verification Script
# Checks if everything is configured correctly

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     NYAYA-SAHAYAK RAG SETUP VERIFICATION               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

echo "📋 CHECKING SETUP COMPONENTS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: .env file exists
echo "1️⃣  Checking .env file..."
if [ -f ".env" ]; then
    echo -e "   ${GREEN}✅ .env file exists${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ .env file NOT found${NC}"
    ((FAIL++))
fi

# Check 2: API Key in .env
echo ""
echo "2️⃣  Checking GOOGLE_API_KEY..."
if grep -q "GOOGLE_API_KEY=AIzaSy" .env 2>/dev/null; then
    echo -e "   ${GREEN}✅ API Key configured${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ API Key missing or invalid${NC}"
    ((FAIL++))
fi

# Check 3: Data Store ID in .env
echo ""
echo "3️⃣  Checking DATA_STORE_ID..."
if grep -q "DATA_STORE_ID=bearacts_" .env 2>/dev/null; then
    DATASTORE_ID=$(grep "DATA_STORE_ID=" .env | cut -d '=' -f2)
    echo -e "   ${GREEN}✅ Data Store ID configured: ${DATASTORE_ID}${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ Data Store ID missing${NC}"
    ((FAIL++))
fi

# Check 4: RAG engine file
echo ""
echo "4️⃣  Checking RAG engine..."
if [ -f "app/rag_engine.py" ]; then
    echo -e "   ${GREEN}✅ rag_engine.py exists${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ rag_engine.py NOT found${NC}"
    ((FAIL++))
fi

# Check 5: Updated views.py
echo ""
echo "5️⃣  Checking views.py integration..."
if grep -q "from .rag_engine import get_rag_engine" app/views.py 2>/dev/null; then
    echo -e "   ${GREEN}✅ views.py uses RAG engine${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  views.py may not be using RAG${NC}"
    ((WARN++))
fi

# Check 6: Dependencies installed
echo ""
echo "6️⃣  Checking Python dependencies..."
if python3 -c "import google.cloud.discoveryengine_v1beta" 2>/dev/null; then
    echo -e "   ${GREEN}✅ google-cloud-discoveryengine installed${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ google-cloud-discoveryengine NOT installed${NC}"
    echo "      Run: pip3 install google-cloud-discoveryengine"
    ((FAIL++))
fi

# Check 7: Cloud Storage bucket
echo ""
echo "7️⃣  Checking Cloud Storage bucket..."
if gsutil ls gs://bearactsfinal/ >/dev/null 2>&1; then
    FILE_COUNT=$(gsutil ls gs://bearactsfinal/ 2>/dev/null | wc -l)
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✅ Bucket exists with ${FILE_COUNT} file(s)${NC}"
        ((PASS++))
    else
        echo -e "   ${YELLOW}⚠️  Bucket exists but is EMPTY${NC}"
        echo "      Upload PDFs: gsutil cp *.pdf gs://bearactsfinal/"
        ((WARN++))
    fi
else
    echo -e "   ${RED}❌ Cannot access bucket gs://bearactsfinal/${NC}"
    ((FAIL++))
fi

# Check 8: Django server
echo ""
echo "8️⃣  Checking if Django server is running..."
if curl -s http://localhost:8000 >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Django server is running on port 8000${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  Django server is NOT running${NC}"
    echo "      Start with: python3 manage.py runserver"
    ((WARN++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "   ${GREEN}✅ Passed: ${PASS}${NC}"
echo -e "   ${YELLOW}⚠️  Warnings: ${WARN}${NC}"
echo -e "   ${RED}❌ Failed: ${FAIL}${NC}"
echo ""

# Overall status
if [ "$FAIL" -eq 0 ]; then
    if [ "$WARN" -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🎉 ALL CHECKS PASSED! Your RAG system is ready!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "🚀 NEXT STEPS:"
        echo ""
        echo "1️⃣  Test the RAG system:"
        echo "   python3 test_rag.py"
        echo ""
        echo "2️⃣  Test the API endpoint:"
        echo "   curl -X POST http://localhost:8000/api/chat/ \\"
        echo "     -H 'Content-Type: application/json' \\"
        echo "     -d '{\"message\": \"What is Section 302 IPC?\"}'"
        echo ""
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  SETUP COMPLETE WITH WARNINGS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "⚠️  Please address the warnings above before testing."
        echo ""
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ SETUP INCOMPLETE${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the failed checks above, then run this script again."
    echo ""
fi

echo ""
