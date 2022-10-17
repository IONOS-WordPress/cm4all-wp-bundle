# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

# RUN apt-get update # && apt-get upgrade -y 
# RUN DEBIAN_FRONTEND=noninteractive apt-get -yq --no-install-recommends install dumb-init && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node ./*.tgz /tmp/
VOLUME [ "/app" ]
WORKDIR /app
RUN npm config set update-notifier false && NODE_ENV=production ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev && rm /tmp/*.tgz
COPY --chown=node:node ./entrypoint.sh /usr/local/bin/ 
RUN chmod u+x /usr/local/bin/entrypoint.sh

USER node
ENV NODE_PATH /app/node_modules 
ENTRYPOINT  [ "entrypoint.sh"]