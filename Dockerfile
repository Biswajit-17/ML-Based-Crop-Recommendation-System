FROM python:3.10

# Set the working directory
WORKDIR /code

# Copy the requirements file and install
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the app
COPY . /code

# Hugging Face Spaces require port 7860
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
