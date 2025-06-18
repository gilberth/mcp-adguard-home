FROM oven/bun:1-slim

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with Bun (will generate lockfile if needed)
RUN bun install

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Set the entry point
CMD ["bun", "run", "dist/index.js"]
