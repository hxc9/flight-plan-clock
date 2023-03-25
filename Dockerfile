# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine as builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add --no-cache py3-pip make g++
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

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm install
RUN dotenv -e .env.heroku -- turbo run build
RUN pnpm install -r --offline --prod

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm i -g turbo pnpm dotenv-cli

COPY --from=builder /app .

EXPOSE 3004

ENV BACKEND_URL=http://127.0.0.1:3002
ENV AUTOROUTER_API_URL=http://127.0.0.1:3000/api

# set the following environment variables
#ENV NEXTAUTH_URL=http://localhost:3004/ar-mock-gui
#ENV NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3002
#ENV NEXTAUTH_SECRET=<set value>

CMD dotenv -e .env.heroku -- turbo run start