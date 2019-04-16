FROM erxes/runner
WORKDIR /erxes-widgets-api
COPY yarn.lock package.json ./
RUN yarn install
CMD ["yarn", "dev"]
