#!/bin/sh
set -e

echo "Waiting for Postgres to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting NestJS..."
npm run start:dev
