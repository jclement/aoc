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

```

Initialize the database:
```
flask db init
flask db migrate
flask db upgrade
```

Bootstrap the database:
```
sqlite3 aoc.sqlite < initialize.sql
```

## Nuking the Database / Restarting
* Delete `aoc.sqlite`
* Delete the `migrations` folder
* Rerun the database initialization/bootstrapping steps (above)