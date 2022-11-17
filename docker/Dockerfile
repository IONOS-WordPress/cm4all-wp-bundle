# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

COPY ./docker/README.md /
COPY ./LICENSE.md /

COPY --chown=node:node ./docker/*.tgz /tmp/

RUN npm config set update-notifier false && NODE_ENV=production ls /tmp/*.tgz | xargs npm install -g --no-fund --silent --omit=peer --omit=optional --omit=dev && rm /tmp/*.tgz
COPY --chown=node:node --chmod=755 ./docker/entrypoint.sh /usr/local/bin/ 
# RUN ls -la /usr/local/bin/entrypoint.sh

USER node
ENTRYPOINT  [ "entrypoint.sh"]