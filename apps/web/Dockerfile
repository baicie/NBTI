# ============================================
# Stage 1: Install dependencies
# ============================================
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Copy lockfiles and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
 corepack enable pnpm && pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application
# ============================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Copy all files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

# Reinstall dependencies (don't rely on dependencies stage)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

ENV NODE_ENV=production

RUN pnpm --filter @nbti/web build

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy public directory
COPY --from=builder --chown=node:node /app/apps/web/public ./public

# Copy standalone output (contains apps/web/ with server.js and .next/)
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./

# Copy static files (if not already in standalone)
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
