# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements-render.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-render.txt

# Copy the entire project
COPY . .

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Build frontend
RUN cd frontend && npm install && npm run build

# Expose port
EXPOSE $PORT

# Start command
CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
