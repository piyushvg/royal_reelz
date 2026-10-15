FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
# dummy values for build only; real ones come from env_file at runtime
RUN PAYLOAD_SECRET=build-only DATABASE_URL=file:/tmp/build.db pnpm build

FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["node", "server.js"]
