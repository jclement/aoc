# Advent of Code


## Setup

You need Python 3.x installed.

Setup a new Python Virtual Env in this folder (keeps us from contaminating global Python)
```
python -m venv venv
```

Activate the Virtual Environment
```
# Windows
venv\scripts\activate

# Mac / Linux
. venv/bin/activate
```

Install dependencies for this application
```
pip install -r requirements
```

Setup a development `.flaskenv` file (SQLite):
```
#DATABASE_URI=postgresql://postgres:password@localhost:5432/postgres
DATABASE_URI=sqlite:///aoc.sqlite
SECRET_KEY=004f2af45d3a4e161a7dd2d17fdae47f
FLASK_ENV=development
FLASK_APP=main.py
DEBUG=True
```

## Creating / Resetting the Database

See `initdb.sh`