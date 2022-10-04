# syntax=docker/dockerfile:1.4

ARG base
FROM node:${base} as workspace

ARG pnpm
RUN npm install -g pnpm@$pnpm

COPY 
RUN ls -la

FROM workspace as pruned
RUN pnpm --prod deploy pruned

# FROM node:18-alpine
# WORKDIR /app

# ENV NODE_ENV=production

# COPY --from=pruned /app/pruned .

# ENTRYPOINT ["node", "index.js"]