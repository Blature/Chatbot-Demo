# AI Chemical Products Sales Assistant

A production-ready NestJS + PostgreSQL backend with a Telegram bot that acts as a domain-specific AI sales assistant for chemical and lab products.

## Architecture
- Backend: NestJS (TypeScript)
- DB: PostgreSQL (service name: postgres) with float8[] arrays for vector embeddings
- AI: OpenAI API (text-embedding-3-small, gpt-4o-mini)
- Bot: Telegram (telegraf)
- Containerization: Docker + docker-compose
- Data sources: Excel (.xlsx) or JSON (products_enriched.json)

## How it works
1) Ingestion: A script reads your products from backend/data (JSON preferred; Excel supported) and inserts rows into the database.  
2) Embeddings: For each product, an OpenAI embedding is generated and stored for semantic search.  
3) Chat flow: Telegram messages are analyzed, relevant products are fetched (keyword + semantic), and a concise, sales-oriented answer is returned.  
4) Domain guard: The bot politely refuses out-of-scope topics and keeps the conversation focused on chemical/lab sales.

## Requirements
- Docker + docker-compose
- OpenAI API key
- Telegram bot token

## Environment
Create .env (root) from .env.example and fill:
- OPENAI_API_KEY
- TELEGRAM_BOT_TOKEN
- (optional) PORT=3000, NODE_ENV=production
Note: docker-compose sets DATABASE_URL for the backend container automatically.

## Run with Docker (recommended)
1) Start services:
   docker-compose up --build -d
2) Seed data (choose one):
   - Use your files: put products.xlsx or products_enriched.json in backend/data, then:
     docker exec ai_backend npm run seed:prod
   - Generate a sample Excel first:
     docker exec ai_backend node scripts/create-sample-excel.js
     docker exec ai_backend npm run seed:prod
   The seeder looks for /app/data/products_enriched.json or /app/data/products.xlsx inside the container (mapped from ./backend/data).
3) Check logs:
   docker-compose logs -f backend
4) Talk to your Telegram bot using the configured token.

## Local development (without Docker for the app)
- DB: You can keep docker-compose running only PostgreSQL (exposes 5433 on host), or use your own DB.
- App:
  cd backend
  npm install
  npm run start:dev
- Seeding (dev mode uses ts-node):
  npm run seed

## Useful commands
- Start all: docker-compose up --build -d
- Stop all: docker-compose down
- Backend logs: docker-compose logs -f backend
- Exec into backend: docker exec -it ai_backend sh
- Rerun seed (prod): docker exec ai_backend npm run seed:prod

## Project structure (key parts)
- backend/src: NestJS source
- backend/scripts: ingest-products.ts (seeding), init-db.sql (DB helpers)
- backend/data: your product files (mounted to /app/data)

## Troubleshooting
- No products found in chat: ensure backend/data contains products_enriched.json or products.xlsx and rerun seed. Confirm inside container: docker exec ai_backend ls -la /app/data
- OpenAI errors: verify OPENAI_API_KEY and billing
- Telegram not responding: check TELEGRAM_BOT_TOKEN and backend logs
- DB not ready: docker-compose ensures healthcheck; wait a few seconds or check docker-compose logs postgres

## Security notes
- Do not commit real API keys/tokens. Use .env and secret management in production.

## License
MIT