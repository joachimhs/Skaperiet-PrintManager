# ─────────────────────────────────────────────────────────────
# 1) Install deps & build (has devDependencies, your full source)
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y prusa-slicer curl \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get autoremove -y \
  && apt-get autoclean

WORKDIR /app

# 1a) Copy only the package manifests & lockfile first
#     → enables docker layer caching when deps haven’t changed
COPY package.json package-lock.json svelte.config.js tsconfig.json ./
# If you have vite.config.js or other root files, copy them here too:
COPY vite.config.ts ./

# 1b) Install ALL dependencies (including devDependencies)
RUN npm ci

# 1c) Copy the rest of your source
COPY src ./src
# If you have any static or public folder, copy it:
COPY static ./static

# 1d) Run the SvelteKit build
RUN npm run build        # this usually calls `svelte-kit build`

# ─────────────────────────────────────────────────────────────
# 2) Production image (only prod deps + built output)
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

# Tell npm to omit devDeps
ENV NODE_ENV=production

# 2a) Copy only the package manifests & lockfile for prod-only install
COPY package.json package-lock.json ./

# 2b) Install production dependencies
RUN npm ci --omit=dev

# 2c) Copy the built output from the builder stage
COPY --from=builder /app/build   ./build
# If you have a `static` folder that needs to be served, copy that too
COPY --from=builder /app/static  ./static

# 2d) Expose the port (if you’re using adapter-node, default is 3000)
EXPOSE 3000

# 2e) Launch the built SvelteKit/Node server
CMD ["node", "build/index.js"]