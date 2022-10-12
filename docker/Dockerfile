# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

RUN apt-get update # && apt-get upgrade -y 
RUN DEBIAN_FRONTEND=noninteractive apt-get -yq --no-install-recommends install dumb-init


RUN npm config set update-notifier false
ENV NODE_ENV production

COPY --chown=node:node ./*.tgz /tmp
VOLUME [ "/app" ]
WORKDIR /app
RUN ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev


USER node
# ENTRYPOINT  [ "dumb-init", "wp-esbuild-bundle-cli"]
ENTRYPOINT  [ "wp-esbuild-bundle-cli"]