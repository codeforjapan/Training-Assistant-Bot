#!/bin/bash
# wait-for-postgres.sh

set -e
cmd="$@"

until PGPASSWORD=${DATABASE_PASSWORD} psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" "${DATABASE_NAME}" -c '\l'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

PGPASSWORD=${DATABASE_PASSWORD} psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" "${DATABASE_NAME}" -c 'CREATE SCHEMA IF NOT EXISTS app'

>&2 echo "Postgres is up - executing command"
exec $cmd