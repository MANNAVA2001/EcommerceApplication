
FROM node:18-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json ./ 

RUN npm ci

COPY . .

RUN npm run build 

FROM node:18-alpine

WORKDIR /app

# Install Chrome dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

ENV NODE_ENV production

CMD ["npm", "start"]
