# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

# LABEL \
#   maintainer="Lars Gersmann <lars.gersmann@gmail.com>" \
#   org.opencontainers.image.title="dockerhub-description" \
#   org.opencontainers.image.description="An action to update a Docker Hub repository description from README.md" \
#   org.opencontainers.image.authors="Lars Gersmann <lars.gersmann@gmail.com>" \
#   org.opencontainers.image.url="https://github.com/peter-evans/dockerhub-description" \
#   org.opencontainers.image.vendor="https://cm4all.com" \
#   org.opencontainers.image.licenses="MIT"

COPY ./docker/README.md /
COPY ./LICENSE.md /

COPY --chown=node:node ./docker/*.tgz /tmp/
RUN npm config set update-notifier false && NODE_ENV=production ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev && rm /tmp/*.tgz
COPY --chown=node:node ./docker/entrypoint.sh /usr/local/bin/ 
RUN chmod u+x /usr/local/bin/entrypoint.sh

USER node
ENTRYPOINT  [ "entrypoint.sh"]