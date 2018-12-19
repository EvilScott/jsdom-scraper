FROM node:10.12
EXPOSE 8080
WORKDIR /app
ADD package.json .
RUN yarn install
ADD index.js .
CMD ["node", "index.js"]
