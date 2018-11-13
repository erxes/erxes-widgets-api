FROM node:8-slim as build-deps
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y rsync && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /erxes-widgets-api/
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
RUN mkdir /erxes-widgets-api/prod
RUN rsync -a /erxes-widgets-api/dist /erxes-widgets-api/prod/ && \
    rsync -a /erxes-widgets-api/node_modules /erxes-widgets-api/prod/ && \
    rsync /erxes-widgets-api/package.json /erxes-widgets-api/prod/ && \
    rsync /erxes-widgets-api/.env.sample /erxes-widgets-api/prod/.env

FROM node:8-slim
WORKDIR /erxes-widgets-api/
COPY --from=build-deps /erxes-widgets-api/prod /erxes-widgets-api
RUN chown -R node:node /erxes-widgets-api
USER node
EXPOSE 3100
CMD ["yarn", "start"]
