FROM tiangolo/uvicorn-gunicorn:python3.9
WORKDIR /app
COPY ./requirements.prod.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./app /app/app
#EXPOSE 8000
#CMD ["uvicorn", "backend.main:app", "--root-path", "/api", --"proxy-headers", "--host", "0.0.0.0", "--port", "8000"]
