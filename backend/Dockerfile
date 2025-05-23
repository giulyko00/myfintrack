# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create wait-for-db script
RUN echo '#!/bin/sh' > /wait-for-db.sh && \
    echo 'until pg_isready -h db -p 5432; do' >> /wait-for-db.sh && \
    echo '  echo "Waiting for PostgreSQL..."' >> /wait-for-db.sh && \
    echo '  sleep 2' >> /wait-for-db.sh && \
    echo 'done' >> /wait-for-db.sh && \
    chmod +x /wait-for-db.sh

# Create wait_for_db.py script
RUN echo 'import sys' > wait_for_db.py && \
    echo 'import time' >> wait_for_db.py && \
    echo 'import os' >> wait_for_db.py && \
    echo 'import psycopg2' >> wait_for_db.py && \
    echo 'from psycopg2 import OperationalError' >> wait_for_db.py && \
    echo '' >> wait_for_db.py && \
    echo 'def wait_for_db():' >> wait_for_db.py && \
    echo '    max_retries = 30' >> wait_for_db.py && \
    echo '    count = 0' >> wait_for_db.py && \
    echo '    while count < max_retries:' >> wait_for_db.py && \
    echo '        try:' >> wait_for_db.py && \
    echo '            conn = psycopg2.connect(' >> wait_for_db.py && \
    echo '                dbname=os.environ.get("SQL_DATABASE"),' >> wait_for_db.py && \
    echo '                user=os.environ.get("SQL_USER"),' >> wait_for_db.py && \
    echo '                password=os.environ.get("SQL_PASSWORD"),' >> wait_for_db.py && \
    echo '                host=os.environ.get("SQL_HOST", "db"),' >> wait_for_db.py && \
    echo '                port=os.environ.get("SQL_PORT", 5432)' >> wait_for_db.py && \
    echo '            )' >> wait_for_db.py && \
    echo '            conn.close()' >> wait_for_db.py && \
    echo '            print("Database is ready!");' >> wait_for_db.py && \
    echo '            return True' >> wait_for_db.py && \
    echo '        except OperationalError as e:' >> wait_for_db.py && \
    echo '            count += 1' >> wait_for_db.py && \
    echo '            print(f"Waiting for database... (Attempt {count}/{max_retries})")' >> wait_for_db.py && \
    echo '            time.sleep(2)' >> wait_for_db.py && \
    echo '    print("Failed to connect to database after maximum retries")' >> wait_for_db.py && \
    echo '    return False' >> wait_for_db.py && \
    echo '' >> wait_for_db.py && \
    echo 'if __name__ == "__main__":' >> wait_for_db.py && \
    echo '    sys.exit(0 if wait_for_db() else 1)' >> wait_for_db.py

# Make the entrypoint executable
RUN chmod +x /app/wait_for_db.py

# Command to run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
