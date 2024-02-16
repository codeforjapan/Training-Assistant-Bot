#!/usr/bin/env bash

function generateSecret() {
    openssl rand -hex 16
}

SESSION_SECRET=$(generateSecret)
TOKEN_SECRET=$(generateSecret)

sed -i.bak \
    -e "s#SESSION_SECRET=.*#SESSION_SECRET=${SESSION_SECRET}#g" \
    -e "s#TOKEN_SECRET=.*#TOKEN_SECRET=${TOKEN_SECRET}#g" \
    "$(dirname "$0")/.env"