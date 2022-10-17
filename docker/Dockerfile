# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

RUN apt-get update # && apt-get upgrade -y 
RUN DEBIAN_FRONTEND=noninteractive apt-get -yq --no-install-recommends install dumb-init


RUN npm config set update-notifier false

COPY --chown=node:node ./*.tgz /tmp
VOLUME [ "/app" ]
WORKDIR /app
RUN NODE_ENV=production ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev

USER node
ENV NODE_PATH /app/node_modules 
ENTRYPOINT  [ "dumb-init", "wp-esbuild-bundle-cli"]