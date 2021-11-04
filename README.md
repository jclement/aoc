# Advent of Code

## Ideas

Robohash for profile pics, rather than uploads.  

## Setup

You need Python 3.x installed.

Setup a new Python Virtual Env in this folder (keeps us from contaminating global Python)

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
pip install -r requirements
```

Run it (from the root, not the app folder)
```sh
uvicorn app.main:app --reload
```

Check out the Swagger page:
http://localhost:8000/docs/

## Creating / Resetting the Database

A new empty SQLITE database is created on startup.

## Production Deployment Notes

* See `settings.py`.  Almost everything in there should be overwritten as an environment variable
* Postgres instead of sqlite
* Docker?
* Behind NGINX, etc.  (may be able get this all up and running with Compose and Traefik)
