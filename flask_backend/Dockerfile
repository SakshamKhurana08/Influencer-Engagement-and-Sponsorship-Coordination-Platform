# =============================================================================
#  Cofluence — Flask API Dockerfile (multi-stage)
#  Stage 1: install all Python deps into /install
#  Stage 2: lean runtime image, non-root user for security
#
#  Build:  docker build -t cofluence-api ./flask_backend
#  Run:    docker run -p 5000:5000 --env-file flask_backend/.env cofluence-api
# =============================================================================

# ── Stage 1: dependency builder ───────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /install

COPY requirements.txt .

RUN pip install --upgrade pip --quiet && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: lean runtime ─────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -u 1000 appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Create uploads directory and set ownership
RUN mkdir -p uploads/influencer_photos && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Run migrations then start gunicorn.
# flask db upgrade is idempotent — already-applied migrations are skipped.
CMD ["sh", "-c", "flask db upgrade && gunicorn -w 2 -b 0.0.0.0:5000 --timeout 120 --access-logfile - run:app"]
