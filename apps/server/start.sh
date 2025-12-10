#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."

# Try common hostnames so this script works both locally and in the platform
while true; do
  if nc -z mysql 3306 2>/dev/null; then
    echo "MySQL reachable at 'mysql:3306'"
    break
  fi

  if nc -z localhost 3306 2>/dev/null || nc -z 127.0.0.1 3306 2>/dev/null; then
    echo "MySQL reachable at 'localhost:3306'"
    break
  fi

  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up - starting server"
npm start

