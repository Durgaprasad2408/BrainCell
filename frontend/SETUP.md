# Automata Simulator - MERN Stack Setup Guide

This project is a full-stack MERN (MongoDB, Express, React, Node.js) application for simulating various automata and formal languages.

## Features

- JWT-based authentication
- Dark/Light theme support (system preference detection)
- User roles (User, Instructor, Admin)
- Secure password hashing
- Responsive design
- Various automata simulators (DFA, NFA, PDA, Turing Machine, etc.)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Project Structure

```
project/
├── server/              # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── src/                 # Frontend (React + Vite)
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── utils/
│   └── App.jsx
├── package.json         # Frontend dependencies
└── .env                 # Frontend environment variables
```

## Setup Instructions

### 1. Install MongoDB

#### Windows
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB Compass (GUI) will be installed automatically
4. MongoDB service starts automatically

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# The .env file is already configured with:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/automata-simulator
# JWT_SECRET=your_jwt_secret_key_change_this_in_production
# JWT_EXPIRE=7d
# NODE_ENV=development

# IMPORTANT: Change JWT_SECRET before deploying to production!

# Start the backend server
npm start

# Or for development with auto-reload
npm run dev
```

The backend server will start at `http://localhost:5000`

### 3. Setup Frontend

Open a new terminal window:

```bash
# Navigate to project root (if you're in server directory)
cd ..

# Install dependencies
npm install

# The .env file is already configured with:
# VITE_API_URL=http://localhost:5000/api

# Start the frontend development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## Running the Application

You need to run both servers simultaneously:

1. **Terminal 1 (Backend)**:
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 (Frontend)**:
   ```bash
   npm run dev
   ```

3. Open your browser and go to `http://localhost:5173`

## Authentication

### Register a New User

1. Click "Login" in the navbar
2. Click "Sign up" link
3. Fill in your details (name, email, password)
4. Click "Sign Up"

### Login

1. Click "Login" in the navbar
2. Enter your email and password
3. Click "Sign In"

### Theme Toggle

- Click the sun/moon icon in the navbar to toggle between light and dark themes
- The default theme is based on your system preference

## User Roles

- **User**: Default role, can access playgrounds and learning materials
- **Instructor**: Can create and manage learning content and challenges
- **Admin**: Full access to all features including user management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)

### Health Check
- `GET /api/health` - Server health check

## Building for Production

### Backend
The backend runs as-is in production. Make sure to:
1. Change `JWT_SECRET` in `.env` to a secure random string
2. Update `MONGODB_URI` to your production database
3. Set `NODE_ENV=production`

### Frontend
```bash
npm run build
```

The build files will be in the `dist` directory.

## Troubleshooting

### MongoDB Connection Issues

**Error**: "MongooseServerSelectionError: connect ECONNREFUSED"

**Solution**:
- Make sure MongoDB is running:
  - Windows: Check Services and ensure MongoDB is running
  - macOS: `brew services list` (should show mongodb-community as started)
  - Linux: `sudo systemctl status mongod`

### Port Already in Use

**Error**: "Port 5000 is already in use"

**Solution**:
- Change the `PORT` in `server/.env` to a different port (e.g., 5001)
- Update `VITE_API_URL` in the root `.env` accordingly

### CORS Issues

If you see CORS errors in the browser console:
- Make sure the backend server is running
- Check that `VITE_API_URL` in `.env` matches your backend URL

### Theme Not Persisting

The theme preference is saved in `localStorage`. If it's not persisting:
- Check browser console for errors
- Clear browser cache and try again

## Development Tips

### Hot Reload
- Frontend: Vite provides instant hot reload
- Backend: Using `nodemon` for auto-restart on file changes

### Database GUI
Use MongoDB Compass (comes with MongoDB installation) to view and manage your database:
- Connection string: `mongodb://localhost:27017`
- Database name: `automata-simulator`

### Testing Authentication
Use tools like Postman or curl to test API endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Security Notes

1. **Never commit sensitive data** to version control
2. **Change JWT_SECRET** before deploying to production
3. **Use environment variables** for all sensitive configuration
4. **Enable HTTPS** in production
5. **Implement rate limiting** for authentication endpoints in production

## Technologies Used

### Frontend
- React 19.1.1
- Vite 7.1.2
- React Router DOM 7.8.1
- Axios for API calls
- Tailwind CSS 4.1.12
- Lucide React (icons)
- D3.js, Cytoscape (visualizations)

### Backend
- Node.js
- Express 4.18.2
- MongoDB with Mongoose 8.0.0
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS enabled

## License

This project is for educational purposes.
