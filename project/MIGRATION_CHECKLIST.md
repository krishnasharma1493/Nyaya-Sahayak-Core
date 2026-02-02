# Nyaya-Sahayak Migration Checklist
# ==================================

## Phase 1: Setup & Configuration
- [x] Create `legal_engine.py` with Context Caching
- [x] Update `.env` with GEMINI_API_KEY
- [x] Create `legal_docs/` directory
- [x] Create simplified `requirements_new.txt`
- [x] Create new `views_new.py`

## Phase 2: Legal Documents
- [ ] Add Indian law PDFs to `legal_docs/`:
  - [ ] IPC (Indian Penal Code)
  - [ ] CrPC (Criminal Procedure Code)
  - [ ] Motor Vehicles Act, 1988
  - [ ] Consumer Protection Act
  - [ ] (Add more as needed)

## Phase 3: Switch to New System
- [ ] Backup old `views.py` → `views_old.py`
- [ ] Rename `views_new.py` → `views.py`
- [ ] Install new dependencies: `pip install -r requirements_new.txt`
- [ ] Test legal brain initialization
- [ ] Test chat endpoint

## Phase 4: Testing
- [ ] Test basic query: "What is Section 420 IPC?"
- [ ] Test situational query: "Traffic police stopped me"
- [ ] Test chat history persistence
- [ ] Test domain lock (reject non-legal queries)

## Phase 5: Cleanup
- [ ] Remove old `rag_engine.py`
- [ ] Uninstall old dependencies
- [ ] Remove service account credentials
- [ ] Update deployment scripts

## Commands to Run

```bash
cd /Users/krishnasharma/Downloads/Nyaya-Sahayak-Core-main-2/project

# 1. Backup old files
cp app/views.py app/views_old.py

# 2. Switch to new system
cp app/views_new.py app/views.py

# 3. Install new dependencies
pip3 install -r requirements_new.txt

# 4. Restart server
python3 manage.py runserver 8000
```

## Expected Output

When server starts, you should see:
```
🏛️  NYAYA-SAHAYAK LEGAL BRAIN INITIALIZATION
✅ Found X legal PDF(s)
📤 Uploading PDFs to Gemini...
✅ Cache created successfully!
🤖 Initializing Gemini 1.5 Pro from cached content...
✅ READY TO ANSWER LEGAL QUERIES
```
