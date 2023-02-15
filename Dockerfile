#FROM node:alpine AS builder
## Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
#RUN apk add --no-cache libc6-compat
#RUN apk update
## Set working directory
#WORKDIR /app
#RUN npm i -g turbo pnpm
#COPY . .
#RUN turbo prune --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm i -g turbo pnpm dotenv-cli

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
#COPY --from=builder /app/out/json/ .
#COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm fetch
RUN pnpm install -r --offline

# Build the project and its dependencies
#COPY --from=builder /app/out/full/ .
#COPY turbo.json turbo.json
COPY . .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm install --offline
RUN turbo run build
RUN pnpm install -r --offline --prod

RUN dotenv -e .env.heroku -- turbo run start