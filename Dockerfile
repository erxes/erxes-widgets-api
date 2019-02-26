FROM node:8-slim
WORKDIR /erxes-widgets-api/
COPY prod /erxes-widgets-api
RUN chown -R node:node /erxes-widgets-api
USER node
EXPOSE 3100
CMD ["yarn", "start"]
