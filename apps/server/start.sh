#!/bin/bash
set -e

echo "[start.sh] Waiting for database"
until npx prisma db push; do
	echo "[start.sh] Database not ready, retrying in 2s"
	sleep 2
done

echo "[start.sh] Seeding database"
node prisma/seed.js

echo "[start.sh] Starting server"
npm start

