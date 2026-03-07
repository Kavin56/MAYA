FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (e.g., for Playwright if needed by OWL agents)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Post-install hooks for playwright
RUN playwright install --with-deps chromium

# Copy the server code
COPY main.py .

# Environment setup
ENV PORT=5000
EXPOSE 5000

# Start Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
