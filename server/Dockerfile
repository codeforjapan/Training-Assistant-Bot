FROM node:20-bookworm-slim as builder

WORKDIR /app
COPY tsconfig.build.json tsconfig.json ./
COPY package.json package-lock.json ./

RUN npm ci

COPY ./src ./src

RUN npm run build


FROM node:20-bookworm-slim as node_modules

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only-production


FROM node:20-bookworm-slim as dev

WORKDIR /app
COPY tsconfig.build.json tsconfig.json nest-cli.json ./

# TODO Separate container
RUN mkdir -p /usr/share/man/man1/
RUN apt update; \
    apt install -y --no-install-recommends --no-install-suggests \
      zip \
      postgresql-client \
      procps; \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY wait-for-postgres.sh docker-entrypoint.sh ./

RUN npm ci


FROM gcr.io/distroless/nodejs:20

WORKDIR /app
COPY package.json package-lock.json ./

COPY --from=builder /app/dist /app/dist
COPY --from=node_modules /app/node_modules /app/node_modules

CMD [ "dist/main" ]
EXPOSE 3000
