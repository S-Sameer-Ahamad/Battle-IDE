# Database Setup Guide

## 🚀 Quick Start

Your Battle IDE project is now set up with a **SQLite database** using **Prisma ORM**. Here's everything you need to know:

## 📁 Database Files

- **Database File**: `dev.db` (SQLite file in project root)
- **Schema**: `prisma/schema.prisma`
- **Seed Data**: `prisma/seed.js`
- **Prisma Client**: `lib/prisma.ts`

## 🛠️ Available Commands

```bash
# Generate Prisma client
npm run db:generate

# Create/update database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# View database in browser (Prisma Studio)
npm run db:studio

# Reset database (delete all data and reseed)
npm run db:reset
```

## 📊 Database Schema

### Tables Created:
- **users** - User accounts and profiles
- **problems** - Coding problems for battles
- **matches** - 1v1 and group matches
- **match_participants** - Users in matches
- **submissions** - Code submissions
- **friend_requests** - Friend system
- **messages** - Chat messages
- **notifications** - User notifications

## 🎯 Sample Data

The database is seeded with:
- **3 coding problems** (Two Sum, Add Two Numbers, Longest Substring)
- **5 sample users** (Admin, CodeMaster, AlgoNinja, DataWizard, BugHunter)

## 🔧 API Endpoints

All database operations are available via API routes:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/problems` - Get problems
- `GET /api/problems/[id]` - Get specific problem
- `POST /api/matches` - Create match
- `GET /api/matches` - Get matches
- `GET /api/matches/[id]` - Get specific match
- `POST /api/matches/[id]/join` - Join match
- `POST /api/submissions` - Submit code
- `GET /api/users` - Get users
- `GET /api/users/[id]` - Get specific user
- `GET /api/leaderboard` - Get leaderboard

## 🎮 How to Test

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Register a new account** at `/auth/register`

3. **Login** at `/auth/login`

4. **View the leaderboard** at `/leaderboard`

5. **Check the database** with Prisma Studio:
   ```bash
   npm run db:studio
   ```

## 🔄 Database Management

### View Data
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555`

### Reset Database
```bash
npm run db:reset
```
⚠️ **Warning**: This deletes all data and reseeds with sample data

### Backup Database
Simply copy the `dev.db` file to backup your data.

## 🚀 Production Migration

When ready for production, you can easily migrate to PostgreSQL:

1. **Update `.env`**:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/battleide"
   ```

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migration**:
   ```bash
   npm run db:push
   ```

## 🎯 Next Steps

Your database is ready! You can now:

1. **Test user registration/login**
2. **Create matches and submit code**
3. **View leaderboards**
4. **Add more problems**
5. **Implement real-time features**

## 📝 Notes

- **SQLite** is perfect for development and testing
- **No server setup** required - just a file
- **Easy to backup** and share
- **Fast performance** for local development
- **Easy migration** to PostgreSQL later

Happy coding! 🎉
