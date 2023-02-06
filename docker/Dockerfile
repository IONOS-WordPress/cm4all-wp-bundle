# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

COPY ./docker/README.md /
COPY ./LICENSE.md /

COPY --chown=node:node ./docker/*.tgz /tmp/

RUN npm config set update-notifier false 
RUN NODE_ENV=production npm install -g --no-fund --silent --omit=peer --omit=optional --omit=dev /tmp/*.tgz && rm -f /tmp/*.tgz
COPY --chown=node:node --chmod=755 ./docker/entrypoint.sh /usr/local/bin/ 
# RUN ls -la /usr/local/bin/entrypoint.sh

USER node
ENTRYPOINT  [ "entrypoint.sh"]