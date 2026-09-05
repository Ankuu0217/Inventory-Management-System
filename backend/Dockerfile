FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
