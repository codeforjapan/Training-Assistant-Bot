#!/bin/sh
>&2 echo "Starting server..."

# If /data/original directory is not existed, then create it
if [ ! -d "/data/original" ]; then
  mkdir -p /data/original
fi
if [ ! -d "/data/thumbnail" ]; then
  mkdir -p /data/thumbnail
fi

npm run start:dev
