# Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB installed and running

## 1. Start MongoDB

**Windows**: MongoDB service runs automatically
**macOS**: `brew services start mongodb-community`
**Linux**: `sudo systemctl start mongod`

## 2. Start Backend Server

```bash
cd server
npm install
npm run dev
```

Backend runs at: http://localhost:5000

## 3. Start Frontend (New Terminal)

```bash
# From project root
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## 4. Use the Application

1. Open http://localhost:5173 in your browser
2. Click "Login" → "Sign up" to create an account
3. Fill in your details and register
4. You'll be automatically logged in

## Theme Toggle

Click the sun/moon icon in the navbar to switch between light and dark themes. The app automatically detects your system theme preference on first load.

## Default Credentials

Create your own account via the registration page. The first user you create will have the default "user" role.

---

For detailed setup instructions, see [SETUP.md](./SETUP.md)
