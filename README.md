<<<<<<< HEAD
# Store Rating Management System

Full-stack implementation of Store Rating Management System

## Stack
- React + Vite
- Node.js + Express
- PostgreSQL + Prisma
- JWT authentication + bcrypt password hashing

## Requirements
- Node.js 20+
- PostgreSQL 14+
- npm

## 1. Configure PostgreSQL
Create a database named `rating_store`.

## 2. Update Backend .env
Replace database password `Your_Password`

## 3. Backend setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Seeded demo accounts (password for all: `DemoPass!1`):
- Admin: `admin@gmail.com`
- Store owner1: `owner1@gmail.com`
- Store owner2: `owner2@gmail.com`
- Normal user: `user@gmail.com`

## 4. Frontend setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, usually http://localhost:5173/

## 5. Important implementation notes
- Public registration always creates a NORMAL USER; users cannot choose ADMIN or STORE_OWNER themselves.
- Admins can create users with roles and create stores linked to a store-owner account.
- Admin can add multiple Normal User, Store Owner and Administrator from `Manage users` section.
- A database unique constraint on `(userId, storeId)` ensures one rating per user/store. Submitting again updates the existing rating.
- Store averages are calculated from ratings, not stored as stale values.
- Server-side role checks protect admin and owner routes.
- The name rule (20–60 characters) follows the assessment. It is applied to user names.
- Owner-account creation is an implementation choice.
=======
# Store-Rating-System
Full Stack Store Rating Management System using React, Node.js, Express, PostgreSQL and Prisma.
>>>>>>> d3eb90d09e96d44df0f728bc9236a13bd028a440
