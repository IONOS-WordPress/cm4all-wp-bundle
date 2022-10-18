# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

COPY --chown=node:node ./*.tgz /tmp/
RUN npm config set update-notifier false && NODE_ENV=production ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev && rm /tmp/*.tgz
COPY --chown=node:node ./entrypoint.sh /usr/local/bin/ 
RUN chmod u+x /usr/local/bin/entrypoint.sh

USER node
ENTRYPOINT  [ "entrypoint.sh"]