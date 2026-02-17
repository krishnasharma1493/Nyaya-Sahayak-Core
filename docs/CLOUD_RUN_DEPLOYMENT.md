# ============================================
# NYAYA-SAHAYAK - Google Cloud Run Deployment
# ============================================

## Prerequisites

1. **Google Cloud SDK**: Install from https://cloud.google.com/sdk/docs/install
2. **Google Cloud Project**: Create one at https://console.cloud.google.com
3. **Environment Variables**: Your `.env` file with API keys

## Quick Deploy

```bash
./deploy_to_cloud_run.sh
```

That's it! The script will:
- ✅ Copy frontend to backend
- ✅ Enable required APIs
- ✅ Build Docker image
- ✅ Deploy to Cloud Run
- ✅ Give you the live URL

## Manual Steps (Optional)

### 1. Prepare Frontend

```bash
mkdir -p project/static_frontend
cp -r index.html script.js style.css constitution.jpg project/static_frontend/
```

### 2. Build Docker Image

```bash
cd project
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nyaya-sahayak
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy nyaya-sahayak \
  --image gcr.io/YOUR_PROJECT_ID/nyaya-sahayak \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --set-env-vars "GOOGLE_API_KEY=your_key"
```

## Environment Variables

Set these in Cloud Run:

```bash
gcloud run services update nyaya-sahayak \
  --region asia-south1 \
  --set-env-vars "GOOGLE_API_KEY=xxx,PROJECT_ID=xxx,LOCATION=us-central1"
```

## Files Created

1. **`project/Dockerfile`** - Production container definition
2. **`project/.dockerignore`** - Excludes unnecessary files
3. **`deploy_to_cloud_run.sh`** - Automated deployment script

## Troubleshooting

### View Logs
```bash
gcloud run logs read nyaya-sahayak --region asia-south1
```

### Update Service
```bash
gcloud run services update nyaya-sahayak --region asia-south1
```

### Delete Service
```bash
gcloud run services delete nyaya-sahayak --region asia-south1
```

## Cost Estimate

Cloud Run pricing (as of 2026):
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.00002 per request
- **Estimated**: $5-20/month for moderate traffic

## Production Checklist

- [ ] Set `DEBUG=False` in environment variables
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Restrict `ALLOWED_HOSTS` to your domain
- [ ] Set up Cloud SQL for production database
- [ ] Enable Cloud CDN for static files
- [ ] Set up monitoring and alerts
