FROM node:22-alpine

WORKDIR /
COPY ./package.json .
RUN npm install
COPY . .
RUN npm install
CMD /bin/sh -c "while sleep 1000; do :; done"