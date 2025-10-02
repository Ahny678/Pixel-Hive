#!/bin/sh

# Run Prisma migrations before starting the NestJS server
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting NestJS..."
npm run start:dev
