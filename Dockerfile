FROM node:20-alpine AS builder

RUN apk add --no-cache openssl
RUN apk add --no-cache tzdata

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build


FROM node:20-alpine AS production

RUN apk add --no-cache openssl
RUN apk add --no-cache tzdata

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node prisma.config.ts ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=node:node /app/generated ./generated

COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]