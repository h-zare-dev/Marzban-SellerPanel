# Stage 1: install dependencies & build
FROM node:slim AS deps

WORKDIR /app

COPY . .

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

RUN npm install

RUN npm run build

# Stage 2: run
FROM node:slim

WORKDIR /backend

COPY --from=deps /app/dist ./dist
COPY --from=deps /app/package.json ./

RUN npm install --production

CMD ["npm", "start"]
