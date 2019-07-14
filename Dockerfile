FROM node:10.16.0-slim
WORKDIR /erxes-widgets-api/
RUN chown -R node:node /erxes-widgets-api
COPY --chown=node:node . /erxes-widgets-api
USER node
EXPOSE 3100
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
