# Use a lightweight Python version
FROM python:3.11-slim

# Set the folder inside the cloud computer
WORKDIR /app

# Copy your requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all your project files into the cloud computer
COPY . .

# Tell the cloud to run your main script on port 8080
# IMPORTANT: Change 'main.py' if your entry file has a different name
CMD ["python", "main.py", "--port", "8080"]
