# Flowcent Development Setup Guide

## ✅ Completed So Far

1. **Next.js Project Created** - TypeScript, Tailwind CSS, App Router
2. **Dependencies Installed**:
   - Prisma ORM for database
   - Shadcn/ui components (button, input, card, table, badge, dialog, form, etc.)
   - Authentication libraries (bcryptjs, jsonwebtoken)
   - Form validation (zod, react-hook-form)
3. **Database Schema Created** - User, Client, Invoice, Promise, FollowUp models
4. **Utility Files Ready** - Prisma client, auth helpers, password hashing

---

## 🎯 Next Step: Database Connection

Aapko ab ek **database** setup karna hai. Do options hain:

### Option A: Supabase (Recommended for MVP) ⭐

**Kyon choose karein:**
- Completely FREE for development
- Setup 5 minutes mein ho jayega
- No local installation needed
- Production-ready
- 500MB storage free

**Setup Steps:**
1. [Supabase.com](https://supabase.com) par jaakar free account banayein
2. "New Project" click karein
3. Project name: `flowcent-dev`
4. Database password set karein (yaad rakhein!)
5. Region select karein: `South East Asia (Singapore)` recommended for India
6. Wait 2-3 minutes for database setup
7. Project Settings → Database → Connection String copy karein
8. Paste karein `.env` file mein

### Option B: Local PostgreSQL

**Kyon choose karein:**
- Full control over data
- Works offline
- No external dependencies

**Setup Steps:**
1. PostgreSQL download karein: [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install karein (default settings OK)
3. Password set karein during installation
4. Database create karein: `flowcent`

---

## 🔧 Environment Variables

**After database setup**, create `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

Then update `DATABASE_URL` in `.env` with your connection string:

**For Supabase:**
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].pooler.supabase.com:5432/postgres"
```

**For Local:**
```
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/flowcent"
```

---

## 🚀 Run Migrations (After Database Setup)

```bash
cd flowcent-app
npx prisma generate
npx prisma migrate dev --name init
```

This will create all tables in your database.

---

## ▶️ Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
flowcent-app/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/                   # Next.js pages and API routes
│   ├── components/
│   │   └── ui/                # Shadcn components
│   └── lib/
│       ├── prisma.ts          # Database client
│       ├── auth.ts            # JWT authentication
│       └── password.ts        # Password hashing
├── .env                       # Environment variables (create this!)
└── .env.example               # Template
```

---

## ❓ Kya Database Ready Hai?

Once you've set up the database (Supabase ya Local), mujhe batayein:

**"Database ready hai"** - then I'll run the migrations and start building features!

**"Help chahiye"** - I'll guide you step-by-step through Supabase setup

**"Local PostgreSQL use karna hai"** - I'll help with local setup

Let me know when ready! 🚀
