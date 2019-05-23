FROM node:10-slim
WORKDIR /erxes-widgets-api/
COPY prod /erxes-widgets-api
RUN chown -R node:node /erxes-widgets-api
USER node
EXPOSE 3100
CMD ["node", "--max_old_space_size=8192", "dist"]
