# Multi-stage build for production optimization

# Stage 1: Base image
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Development dependencies
FROM base AS development

# Set NODE_ENV
ENV NODE_ENV=dev

# Install all dependencies (including devDependencies)
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3056

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start development server with auto-reload
CMD ["npm", "run", "dev"]

# Stage 3: Production build
FROM base AS production-build

# Install all dependencies (including devDependencies for TypeScript)
RUN npm install

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 4: Production runtime
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=pro

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from build stage
COPY --from=production-build /app/dist ./dist
COPY --from=production-build /app/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3056

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3056/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start production server
CMD ["node", "dist/server.js"]
