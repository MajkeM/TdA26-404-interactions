FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma

RUN npm install

COPY . .
RUN chmod +x /app/start.sh

RUN npm run build

ENV DATABASE_URL="mysql://root:tda-root@mysql:3306/tourdeapp"
ENV PORT=3000

EXPOSE 3000

CMD ["/app/start.sh"]
