# Telegram Chatbot Demo

A NestJS-based Telegram chatbot that provides information about computer hardware products using OpenAI GPT integration.

## Features

- 🤖 **Telegram Bot Integration**: Interactive chatbot using Telegraf
- 🧠 **AI-Powered Responses**: OpenAI GPT-4 integration for intelligent conversations
- 💾 **Product Database**: PostgreSQL database for storing computer hardware products
- 🌐 **RESTful API**: Product management endpoints
- 🐳 **Docker Support**: Containerized deployment with Docker Compose
- 🔧 **TypeScript**: Full TypeScript support with NestJS framework

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Bot Framework**: Telegraf (nestjs-telegraf)
- **AI Integration**: OpenAI API
- **Language**: TypeScript
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Telegram Bot Token (from @BotFather)
- OpenAI API Key

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Chatbot-Demo
```

2. Create a `.env` file in the root directory:
```env
PORT=3000

# Database Configuration
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=products_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

## Getting Your API Keys

### Telegram Bot Token
1. Message @BotFather on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the provided token to your `.env` file

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## Running with Docker (Recommended)

### Quick Start
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up --build -d

# Stop services
docker-compose down
```

### Services
The Docker setup includes:
- **App**: NestJS application (Port: 3000)
- **Database**: PostgreSQL (Port: 5432)
- **Adminer**: Database management UI (Port: 8080)

### Accessing Services
- **API**: http://localhost:3000
- **Database Admin**: http://localhost:8080
  - System: PostgreSQL
  - Server: db
  - Username: postgres
  - Password: postgres
  - Database: products_db

## Local Development

### Installation
```bash
npm install
```

### Development Mode
```bash
npm run start:dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm run start:prod
```

## API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/search?name=<product_name>` - Search product by name
- `POST /products` - Create a new product

### Example Product Creation
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RTX 4090",
    "brand": "NVIDIA",
    "description": "High-end graphics card for gaming and AI workloads",
    "price": 1599.99,
    "stock": 10
  }'
```

## Bot Usage

1. Start a conversation with your bot on Telegram
2. Send `/start` to begin
3. Ask questions about computer hardware:
   - "Tell me about RTX 4090"
   - "What's the price of Intel i9?"
   - "Do you have any AMD processors?"

The bot will:
- Search for relevant products in the database
- Use AI to provide detailed, contextual responses
- Support multiple languages based on user's Telegram language

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
├── products/             # Product management module
│   ├── entities/         # Database entities
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
└── telegram/             # Telegram bot module
    ├── chat.service.ts   # AI chat logic
    ├── telegram.service.ts # Bot message handlers
    └── telegram.module.ts
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Troubleshooting

### Common Issues

1. **Bot Token Error**: Ensure your Telegram bot token is correct in `.env`
2. **Database Connection**: Make sure PostgreSQL is running and credentials are correct
3. **OpenAI API**: Verify your API key and check rate limits
4. **Docker Issues**: Try `docker-compose down` and `docker-compose up --build`

### Logs
```bash
# View application logs
docker-compose logs app

# View database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## Support

For issues and questions, please open an issue in the repository.
