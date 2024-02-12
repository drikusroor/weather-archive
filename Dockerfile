FROM python:3.9

# Install requests package
RUN pip install requests

# Add your code here
COPY . /app

# Set the working directory
WORKDIR /app

# Run the script
CMD ["python", "main.py"]
