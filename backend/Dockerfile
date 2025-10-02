FROM node:18

WORKDIR /app

# Copy only package.json first for better caching
COPY package*.json ./

RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Use the entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
