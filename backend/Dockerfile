FROM node:18

WORKDIR /app

# Install PostgreSQL client for pg_isready
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy package.json first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application and .env
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
