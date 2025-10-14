# 🔐 Authentication Starter Kit

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green.svg)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> A production-ready Node.js authentication backend with JWT, Redis sessions, email integration, and comprehensive security features. Perfect for SaaS applications, e-commerce platforms, and any project requiring secure user authentication.

## 🚀 Quick Start

Get up and running in **3 simple steps**:

```bash
# 1. Clone and install
git clone <your-repo-url>
cd authentication
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start the application
npm run dev
```

**That's it!** Your authentication API is running at `http://localhost:3636`

## ✨ Features

### 🔐 **Complete Authentication System**
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password reset via email
- ✅ User profile management
- ✅ Session management with Redis
- ✅ Token refresh mechanism

### 🛡️ **Enterprise Security**
- ✅ Rate limiting (100 requests/15min)
- ✅ Password hashing with bcrypt
- ✅ JWT access & refresh tokens
- ✅ Secure cookie handling
- ✅ MongoDB injection protection
- ✅ CORS & security headers
- ✅ Input validation & sanitization

### 📧 **Email Integration**
- ✅ Welcome emails for new users
- ✅ Password reset emails
- ✅ Customizable HTML templates
- ✅ Multi-provider support (Gmail, SMTP)

### 🐳 **Production Ready**
- ✅ Docker containerization
- ✅ MongoDB & Redis containers
- ✅ Winston logging
- ✅ Error handling
- ✅ Health monitoring
- ✅ PM2 process management

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Load Balancer │    │   Express API   │
│   (Frontend)    │◄──►│   (Optional)   │◄──►│    Server      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │     Redis       │◄─────────────┤
                       │   (Sessions)    │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │    MongoDB      │◄─────────────┘
                       │   (Database)    │
                       └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** 14+ 
- **MongoDB** (or Docker)
- **Redis** (or Docker)
- **npm** or **yarn**

## 🛠️ Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd authentication

# Install dependencies
npm install
# or
yarn install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB and Redis locally
# MongoDB: mongod
# Redis: redis-server

# Run the application
npm run dev
```

### Option 2: Docker Development

```bash
# Start databases with Docker
docker-compose -f docker.composedb.yaml up -d

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run the application
npm run dev
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
SERVER_PORT=3636

# Database URLs
MONGO_URI=mongodb://localhost:27017/auth_database
REDIS_URL=redis://localhost:6379

# JWT Configuration
ACCESS_TOKEN=your-super-secret-access-token-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRY=7d

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# API Configuration
API_HOST=localhost
```

## 📚 Complete API Documentation

### Authentication Endpoints

#### 🔐 Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "firstname": "John",
  "lastname": "Doe", 
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "user created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "johndoe",
    "firstname": "john",
    "lastname": "doe",
    "email": "john@example.com",
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:00:00.000Z"
  }
}
```

#### 🔑 Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "login successful",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "johndoe",
    "firstname": "john",
    "lastname": "doe",
    "email": "john@example.com"
  }
}
```

#### 🚪 Logout User
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "logout successful"
}
```

#### 🔄 Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 🔐 Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### User Management Endpoints

#### 👤 Update User Profile
```http
PUT /api/updateUser/:userId
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Smith",
  "email": "johnsmith@example.com"
}
```

#### 🔄 Refresh Access Token
```http
POST /api/refresh-token
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Access Token refreshed",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

## 🧪 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3636/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Login user
curl -X POST http://localhost:3636/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'

# Test protected endpoint
curl -X GET http://localhost:3636/api/updateUser/64f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer <your-access-token>"
```

### Using Postman

1. Import the API collection (create from the endpoints above)
2. Set up environment variables:
   - `base_url`: `http://localhost:3636`
   - `access_token`: Your JWT token
3. Test the authentication flow

## 🐳 Docker Setup

### Start Databases
```bash
# Start MongoDB and Redis
docker-compose -f docker.composedb.yaml up -d

# Check running containers
docker ps
```

### Build Application Container
```bash
# Build the application image
docker build -t auth-starter .

# Run the application
docker run -p 3636:3636 --env-file .env auth-starter
```

## 📁 Project Structure

```
src/
├── controller/           # Request handlers
│   └── authController/
│       ├── register.controller.js
│       ├── login.controller.js
│       ├── logout.controller.js
│       ├── updateUser.controller.js
│       ├── forgotPassword.controller.js
│       └── resetPassword.controller.js
├── db/                   # Database configurations
│   ├── db.js            # MongoDB connection
│   ├── redis.js         # Redis connection
│   └── logger.js        # Winston logger
├── middleware/           # Custom middleware
│   ├── auth.middleware.js
│   ├── errorHandelre.js
│   └── rateLimiter.js
├── models/              # Database models
│   ├── users.models.js
│   └── games.models.js
├── routes/              # API routes
│   └── auth.routes.js
├── server/              # Server configuration
│   ├── app.js
│   └── server.js
├── services/            # Business logic
│   └── redis.service.js
├── templates/           # Email templates
│   ├── welcome.html
│   ├── passwordReset.html
│   ├── passwordResetSuccess.html
│   └── styles/
└── utils/               # Utility functions
    ├── ApiError.js
    ├── ApiResponse.js
    ├── asyncHandler.js
    └── emailService.js
```

## 🔧 Development Guide

### Adding New Routes

1. **Create Controller:**
```javascript
// src/controller/newFeature.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const newFeature = asyncHandler(async (req, res) => {
  // Your logic here
  return res.status(200).json(new ApiResponse(200, data, "Success"));
});
```

2. **Add Route:**
```javascript
// src/routes/newFeature.routes.js
import { Router } from "express";
import { newFeature } from "../controller/newFeature.controller.js";

const router = Router();
router.route("/new-feature").get(newFeature);
export { router };
```

3. **Register in App:**
```javascript
// src/server/app.js
import { newFeature_router } from "../routes/newFeature.routes.js";
app.use("/api", newFeature_router);
```

### Adding Custom Middleware

```javascript
// src/middleware/custom.middleware.js
export const customMiddleware = (req, res, next) => {
  // Your middleware logic
  console.log("Custom middleware executed");
  next();
};
```

### Extending User Model

```javascript
// src/models/users.models.js
// Add new fields to schema
const userSchema = new Schema({
  // ... existing fields
  newField: { type: String, default: "" },
  preferences: {
    theme: { type: String, default: "light" },
    notifications: { type: Boolean, default: true }
  }
});
```

## 🛡️ Security Best Practices

### What's Included

- ✅ **Password Security**: bcrypt hashing with 8 rounds
- ✅ **JWT Security**: Short-lived access tokens, long-lived refresh tokens
- ✅ **Cookie Security**: HttpOnly, Secure, SameSite attributes
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **Input Validation**: Comprehensive validation and sanitization
- ✅ **CORS Protection**: Configurable cross-origin policies
- ✅ **Security Headers**: Helmet integration
- ✅ **NoSQL Injection**: MongoDB injection prevention

### Additional Recommendations

```javascript
// Add to your .env for production
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
SECURE_COOKIES=true

// Use HTTPS in production
// Implement additional rate limiting per user
// Add request logging and monitoring
// Regular security audits
```

## 🚀 Production Deployment

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'auth-starter',
    script: 'src/server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3636
    }
  }]
};
```

### Environment Considerations

```bash
# Production environment variables
NODE_ENV=production
SERVER_PORT=3636
MONGO_URI=mongodb://user:pass@host:port/database
REDIS_URL=redis://host:port
CORS_ORIGIN=https://yourdomain.com
```

### Performance Tips

- Use PM2 cluster mode for multiple processes
- Implement Redis clustering for high availability
- Use MongoDB replica sets for data redundancy
- Add CDN for static assets
- Implement caching strategies
- Monitor application metrics

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check if MongoDB is running
mongod --version
# Check connection string in .env
```

**2. Redis Connection Failed**
```bash
# Check if Redis is running
redis-cli ping
# Should return PONG
```

**3. Email Not Sending**
```bash
# Check email credentials in .env
# Verify Gmail app password (not regular password)
# Check firewall/network restrictions
```

**4. JWT Token Issues**
```bash
# Verify JWT secrets in .env
# Check token expiration settings
# Ensure proper cookie configuration
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
tail -f logs/combined.log
tail -f logs/error.log
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Format code
npm run format

# Start development server
npm run dev
```

## 📈 Roadmap

### Phase 1 (Immediate)
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting per user

### Phase 2 (Short-term)
- [ ] Multi-tenant support
- [ ] Advanced session management
- [ ] Audit logging dashboard
- [ ] Password policy configuration

### Phase 3 (Long-term)
- [ ] OAuth 2.0 provider support
- [ ] Advanced analytics
- [ ] Machine learning-based security
- [ ] Microservices architecture

## ❓ FAQ

**Q: Can I use this with any frontend framework?**
A: Yes! This is a backend-only solution that works with React, Vue, Angular, or any frontend framework.

**Q: Is this production-ready?**
A: Yes, this includes enterprise-grade security features, error handling, logging, and monitoring.

**Q: How do I customize the email templates?**
A: Edit the HTML files in `src/templates/` and modify the CSS in `src/templates/styles/`.

**Q: Can I add more user fields?**
A: Yes, extend the User model in `src/models/users.models.js` and update the registration controller.

**Q: How do I deploy to cloud platforms?**
A: Use Docker containers with platforms like AWS, Google Cloud, or DigitalOcean. See the deployment section for details.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Redis](https://redis.io/) - Caching
- [JWT](https://jwt.io/) - Authentication
- [Nodemailer](https://nodemailer.com/) - Email service

---

<div align="center">
  <strong>Made with ❤️ by Ankit Kumar</strong>
  <br>
  <br>
  <a href="#-quick-start">Get Started</a> •
  <a href="#-complete-api-documentation">API Docs</a> •
  <a href="#-contributing">Contribute</a> •
  <a href="#-faq">FAQ</a>
</div>