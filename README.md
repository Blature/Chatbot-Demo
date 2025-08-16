# AI Chemical Products Sales Assistant

A NestJS + PostgreSQL + Telegram bot application that works as a domain-specific AI sales assistant for chemical products.

## Features

- 📊 **Excel Import**: Reads product data from Excel files
- 🤖 **AI-Powered**: Uses OpenAI GPT-4o-mini for intelligent responses
- 🔍 **Semantic Search**: Vector embeddings for product search
- 💬 **Telegram Bot**: Interactive chat interface
- 🐳 **Docker Ready**: Complete containerization
- 🇮🇷 **Persian Support**: Fully supports Persian language

## Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL with float8[] arrays for embeddings
- **AI**: OpenAI API (text-embedding-3-small + gpt-4o-mini)
- **Bot**: Telegram Bot API (telegraf)
- **Deployment**: Docker + docker-compose
- **Excel Parsing**: xlsx npm package

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ai-seller
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/ai_seller
OPENAI_API_KEY=your_openai_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Start with Docker

```bash
docker-compose up --build
```

### 4. Create Sample Data

```bash
# Generate sample Excel file
docker exec ai_backend node scripts/create-sample-excel.js

# Import products and generate embeddings
docker exec ai_backend npm run seed:prod
```

### 5. Test Your Bot

Start a chat with your Telegram bot and ask about chemical products!

## Database Schema

### Products Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_code | text | Product code from Excel |
| product_name | text | Product description |
| unit | text | Unit of measurement |

### Product Embeddings Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| product_id | uuid | Foreign key to products |
| embedding | float8[] | OpenAI embedding vector |

## Excel File Format

Your Excel file should have these columns:

| ردیف | کد کالا | شرح کالا | واحد 1 |
|------|---------|----------|--------|
| 1 | CH001 | اسید سولفوریک 98% | لیتر |
| 2 | CH002 | سود سوزآور | کیلوگرم |

## API Endpoints

The application primarily works through Telegram bot, but you can extend it with REST APIs.

## Development

### Local Development

```bash
cd backend
npm install
npm run start:dev
```

### Database Migration

```bash
# The app uses TypeORM synchronize for demo purposes
# For production, use proper migrations
```

### Seeding Data

```bash
# Development
npm run seed

# Production
npm run seed:prod
```

## Docker Commands

```bash
# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in backend container
docker exec ai_backend npm run seed:prod
```

## AI Behavior Rules

- ✅ Always responds in chemical product domain
- ✅ Never says "I don't know" or gives unrelated answers
- ✅ Uses product data to enrich responses
- ✅ Maintains friendly, expert, sales-oriented tone
- ✅ Keeps conversation memory (last 5 exchanges)
- ✅ Responds in Persian language

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check TELEGRAM_BOT_TOKEN
2. **OpenAI errors**: Verify OPENAI_API_KEY and billing
3. **Database connection**: Ensure PostgreSQL is running
4. **Excel import fails**: Check file path and format

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs postgres
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.