ARG NODE_VERSION=20.11.0-alpine

FROM node:${NODE_VERSION} as node

FROM node as client-local-build

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

COPY ./package*.json .

RUN npm install

COPY . ${APP_HOME}

CMD ["npm","run","start"]
