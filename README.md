# Automata Theory Learning Platform

<div align="center">

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ◆ AUTOMATA THEORY LEARNING PLATFORM ◆                  ║
║                                                           ║
║     Master Complex Automata with Interactive Simulators   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0.0-13AA52?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

**The Ultimate Interactive Platform for Learning Theory of Computation**

[Live Demo](#demo-preview) • [Documentation](#table-of-contents) • [Get Started](#installation--setup) • [Contribute](#contributing)

</div>

---

## Overview

Welcome to the **Automata Theory Learning Platform** — a revolutionary, interactive e-learning solution designed to demystify Theory of Computation. Whether you're a student struggling with DFAs, an instructor seeking engaging teaching tools, or an admin managing a learning ecosystem, this platform delivers an immersive, hands-on experience that transforms abstract concepts into visual, tangible simulations.

### Why This Platform?

- **14 Interactive Playgrounds** for visualizing and simulating automata in real-time
- **AI-Powered Chatbot** to answer TOC questions on-demand
- **Gamified Learning** with daily/weekly challenges and leaderboards
- **Multi-Role Support** for students, instructors, and administrators
- **Comprehensive Resource Library** with notes, GATE papers, and video tutorials
- **Real-Time Engagement Tracking** and personalized learning analytics
- **Mobile-Responsive Design** with dark mode support

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo & Preview](#demo--preview)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints-overview)
- [Screenshots](#screenshots)
- [Key Concepts](#key-concepts-explained)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## Features

### Interactive Playgrounds (14 Simulators)

Transform theory into practice with visual, step-by-step automata simulators:

- **Finite Automata**
  - ◆ DFA (Deterministic Finite Automaton) Simulator
  - ◆ NFA (Nondeterministic Finite Automaton) Simulator
  - ◆ Regex to DFA Converter
  - ◆ NFA to DFA Conversion Tool
  - ◆ DFA to NFA Converter

- **Advanced Automata**
  - ◆ Pushdown Automaton (PDA) Simulator
  - ◆ Turing Machine Simulator
  - ◆ Context-Free Grammar (CFG) Parser
  - ◆ Chomsky Hierarchy Visualizer
  - ◆ Pumping Lemma Demonstrator

- **Sequential Machines**
  - ◆ Mealy Machine Simulator
  - ◆ Moore Machine Simulator
  - ◆ Mealy to Moore Converter
  - ◆ Moore to Mealy Converter

### Learning Management System

- **Structured Curriculum**: Browse subjects with lessons, topics, and learning objectives
- **Smart Subject Organization**: Auto-generated subject hierarchies with instructor control
- **Progress Tracking**: Monitor lesson completion and concept mastery
- **Video Integration**: YouTube embedding for tutorial videos and concept explanations

### Practice & Assessment

- **Challenge System**: Daily and weekly challenges with varying difficulty levels
- **Instant Feedback**: Detailed explanations for correct and incorrect answers
- **Leaderboards**: Competitive rankings by challenge, subject, and overall performance
- **Performance Analytics**: Track success rates, attempt history, and improvements over time

### Resource Library

- **Notes & Papers**: Download comprehensive study notes and GATE examination papers
- **Video Resources**: Access curated video tutorials from expert instructors
- **External Links**: Supplementary resources and reference materials
- **Engagement Metrics**: Track views, downloads, and clicks for popularity insights

### AI-Powered Chatbot

- **24/7 Assistance**: Context-aware chatbot for Theory of Computation questions
- **Conversation History**: Persistent chat memory for continuous learning
- **User-Specific Personalization**: Tailored responses based on user learning context
- **Quick Answers**: Instant responses to common TOC concepts

### Multi-Role Architecture

| Role | Capabilities |
|------|--------------|
| **Student** | Learn, practice challenges, access playgrounds, track progress, interact with chatbot |
| **Instructor** | Create content, manage challenges, upload resources, monitor student progress, customize curriculum |
| **Admin** | Full system control, user management, analytics, resource oversight, security management |

### Additional Features

- **Authentication & Security**: Secure JWT-based authentication with bcrypt password hashing
- **Real-Time Engagement Tracking**: Automatic metrics for downloads, views, and interactions
- **Dark Mode**: Eye-friendly interface for extended learning sessions
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **User Profiles**: Customizable avatars, progress badges, and achievement tracking

---

## Tech Stack

### Frontend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework & Component Architecture | 19.1.1 |
| **Vite** | Lightning-fast build tool & dev server | 7.1.2 |
| **React Router** | Client-side routing & navigation | 7.9.4 |
| **TailwindCSS** | Utility-first CSS styling | 4.1.12 |
| **Cytoscape.js** | Graph visualization for automata states | 3.33.1 |
| **D3.js** | Advanced data visualization & animations | 7.9.0 |
| **Chart.js** | Interactive analytics & performance charts | 4.5.1 |
| **Lucide React** | Modern icon library | 0.540.0 |
| **Axios** | HTTP client for API communication | 1.12.2 |
| **React Spring** | Smooth animations & transitions | 10.0.1 |
| **React YouTube** | YouTube video embedding | 10.1.0 |

### Backend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime environment | 16+ |
| **Express.js** | Web framework for REST API | 4.18.2 |
| **MongoDB** | NoSQL database | 8.0.0 |
| **Mongoose** | MongoDB object modeling | 8.0.0 |
| **JWT (jsonwebtoken)** | Secure authentication tokens | 9.0.2 |
| **Bcryptjs** | Password hashing & security | 2.4.3 |
| **Multer** | File upload handling | 2.0.2 |
| **Cloudinary** | Cloud storage for PDFs & media | 2.7.0 |
| **CORS** | Cross-origin resource sharing | 2.8.5 |
| **Express Validator** | Input validation & sanitization | 7.0.1 |

### Infrastructure & Data

- **Supabase**: Optional cloud database integration for scalability
- **Cloudinary**: Cloud storage for learning resources and documents
- **MongoDB Atlas**: Production-grade cloud database hosting (recommended)

### Development Tools

- **ESLint**: Code quality & consistency
- **Nodemon**: Development server auto-reload
- **PostCSS**: CSS preprocessing
- **Autoprefixer**: Browser compatibility

---

## Demo & Preview

### Live Demo

🚀 **[Visit the Live Platform](https://automata-learning.example.com)** *(Replace with actual deployment URL)*

### User Access Examples

```
👤 Student Credentials
Email: student@example.com
Password: password123
Role: Student (Full learning & challenge access)

👨‍🏫 Instructor Credentials
Email: instructor@example.com
Password: password123
Role: Instructor (Content creation & management)

🔐 Admin Credentials
Email: admin@example.com
Password: password123
Role: Admin (System administration)
```

### Feature Showcase

- **Student Dashboard**: View your progress, active challenges, and personalized recommendations
- **Interactive Playgrounds**: Build automata from scratch, step through simulations, and visualize state transitions
- **Challenge Interface**: Solve multiple-choice problems with instant feedback and detailed explanations
- **Resource Library**: Browse, search, and download learning materials organized by topic
- **Admin Analytics**: Monitor platform metrics, user engagement, and system health in real-time

---

## Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
✓ Node.js (v16 or higher)
✓ npm (v8 or higher)
✓ MongoDB (v4.4 or higher) - Local or MongoDB Atlas
✓ Git
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/automata-learning-platform.git
cd automata-learning-platform
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/automata-simulator
JWT_SECRET=your_secure_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
EOF

# Start MongoDB (if running locally)
# Windows: MongoDB runs as service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start the backend server
npm start
# Or for development with auto-reload:
npm run dev
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file with Supabase credentials (optional)
cat > .env << EOF
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
EOF

# Start the development server
npm run dev
# Frontend will be available at http://localhost:5173
```

### Step 4: Verify Installation

```bash
# Test backend API health
curl http://localhost:5000/api/health
# Expected response: { "success": true, "message": "Server is running" }

# Frontend should be accessible at http://localhost:5173
```

### Environment Variables Reference

**Backend (.env)**
```
PORT=5000                           # Backend server port
MONGODB_URI=mongodb://...          # MongoDB connection string
JWT_SECRET=your_secret_key         # For signing JWT tokens (use strong value)
JWT_EXPIRE=7d                      # JWT token expiration
NODE_ENV=development               # Environment (development/production)
CLOUDINARY_NAME=cloudinary_name    # Cloudinary account name
CLOUDINARY_API_KEY=api_key         # Cloudinary API key
CLOUDINARY_API_SECRET=api_secret   # Cloudinary API secret
CLIENT_URL=http://localhost:5173   # Frontend URL for CORS
```

**Frontend (.env)**
```
VITE_SUPABASE_URL=https://...             # Optional Supabase URL
VITE_SUPABASE_ANON_KEY=...                # Optional Supabase key
```

### Quick Start with Docker (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access services:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

---

## Project Structure

```
automata-learning-platform/
│
├── frontend/                          # React + Vite frontend application
│   ├── public/                        # Static assets & images
│   │   ├── logo.png
│   │   └── photo.jpg
│   ├── src/
│   │   ├── pages/                     # Route pages
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Login.jsx              # Authentication
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Students/              # Student role pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Learning.jsx
│   │   │   │   ├── Library.jsx
│   │   │   │   ├── Practice.jsx
│   │   │   │   ├── TakeChallenge.jsx
│   │   │   │   ├── ChallengeResults.jsx
│   │   │   │   └── Leaderboard.jsx
│   │   │   ├── Playgrounds/           # Interactive simulators
│   │   │   │   ├── DFAPlayground.jsx
│   │   │   │   ├── NFAPlayground.jsx
│   │   │   │   ├── PDAPlayground.jsx
│   │   │   │   ├── TuringMachinePlayground.jsx
│   │   │   │   ├── CFGPlayground.jsx
│   │   │   │   ├── MealyMachinePlayground.jsx
│   │   │   │   └── [9 more playground files]
│   │   │   ├── admin/                 # Admin role pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── ChallengeManagement.jsx
│   │   │   │   ├── LibraryManagement.jsx
│   │   │   │   └── Statistics.jsx
│   │   │   └── Instructor/            # Instructor role pages
│   │   │       ├── InstructorDashboard.jsx
│   │   │       ├── ChallengeManagement.jsx
│   │   │       └── LearningContentManagement.jsx
│   │   ├── components/                # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── StudentLayout.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── PlaygroundLayout.jsx
│   │   │   ├── ChatbotWindow.jsx
│   │   │   ├── VisualizationPanel.jsx
│   │   │   └── [15+ more components]
│   │   ├── contexts/                  # React context providers
│   │   │   ├── AuthContext.jsx        # Authentication state
│   │   │   └── ThemeContext.jsx       # Dark mode state
│   │   ├── api/                       # API service functions
│   │   │   ├── lessonService.js
│   │   │   ├── challengeService.js
│   │   │   ├── resourceService.js
│   │   │   ├── subjectService.js
│   │   │   ├── faqService.js
│   │   │   └── chatbotService.js
│   │   ├── utils/                     # Utility functions
│   │   │   ├── automataUtils.js       # DFA/NFA simulation logic
│   │   │   ├── visualizationUtils.js  # Graph rendering
│   │   │   └── youtubeUtils.js
│   │   ├── App.jsx                    # Main app component with routing
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── vite.config.js                 # Vite configuration
│   ├── package.json                   # Frontend dependencies
│   └── README.md
│
├── backend/                           # Express.js backend API
│   ├── config/
│   │   ├── db.js                      # MongoDB connection setup
│   │   └── cloudinary.js              # Cloudinary configuration
│   ├── controllers/                   # Business logic handlers
│   │   ├── authController.js          # Login/Register/Token
│   │   ├── lessonController.js
│   │   ├── challengeController.js
│   │   ├── resourceController.js
│   │   ├── subjectController.js
│   │   └── faqController.js
│   ├── models/                        # Database schemas (MongoDB)
│   │   ├── User.js                    # User accounts & roles
│   │   ├── Challenge.js               # Challenge questions & metadata
│   │   ├── ChallengeSubmission.js      # Student attempt records
│   │   ├── Lesson.js                  # Learning content
│   │   ├── Subject.js                 # Course subjects
│   │   ├── Resource.js                # Learning materials
│   │   └── FAQ.js                     # FAQs
│   ├── routes/                        # API endpoint definitions
│   │   ├── auth.js
│   │   ├── challenges.js
│   │   ├── resources.js
│   │   ├── subjects.js
│   │   ├── lessons.js
│   │   └── faqs.js
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification middleware
│   │   └── upload.js                  # Multer file upload setup
│   ├── utils/
│   │   └── avatarGenerator.js         # Generate user avatars
│   ├── scripts/
│   │   └── seedSubjects.js            # Database seeding
│   ├── server.js                      # Express app initialization
│   ├── package.json                   # Backend dependencies
│   └── README.md
│
├── .env                               # Environment variables
├── package-lock.json
└── README.md                          # This file
```

---

## Usage

### For Students

**Step 1: Register & Login**
```bash
1. Visit http://localhost:5173
2. Click "Register" and create account
3. Login with your credentials
4. You'll be redirected to Student Dashboard
```

**Step 2: Explore Learning Resources**
```bash
Dashboard → Learning
- Browse available subjects (DFA, NFA, Turing Machines, etc.)
- Click on subject to view lessons
- Read lesson content and watch embedded videos
- Track your progress with lesson checkpoints
```

**Step 3: Practice with Interactive Playgrounds**
```bash
Dashboard → Playgrounds
- Select a playground (e.g., "DFA Simulator")
- Define states, alphabet, and transitions
- Input test strings and see real-time visualization
- Step through execution or run in animation mode
- Download or print results for study notes
```

**Step 4: Practice with Challenges**
```bash
Dashboard → Practice
- Browse daily and weekly challenges
- Select challenge and read description
- Answer multiple-choice questions
- Get instant feedback with explanations
- View performance analytics and leaderboard rankings
```

**Step 5: Access Learning Library**
```bash
Dashboard → Library
- Download notes and GATE papers by topic
- Watch video tutorials
- Access external learning resources
- Track engagement metrics
```

### For Instructors

**Create Learning Content**
```bash
Instructor → Learning Content Management
1. Create new subjects with descriptions
2. Add lessons with objectives and content
3. Embed YouTube videos for explanations
4. Set learning paths and prerequisites
```

**Manage Challenges**
```bash
Instructor → Challenge Management
1. Create daily/weekly challenges
2. Define questions with multiple options
3. Set difficulty levels and point values
4. Publish or save as draft
5. Monitor student attempts and performance
```

**Upload Resources**
```bash
Instructor → Library Management
1. Upload PDF notes and GATE papers
2. Add video links and external resources
3. Organize by category and difficulty
4. Track engagement and downloads
```

### For Administrators

**System Administration**
```bash
Admin → Dashboard
- Monitor overall platform metrics
- Track user registration trends
- View system health and performance
```

**User Management**
```bash
Admin → User Management
- View all registered users
- Promote users to instructor or admin roles
- Manage user accounts and reset passwords
```

**Content Oversight**
```bash
Admin → Library & Challenge Management
- Review and approve instructor-created content
- Manage resource publication status
- Monitor engagement metrics
```

---

## API Endpoints Overview

### Authentication

```
POST   /api/auth/register       - Create new user account
POST   /api/auth/login          - Authenticate user & receive JWT
POST   /api/auth/logout         - Invalidate session
GET    /api/auth/me             - Get current authenticated user
PUT    /api/auth/profile        - Update user profile
```

### Subjects & Learning

```
GET    /api/subjects            - List all subjects
GET    /api/subjects/:id        - Get subject details
POST   /api/subjects            - Create subject (Instructor/Admin)
PUT    /api/subjects/:id        - Update subject
DELETE /api/subjects/:id        - Delete subject

GET    /api/lessons             - List lessons
GET    /api/lessons/:id         - Get lesson content
POST   /api/lessons             - Create lesson (Instructor/Admin)
```

### Challenges

```
GET    /api/challenges          - List all challenges
GET    /api/challenges/:id      - Get challenge questions
POST   /api/challenges          - Create challenge (Instructor/Admin)
POST   /api/challenges/:id/submit - Submit challenge attempt
GET    /api/challenges/:id/leaderboard - Get challenge rankings
```

### Resources (Library)

```
GET    /api/resources           - List library resources
GET    /api/resources/:id       - Get resource details
POST   /api/resources           - Upload resource (Instructor/Admin)
GET    /api/resources/:id/download - Get download URL
DELETE /api/resources/:id       - Delete resource
```

### Health & System

```
GET    /api/health              - Server status check
```

---

## Screenshots

*Add screenshots here showing key features. Replace `[screenshot_url]` with actual image paths or URLs:*

### Student Dashboard
![Student Dashboard](./frontend/public/screenshots/dashboard.png)

### DFA Playground Simulator
![DFA Playground](./frontend/public/screenshots/dfa-playground.png)

### Challenge Interface
![Challenge Interface](./frontend/public/screenshots/challenge.png)

### Resource Library
![Resource Library](./frontend/public/screenshots/library.png)

### Admin Statistics
![Admin Analytics](./frontend/public/screenshots/admin-stats.png)

---

## Key Concepts Explained

### What is Theory of Computation?

Theory of Computation is the mathematical study of computation, focusing on what problems can be solved using computers and the resources required to solve them. It covers:

- **Automata Theory**: Models of computation (DFA, NFA, PDA, Turing Machines)
- **Formal Languages**: Properties and classifications of languages
- **Computability**: What problems are solvable and what aren't
- **Complexity**: How efficiently problems can be solved

### Interactive Simulators

This platform provides visual simulations that help you understand:

1. **State Transitions**: Watch how automata move between states
2. **Input Processing**: See how strings are accepted or rejected
3. **Conversions**: Understand transformations between automata types
4. **Visualization**: Graph representations of complex state machines

### Learning Path

```
Start Here
    ↓
Learn Fundamentals (DFA, NFA)
    ↓
Practice with Playgrounds
    ↓
Take Challenges
    ↓
Advance to Complex Topics (PDA, Turing)
    ↓
Master Advanced Conversions
    ↓
Achieve Proficiency!
```

---

## Contributing

We welcome contributions from students, educators, and developers! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/automata-learning-platform.git
   cd automata-learning-platform
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Make your changes**
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Test your changes thoroughly

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add descriptive commit message"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes and why they're needed
   - Link any related issues

### What We're Looking For

- **Bug Fixes**: Found a bug? Report it or submit a fix
- **New Playgrounds**: Contribute simulators for new automata types
- **UI/UX Improvements**: Enhance the user interface and experience
- **Documentation**: Help improve guides and tutorials
- **Accessibility**: Make the platform more inclusive
- **Performance**: Optimize code and database queries
- **Tests**: Add unit and integration tests

### Code Style Guidelines

- **Frontend**: Follow React best practices, use functional components with hooks
- **Backend**: Use ES6+ syntax, maintain consistent naming conventions
- **Comments**: Add meaningful comments for non-obvious code sections
- **Variables**: Use descriptive names (avoid single letters except for loops)

### Branch Naming

```
feature/feature-name          - New features
fix/bug-description           - Bug fixes
docs/documentation-update     - Documentation updates
refactor/component-name       - Code refactoring
test/test-description         - Tests and test improvements
```

### Commit Message Format

```
[Type]: Brief description (50 chars max)

Optional detailed description explaining the why and what.
- Use bullet points for multiple changes
- Reference issue numbers with # (e.g., "Fixes #123")
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting, missing semicolons, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `perf:` Performance improvements

### Issue Reporting

Found a problem? Open an issue:

1. **Check existing issues** to avoid duplicates
2. **Use clear titles**: "Login not working for instructors" instead of "Bug"
3. **Provide steps to reproduce** the issue
4. **Include screenshots** if applicable
5. **List your environment**: Browser, OS, Node version, etc.

### Community Guidelines

- Be respectful and inclusive to all contributors
- Provide constructive feedback on PRs
- Help other developers with questions
- Share knowledge and best practices
- Report security vulnerabilities privately

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Summary

You are free to:
- Use this project commercially or privately
- Modify and distribute the code
- Include it in proprietary applications

With the conditions:
- Include a copy of the license
- Include copyright notice
- State changes made to the code

---

## Acknowledgements

### Built With

We're grateful to the incredible open-source community:

- **React Team** - For the powerful UI framework
- **Cytoscape.js** - For amazing graph visualization capabilities
- **D3.js** - For interactive data visualization
- **MongoDB** - For reliable NoSQL database
- **Express.js** - For the robust web framework
- **Tailwind CSS** - For utility-first styling
- **Vite Team** - For lightning-fast development experience

### Contributors

Special thanks to everyone who has contributed to this project:
- Bug reporters and feature requesters
- Code contributors and reviewers
- Documentation writers
- Educators and students who shaped the platform

### Inspiration

This platform was inspired by the need to make Theory of Computation more accessible and interactive. We believe visual learning combined with hands-on practice creates the best understanding of complex concepts.

---

## Contact & Support

### Developer

**Your Name / Team Name**

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)
- **LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

### Get Help

- **Documentation**: Check the [docs](./docs) folder
- **Issues**: [Report bugs on GitHub](https://github.com/yourusername/automata-learning-platform/issues)
- **Discussions**: [Join community discussions](https://github.com/yourusername/automata-learning-platform/discussions)
- **Email Support**: Send questions to your.email@example.com

### Connect With Us

- **Twitter**: [@handle](https://twitter.com/handle)
- **Discord**: [Join our community server]
- **Blog**: [Read our articles](#)

---

<div align="center">

---

## Show Your Support

If you found this platform helpful, consider:

- ⭐ **Starring the repository** on GitHub
- 📢 **Sharing** with friends and colleagues
- 🐛 **Reporting issues** you encounter
- 💡 **Contributing** improvements and features
- 💬 **Providing feedback** for enhancements

---

### Made with ❤️ for Theory of Computation Learners

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  Build automata. Master complexity. Change the way    ║
║  the world learns Theory of Computation.              ║
║                                                        ║
║  Together, we make learning better. Together.         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**[↑ Back to Top](#automata-theory-learning-platform)**

---

*Last Updated: November 2024*

*This project is maintained with love by developers passionate about education and computer science.*

</div>
