# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

ARG pnpm_package
RUN npm config set update-notifier false

COPY ./*.tgz /tmp
WORKDIR /app
RUN ls /tmp/*.tgz | xargs npm install -g --silent --omit=peer --omit=dev

# ENTRYPOINT ['/bin/bash']
# USER node
CMD [ "wp-esbuild-bundler-cli" ]