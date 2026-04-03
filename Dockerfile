# ─── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy backend dependencies and install
# NOTE: fit library requires SSH access to GoFynd Azure DevOps.
# In CI/CD, mount your SSH key: --mount=type=ssh or use AZURE_SSH_KEY build arg.
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY index.js ./
COPY app/ ./app/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/public/dist ./frontend/public/dist

EXPOSE 8080

CMD ["node", "index.js"]
