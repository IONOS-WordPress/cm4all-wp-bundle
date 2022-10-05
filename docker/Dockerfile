# syntax=docker/dockerfile:1.4

ARG nodejs_base
FROM node:${nodejs_base}

ARG pnpm_package
RUN npm config set update-notifier false
# RUN npm install --silent -g ${pnpm_package}

# ADD ./package /tmp/package
ADD ./lgersman-wickeltisch-wp-esbuild-bundler-1.0.1.tgz /tmp
# RUN sh -c 'pnpm setup'
RUN npm install -g /tmp/package

# ENTRYPOINT [ "wp-esbuild-bundler-cli" ]