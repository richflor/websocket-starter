FROM node:22-alpine

WORKDIR /
COPY ./package.json .
RUN npm install
COPY . .
RUN npm install
EXPOSE 3001
# CMD /bin/sh -c "while sleep 1000; do :; done"
CMD ["npm", "run", "dev"]