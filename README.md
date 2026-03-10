# Internal Knowledge Base Management System - Backend

A Node.js/Express backend API for managing knowledge articles with role-based access control and approval workflow.

## Project Overview

This backend system allows contributors to submit knowledge articles and administrators to control publication. Articles must be approved by an admin before they become publicly visible, ensuring quality control.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Environment Variables**: dotenv

## User Roles and Permissions

### CONTRIBUTOR
- Register and log in to the system
- Create knowledge articles
- View own articles and their status (pending/approved/rejected)
- Cannot approve or reject articles

### ADMIN
- Log in to the system (register with admin code)
- Review all submitted articles
- Approve or reject articles for publishing
- View all pending articles

## Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- All API endpoints (except registration and published articles) require authentication
- Role-based access control enforced at middleware level
- Passwords are hashed using bcrypt before storage

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register-contributor` | Public | Register a new contributor |
| POST | `/register-admin` | Public | Register a new admin (requires admin code) |
| POST | `/login` | Public | Login user and receive JWT token |
| POST | `/logout` | Protected | Logout user and clear token |
| GET | `/user` | Protected | Get current user profile |

### Article Routes (`/api/v1/articles`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/published` | Public | Get all approved articles |
| POST | `/` | Contributor | Create a new article (status: pending) |
| GET | `/my-articles` | Contributor | Get own articles with all statuses |
| GET | `/pending` | Admin | Get all pending articles for review |
| PUT | `/:id/approve` | Admin | Approve an article |
| PUT | `/:id/reject` | Admin | Reject an article |
| GET | `/:id` | Protected | Get article by ID (with authorization check) |

## Database Schema

### User Collection

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['contributor', 'admin'], default: 'contributor'),
  createdAt: Date,
  updatedAt: Date
}
```

### Article Collection

```javascript
{
  title: String (required),
  content: String (required),
  author: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd D:\FSDproject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit the `.env` file and update the following:
   ```env
   MONGO_URI=mongodb://localhost:27017/knowledge-base
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   PORT=8080
   ADMIN_CODE=admin123
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

5. **Run the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Verify server is running**
   
   Visit `http://localhost:8080` - you should see:
   ```json
   {"msg": "Knowledge Base API Server is running on port 8080"}
   ```

## Workflow Example

### 1. Register Users

**Register a Contributor:**
```bash
POST /api/v1/auth/register-contributor
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Register an Admin:**
```bash
POST /api/v1/auth/register-admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "adminCode": "admin123"
}
```

### 2. Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create Article (as Contributor)

```bash
POST /api/v1/articles
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a JavaScript runtime..."
}
```

### 4. Approve Article (as Admin)

```bash
PUT /api/v1/articles/<article_id>/approve
Cookie: token=<admin_jwt_token>
```

### 5. View Published Articles

```bash
GET /api/v1/articles/published
```

## Business Rules

**Critical**: Articles must be approved before they can be published or viewed publicly.

- Newly created articles have status `pending`
- Only approved articles are visible via `/api/v1/articles/published`
- Contributors can only view their own articles (all statuses)
- Admins can view all pending articles for review
- Unapproved articles are not visible to other users

## Project Structure

```
D:\FSDproject\
├── Config/              # Configuration files (reserved for future use)
├── Controller/          # Business logic controllers
│   ├── authController.js
│   └── articleController.js
├── DataBase/            # Database connection
│   └── connection.js
├── Middleware/          # Authentication and authorization
│   └── authMiddleware.js
├── Models/              # Mongoose models
│   ├── userModel.js
│   └── articleModel.js
├── Routers/             # API route definitions
│   ├── authRouter.js
│   └── articleRouter.js
├── Utils/               # Helper utilities
│   └── generateToken.js
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── index.js            # Main server file
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Development

- **Nodemon**: Auto-reloads server on file changes
- **ES6 Modules**: Using `import/export` syntax
- **Async/Await**: Modern asynchronous code handling
- **Error Handling**: Comprehensive error responses

## Live Deployment Links

*(To be added after deployment)*

- **Frontend**: TBD
- **Backend**: TBD

## Contributing

This is an assignment project for demonstrating full-stack development skills with focus on:
- Approval workflow enforcement
- Role-based access control
- JWT authentication
- End-to-end execution

## License

ISC
