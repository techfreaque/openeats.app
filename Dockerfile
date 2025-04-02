# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY . .
ENV NODE_ENV=development
RUN yarn install
WORKDIR /app/src/packages/next-vibe
RUN yarn install
WORKDIR /app


EXPOSE 3000

# Start the Next.js application
CMD ["yarn", "dev"]
