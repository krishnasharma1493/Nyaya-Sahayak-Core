# 🔧 API SETUP CHECKLIST

**Project:** Nyaya-Sahayak  
**Status:** APIs Partially Enabled

---

## ✅ WHAT'S WORKING

1. ✅ **Vertex AI API** - Enabled (you showed screenshot)
2. ✅ **Credentials** - Valid service account key installed
3. ✅ **Dependencies** - All Python packages installed

---

## ⚠️ WHAT NEEDS TO BE FIXED

### **Issue 1: Additional API Needed**

You also need to enable **Generative Language API**:

**Quick Link:**
https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=109157347948

**Or manual way:**
1. Go to: https://console.cloud.google.com/apis/library
2. Search: "Generative Language API"
3. Click → Enable

---

### **Issue 2: Service Account Permissions** (MOST IMPORTANT)

Your service account needs proper IAM roles:

**Service Account:**  
`vertex-ai-access@project-4b18645b-e7c8-44c0-98f.iam.gserviceaccount.com`

**Required Roles:**
1. ✅ **Vertex AI User** (or Vertex AI Administrator)
2. ✅ **Service Usage Consumer**
3. ✅ **(Optional) AI Platform User**

**How to Add Permissions:**

1. **Go to IAM page:**
   https://console.cloud.google.com/iam-admin/iam?project=project-4b18645b-e7c8-44c0-98f

2. **Find your service account:**
   Look for: `vertex-ai-access@project-4b18645b-e7c8-44c0-98f.iam.gserviceaccount.com`

3. **Click the Edit button** (pencil icon) next to it

4. **Add Role:**
   - Click "+ ADD ANOTHER ROLE"
   - Search for: "Vertex AI User"
   - Select it
   - Click "Save"

---

## 🎯 SIMPLIFIED APPROACH (Recommended)

Since you're getting permission errors, let's **bypass the complex setup** and use a simpler method:

### **Option A: Use API Key Instead** (Easiest for Development)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS"
3. Select "API Key"
4. Copy the key
5. Use it in your code instead of service account

**Benefit:** No permission complexity, works immediately

---

### **Option B: Test Django Server Directly** (Recommended)

Don't worry about the test scripts - let's test the actual Django backend!

The Django `views.py` handles authentication differently and might work even if test scripts fail.

**Let's try it:**

```bash
cd /Users/krishnasharma/Downloads/Nyaya-Sahayak-Core-main-2/project

# Run Django server
python3 manage.py runserver
```

Then we can test the actual API endpoints!

---

## 📊 CURRENT STATUS

```
✅ Vertex AI API Enabled       [████████████] 100%
⚠️  Generative Language API    [░░░░░░░░░░░░]   0%  ← Enable this
⚠️  Service Account Permissions [████░░░░░░░░]  30%  ← Add roles
```

---

## 💡 MY RECOMMENDATION

**DON'T WASTE TIME ON PERMISSIONS!**

Instead, let's:
1. **Start the Django server** and see if it works
2. **If it fails**, we'll switch to using an API Key (much simpler)
3. **Focus on building features** instead of fighting with IAM

The test scripts are nice-to-have, but the real goal is to get your chatbot working!

---

## 🚀 NEXT STEPS (Pick One)

### **Option 1: Enable APIs & Fix Permissions** (Takes 15-30 minutes)
- Enable Generative Language API
- Add IAM roles to service account
- Re-run tests

### **Option 2: Start Django Server Now** (Takes 2 minutes)  **← I RECOMMEND THIS**
- Run: `python3 manage.py runserver`
- Test if backend works despite test failures
- Move forward with development

### **Option 3: Switch to API Key** (Takes 5 minutes)
- Create API key in Google Cloud Console
- Update Django code to use API key
- Simpler authentication, faster development

---

**What would you like to do?** 

My vote: **Let's start the Django server and see what happens!** 🚀
