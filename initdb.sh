rm aoc.sqlite
rm -rf migrations
flask db init
flask db migrate
flask db upgrade
