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

Setup a development `.flaskenv` file (SQLite):

```sh
#DATABASE_URI=postgresql://postgres:password@localhost:5432/postgres
DATABASE_URI=sqlite:///aoc.sqlite
SECRET_KEY=004f2af45d3a4e161a7dd2d17fdae47f
FLASK_ENV=development
FLASK_APP=main.py
DEBUG=True
```

## Creating / Resetting the Database

See `initdb.sh`