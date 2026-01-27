# Dockerfile for Nyaya-Sahayak Django Backend
# Optimized for Google Cloud Run

FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy static files (frontend will be copied here by deploy script)
# The deploy script will move the frontend build to ./static_frontend/
COPY static_frontend/ ./static_frontend/ 2>/dev/null || true

# Collect Django static files
RUN python manage.py collectstatic --noinput || true

# Create necessary directories
RUN mkdir -p media temp_uploads

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Run gunicorn server (production-ready)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 nyayasahayak.wsgi:application
