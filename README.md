# 💰 PFM Bot - Personal Finance Management 

An automated, high-performance personal finance management system operating via a Telegram Bot. Designed with scalability and security in mind, this project features fast-logging capabilities, multi-wallet management, and intuitive reporting, fully optimized for both local development and Production deployment via AWS.

## 🛠 Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL (Primary storage), Redis (Caching & Queueing)
- **ORM:** Prisma
- **Bot Framework:** Telegraf
- **DevOps & Infrastructure:** Docker, Docker Compose, GitHub Actions (CI/CD), AWS EC2
- **Architecture:** Monolith (structured for easy microservices extraction), Dockerized Environments

## ✨ Key Features

- **Lightning-Fast Logging:** Record transactions in seconds with smart parsing.
- **Multi-Wallet Management:** Manage and track balances across Cash, Bank, and E-Wallets simultaneously.
- **Dynamic Reporting:** Generate detailed daily summaries and monthly financial reports with percentage breakdowns.
- **Security-First Design:** Databases are isolated from the public internet. Access is strictly managed via SSH Tunneling on AWS EC2.
- **Automated CI/CD:** Zero-downtime deployment pipeline utilizing GitHub Actions and Docker image pruning.

---

## 📂 Project Structure

```text
.
├── src/                # NestJS backend source code
├── prisma/             # Database schema and migrations
├── .github/workflows/  # CI/CD automation pipelines
├── docker-compose.dev.yml   # Development environment (Hot-reload enabled)
├── docker-compose.prod.yml  # Production environment (Security-first)
├── Dockerfile          # Multi-stage build configuration
└── README.md
```

---

## 🚀 Getting Started (How to Run Locally)

Follow these instructions to set up and run the project on your local machine for development and testing.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed.
- [Node.js](https://nodejs.org/) (v18 or higher) installed locally.
- A Telegram Bot Token (Get one by chatting with [@BotFather](https://t.me/botfather) on Telegram).

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/pfm-bot.git](https://github.com/yourusername/pfm-bot.git)
cd pfm-bot
```

### 2. Environment Configuration
Create a `.env` file in the root directory and configure your environment variables. You can use the following template:

```env
# --- DATABASE CONFIG ---
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=pfm_database

# Prisma Database URL (uses 'db' as the host matching the Docker service name)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"

# --- TELEGRAM CONFIG ---
TELEGRAF_TOKEN=your_telegram_bot_token_here
MY_CHAT_ID=your_personal_chat_id

# --- REDIS CONFIG ---
REDIS_HOST=redis
REDIS_PORT=6379
```

> ⚠️ **IMPORTANT NOTE:** Make sure to find `MY_CHAT_ID` in the `.env` file (and anywhere else it might be hardcoded in the source code) and replace it with your actual Telegram `chat_id`. This ensures that specific administrative alerts, daily reminders, and restricted reports are sent directly to your personal Telegram account.

### 3. Start the Development Environment
We use a dedicated Docker Compose file for development (`docker-compose.dev.yml`) which maps ports to your localhost for easy debugging.

```bash
# Build and start the containers in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### 4. Apply Database Migrations
Once the database container is running, push the Prisma schema to initialize your database tables:

```bash
# Run Prisma migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database GUI at http://localhost:5555
npx prisma studio
```

*To stop the local environment cleanly:*
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🌍 Production Deployment (AWS EC2)

This repository is configured with a fully automated CI/CD pipeline. 

### Deployment Workflow:
1. **Push to Branch:** Pushing code to the designated deployment branch triggers GitHub Actions.
2. **Build & Push:** The runner builds a multi-stage, highly optimized Docker image and pushes it to Docker Hub.
3. **Server Update:** The pipeline SSHs into the AWS EC2 instance, transfers the updated `.env` and `docker-compose.prod.yml` files.
4. **Zero-Downtime Restart:** The server pulls the new image, runs `npx prisma migrate deploy` to safely update the database schema, and restarts the NestJS application container.
5. **Cleanup:** Dangling images are pruned to optimize EC2 storage space.

*Note: In the `docker-compose.prod.yml`, the PostgreSQL port is bound to `127.0.0.1:5432` to ensure the database is not exposed to the public internet. Database management is handled securely via SSH Tunneling.*

---

## 📟 Bot Commands Reference

| Command | Syntax / Example | Description |
| :--- | :--- | :--- |
| `/start` | `/start` | Initializes the user profile and creates default wallets (Cash, Bank, E-Wallet). |
| `/spend` | `/spend 50000 an_uong bank lunch` | Logs an expense. Format: `[Amount] [Category] [Wallet Alias] [Optional Note]`. |
| `/today` | `/today` | Retrieves a chronological list of today's expenses and total spent. |
| `/report` | `/report 5/2026` | Generates a comprehensive monthly report with budget percentage breakdowns and wallet balances. |

---

## 👤 Author

**Vuong Tuan Kiet** - **Role:** Full-stack Developer 
- **Focus:** Backend Architecture, Scalable APIs, Cloud Infrastructure
- **Interests:** High-load Systems, Distributed Systems, AWS Architecture.

---
⭐ *If you find this repository useful, please consider giving it a star!*