# Contributing to RefearnApp 🚀

First off, thank you for considering contributing to RefearnApp! It’s people like you who make open-source tools great.

Whether you're fixing a typo, squashing a bug, or proposing a massive new feature, your time and interest are deeply appreciated.

---

## 💬 Connect & Self-Host

Before you start coding, we highly recommend checking our documentation. It contains the full guide for **Self-Hosting** RefearnApp if you wish to run a production-like instance. If you run into issues during setup, our Discord community is the best place to ask for help.

<p align="center">
  <a href="https://refearnapp.com/docs">Explore the Docs (Self-Hosting Guide) »</a> | 
  <a href="https://discord.gg/fHw9j7P3w9">Discord Support</a>
</p>

1. **GitHub Issues:** Best for bug reports and formal feature proposals.
2. **Discord:** Best for quick questions and real-time brainstorming.

---

## 🛠 Local Development Setup

RefearnApp uses a modern monorepo stack: **Next.js**, **Cloudflare Workers**, **Drizzle ORM**, and **pnpm workspaces**.

### Prerequisites

1. Node.js (LTS)
2. pnpm (Package Manager)
3. Bun (Required for database scripts)
4. PostgreSQL (Local or hosted)

---

### 1. Getting Started

    git clone https://github.com/YOUR_USERNAME/refearnapp.git
    cd refearnapp
    pnpm install

---

### 2. Environment Variables

Next.js reads from the local package environment.

#### Step 1: Copy template

    cp .env.example ./apps/dashboard/.env

#### Step 2: Configure variables

Open:

    ./apps/dashboard/.env

Fill in all required variables (see docs for details).

---

### 3. Database Management

#### Step 1: Navigate to dashboard

    cd apps/dashboard

#### Step 2: Reset & Sync database

    bun src/db/reset.ts

    # If you reset, delete migrations folder to avoid conflicts
    pnpm exec drizzle-kit generate
    pnpm exec drizzle-kit migrate

#### Step 3: Initialize core data

    bun src/db/seedSystem.ts
    bun src/db/currencySeed.ts

#### Step 4: Seed demo data

    bun src/db/seeds/seedFun1.ts

---

### 4. Running the Application

#### Step 1: Return to root

    cd ../..

#### Step 2: Run everything

    pnpm dev

#### Step 3: Run dashboard only (recommended)

    pnpm local:dev

    # equivalent to:
    pnpm dev --filter @repo/dashboard

#### Step 4: Run specific services

    # Landing Page
    pnpm dev --filter @repo/landing-page

    # Tracking Worker
    pnpm dev --filter @repo/tracking-worker

---

### 📏 Contribution Rules

1. 🚫 **No Automated AI Contributions**  
   Pull Requests generated primarily by AI tools are not accepted.

2. **Large Changes**  
   Discuss via GitHub Issues or Discord first.

3. **Small Changes**  
   Docs, typos, minor fixes → PR directly.

---

### 🚀 How to Submit Your Changes

1. Create a branch  
   `git checkout -b feature/amazing-feature`

2. Commit changes  
   `git commit -m "feat: add email notifications"`

3. Push  
   `git push origin feature/amazing-feature`

4. Open a Pull Request  
   Explain clearly what you changed and why.

---

### 📖 Types of Contributions

1. **Code:** Features, bug fixes, performance
2. **Documentation:** Improve docs or README
3. **Feedback:** Issues, ideas, integrations

---

<p align="center">
  <strong>Built with ❤️ by the RefearnApp Community.</strong>
</p>