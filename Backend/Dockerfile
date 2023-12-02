# Stage 1: install dependencies
FROM node:slim AS deps
WORKDIR /app
COPY package*.json .

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN npm install

# Stage 2: build
FROM node:slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: run
FROM node:slim
WORKDIR /backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN npm install --production

CMD ["npm", "start"]
