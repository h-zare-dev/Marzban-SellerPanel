FROM node:slim

WORKDIR /backend

COPY package.json ./package.json

RUN npm install --production

COPY ./dist ./dist

EXPOSE 80

CMD ["npm", "start"]