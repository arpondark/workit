# WorkIT - Freelance Marketplace Platform

A comprehensive freelance marketplace web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features include skill-based quizzes for freelancers, real-time chat with Socket.IO, job posting and application management, and a full admin panel.

![WorkIT Banner](https://via.placeholder.com/1200x400?text=WorkIT+-+Freelance+Marketplace)

## 🚀 Features

### For Freelancers
- **Skill Assessment Quiz**: Must score ≥7/10 to signup as a freelancer
- **Job Search**: Browse and filter jobs by skill, budget, experience level
- **Apply to Jobs**: Submit proposals with cover letters and budget estimates
- **Track Applications**: Monitor application status (pending/accepted/rejected)
- **Real-time Chat**: Communicate with clients via Socket.IO
- **Profile Management**: Showcase skills, portfolio, and experience

### For Clients
- **Post Jobs**: Create detailed job listings with requirements
- **Manage Applications**: Review, accept, or reject freelancer proposals
- **Track Projects**: Monitor job status and progress
- **Real-time Chat**: Communicate with freelancers
- **Secure Payments**: 1% commission on transactions

### Admin Panel
- **Dashboard**: Overview of platform statistics
- **User Management**: View, suspend, or activate users
- **Job Moderation**: Approve, reject, or remove job listings
- **Skill Management**: CRUD operations for skill categories
- **Quiz Questions**: Manage skill assessment questions
- **Transactions**: View payment history and platform earnings
- **Settings**: Configure commission rates, quiz pass scores

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Real-time**: Socket.IO
- **Frontend**: HTML, CSS, Tailwind CSS, Vanilla JavaScript
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
workit/
├── backend/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Skill.js
│   │   ├── Question.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Transaction.js
│   │   ├── AdminSettings.js
│   │   └── QuizAttempt.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── quiz.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── chat.js
│   │   ├── payments.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   └── admin.js
│   ├── seeds/            # Database seeders
│   │   └── seedData.js
│   └── utils/            # Helper functions
│       └── helpers.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── utils.js      # API helpers, auth, toast
│   │   └── socket.js     # Socket.IO client
│   ├── pages/
│   │   ├── auth/         # Login, signup, quiz pages
│   │   ├── client/       # Client dashboard, jobs
│   │   ├── freelancer/   # Freelancer dashboard, applications
│   │   ├── admin/        # Admin panel pages
│   │   ├── messages.html # Real-time chat
│   │   └── profile.html  # User profile
│   └── index.html        # Landing page
├── .env                  # Environment variables
├── server.js             # Main Express server
├── socket.js             # Socket.IO configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js v14 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workit.git
   cd workit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/workit
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ADMIN_EMAIL=admin@workit.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

### Default Admin Credentials
- **Email**: admin@workit.com
- **Password**: admin123

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/skills` | Get all skills |
| GET | `/api/quiz/questions/:skillId` | Get quiz questions |
| POST | `/api/quiz/submit` | Submit quiz answers |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/:id` | Get job by ID |
| POST | `/api/jobs` | Create job (Client) |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply for job (Freelancer) |
| GET | `/api/applications/job/:jobId` | Get applications for job |
| PUT | `/api/applications/:id/status` | Update application status |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get user's chats |
| POST | `/api/chat` | Create/get chat |
| GET | `/api/chat/:chatId/messages` | Get chat messages |
| POST | `/api/chat/:chatId/messages` | Send message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/status` | Update user status |
| GET | `/api/admin/skills` | Get/Create skills |
| GET | `/api/admin/questions` | Get/Create questions |
| GET | `/api/admin/settings` | Get/Update settings |

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT | - |
| `NODE_ENV` | Environment mode | development |
| `ADMIN_EMAIL` | Default admin email | admin@workit.com |
| `ADMIN_PASSWORD` | Default admin password | admin123 |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet for HTTP headers security
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Protected routes with role-based access

## 📝 Database Seeds

The application automatically seeds:
- 1 Admin user
- 10 Skill categories (Web Development, Mobile Development, etc.)
- 20 Quiz questions (2 per skill)

Seeds run automatically on first server start.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.IO](https://socket.io/) for real-time features
- [MongoDB](https://www.mongodb.com/) for database
- [Express.js](https://expressjs.com/) for backend framework

---

Made with ❤️ for the freelance community
