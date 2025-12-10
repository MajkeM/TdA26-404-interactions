#!/bin/bash
set -e

echo "[start.sh] Applying Prisma schema"
npx prisma db push

echo "[start.sh] Seeding database"
node prisma/seed.js

echo "[start.sh] Starting server"
npm start

