FROM node:20-bookworm-slim as dev
ENV TZ Asia/Tokyo

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY components lang layouts pages plugins public server nuxt.config.ts tsconfig.json ./

CMD ["npm", "run", "dev"]
