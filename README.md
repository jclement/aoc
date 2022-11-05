# Advent of Qode

[![Build Status](https://drone-gh.erraticbits.ca/api/badges/jclement/aoc/status.svg)](https://drone-gh.erraticbits.ca/jclement/aoc)

## Ideas


Robohashes are now served from <code>https://robots.adventofquorum.org</code>!

## Server

### Server Setup

You need Python 3.x installed.

Setup a new Python Virtual Env in this folder (keeps us from contaminating global Python)

```sh
cd backend
```

```sh
python -m venv venv
```

Activate the Virtual Environment

```txt
# Windows
venv\scripts\activate

# Mac / Linux
. venv/bin/activate
```

Install dependencies for this application

```sh
# Windows
pip install -r backend\requirements.txt

# Mac / Linux
pip install -r backend/requirements
```

### Running the Server

Run it
```sh
cd backend
uvicorn app.main:app --reload
```

### API Documentation & Swagger

Check out the Swagger page:
http://localhost:8000/docs/

### Creating / Resetting the Database

A new empty SQLITE database is created on startup.

## Client

### Client Setup

Install a recent version of Node

```sh
cd frontend
npm install
```

### Running the Development Client

```sh
cd frontend
npm start
```

See `setupProxy.js` for code that pushes /api requests through to the development server.

## Production Deployment Notes

1. Modify settings in `.env`
2. `docker-compose up --build`
3. Hide it behind some sort of TLS thing
