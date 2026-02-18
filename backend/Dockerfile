FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

#installer les dependances
RUN pip install --no-cache-dir -r requirements.txt

# Appliquer les migrations


HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3  \
    CMD [ "executable" ]

COPY . .
#RUN python3 manage.py collectstatic
RUN python3 manage.py makemigrations
RUN python3 manage.py migrate

EXPOSE 8000

CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]
