# Automata Simulator Backend

This is the backend server for the Automata Simulator application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure MongoDB**

   Make sure MongoDB is installed and running on your system.

   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow instructions at https://docs.mongodb.com/manual/installation/

   Start MongoDB:
   - **Windows**: MongoDB service starts automatically
   - **macOS/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

3. **Environment Variables**

   The `.env` file is already configured with default values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/automata-simulator
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   **IMPORTANT**: Change `JWT_SECRET` to a secure random string in production.

4. **Run the Server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)

### Health Check

- `GET /api/health` - Check if server is running

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Project Structure

```
server/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   └── User.js            # User model
├── routes/
│   └── auth.js            # Authentication routes
├── .env                   # Environment variables
├── server.js              # Express server setup
└── package.json           # Dependencies
```

## User Roles

- `user` - Default role for new users
- `instructor` - Can create and manage learning content
- `admin` - Full access to all features

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation with express-validator
- CORS protection
- Secure headers

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoDB connection error", make sure:
1. MongoDB is installed and running
2. The connection string in `.env` is correct
3. The database port (27017) is not blocked

### Port Already in Use

If port 5000 is already in use, change the `PORT` in `.env` file.
