# High-Level Design Document (HLD)
## Authentication Starter Kit

### Part A: High-Level Architecture

#### System Architecture Overview

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

#### Component Architecture

**1. Express Application Layer**
- **Entry Point**: `src/server/server.js`
- **App Configuration**: `src/server/app.js`
- **Middleware Pipeline**: Security, logging, parsing, routing
- **Error Handling**: Centralized error management

**2. Controller Layer**
- **Authentication Controllers**: `src/controller/authController/`
  - `register.controller.js` - User registration logic
  - `login.controller.js` - Authentication and token generation
  - `logout.controller.js` - Session termination
  - `updateUser.controller.js` - Profile management
  - `forgotPassword.controller.js` - Password reset initiation
  - `resetPassword.controller.js` - Password reset completion

**3. Service Layer**
- **Email Service**: `src/utils/emailService.js`
  - Template-based email system
  - Multi-provider support (Gmail, SMTP)
  - Automated email workflows
- **Redis Service**: `src/services/redis.service.js`
  - Session management
  - Caching layer
  - Data persistence

**4. Data Layer**
- **MongoDB Models**: `src/models/`
  - `users.models.js` - User schema and methods
  - `games.models.js` - Game data model (extensible)
- **Database Configuration**: `src/db/db.js`
- **Redis Configuration**: `src/db/redis.js`

**5. Middleware Layer**
- **Authentication**: `src/middleware/auth.middleware.js`
- **Rate Limiting**: `src/middleware/rateLimiter.js`
- **Error Handling**: `src/middleware/errorHandelre.js`
- **Security**: Helmet, CORS, sanitization

#### Technology Stack

**Runtime & Framework**
- **Node.js**: v14+ JavaScript runtime
- **Express.js**: Web application framework
- **ES Modules**: Modern JavaScript module system

**Database & Storage**
- **MongoDB**: Document-based NoSQL database
- **Mongoose**: MongoDB object modeling
- **Redis**: In-memory data structure store

**Security & Authentication**
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Helmet**: HTTP security headers
- **Express Rate Limit**: Request throttling

**Email & Communication**
- **Nodemailer**: Email service integration
- **HTML Templates**: Customizable email templates

**Development & Deployment**
- **Docker**: Containerization
- **Winston**: Logging framework
- **Morgan**: HTTP request logging
- **PM2**: Process management

#### Design Patterns

**1. MVC (Model-View-Controller)**
- **Models**: Data layer (`src/models/`)
- **Views**: Email templates (`src/templates/`)
- **Controllers**: Business logic (`src/controller/`)

**2. Middleware Pattern**
- **Request Pipeline**: Sequential middleware execution
- **Error Handling**: Centralized error management
- **Security**: Layered security approach

**3. Repository Pattern**
- **Data Access**: Abstracted database operations
- **Model Methods**: Encapsulated business logic
- **Service Layer**: Business logic separation

### Part B: Detailed Technical Views

#### 1. Authentication Flow Diagrams

**Registration Flow**
```
User Input → Validation → Duplicate Check → Password Hash → 
Database Save → Email Service → Welcome Email → Success Response
```

**Login Flow**
```
Credentials → User Lookup → Password Verification → 
Token Generation → Cookie Setting → Session Storage → Success Response
```

**Password Reset Flow**
```
Email Request → User Validation → Token Generation → 
Email Dispatch → Token Validation → Password Update → 
Success Email → Session Cleanup
```

**Token Refresh Flow**
```
Refresh Token → Token Validation → User Lookup → 
New Token Generation → Cookie Update → Success Response
```

#### 2. Data Models

**User Schema Structure**
```javascript
{
  username: String (unique, indexed, required)
  firstname: String (required, min: 4)
  lastname: String (required, min: 4)
  email: String (unique, required)
  password: String (hashed, required)
  refreshToken: String (JWT)
  resetPasswordToken: String (temporary)
  resetPasswordExpires: Date (temporary)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

**Token Structure**
```javascript
// Access Token Payload
{
  _id: ObjectId,
  username: String,
  email: String,
  iat: Number,
  exp: Number
}

// Refresh Token Payload
{
  _id: ObjectId,
  iat: Number,
  exp: Number
}
```

**Redis Session Structure**
```javascript
// Session Key Pattern: "session:userId"
{
  userId: String,
  accessToken: String,
  refreshToken: String,
  lastActivity: Date,
  ipAddress: String,
  userAgent: String
}
```

#### 3. API Layer Architecture

**Request/Response Flow**
```
HTTP Request → Express App → Middleware Chain → 
Route Handler → Controller → Service Layer → 
Database/Redis → Response → Client
```

**Middleware Execution Order**
1. **Helmet**: Security headers configuration
2. **Morgan**: HTTP request logging
3. **Rate Limiter**: Request throttling (100/15min)
4. **CORS**: Cross-origin resource sharing
5. **Body Parser**: JSON/URL-encoded parsing
6. **Cookie Parser**: Cookie extraction
7. **Compression**: Response compression
8. **Mongo Sanitize**: NoSQL injection prevention
9. **Route Handlers**: Business logic execution
10. **Error Handler**: Centralized error management

**Route Structure**
```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /forgot-password
│   └── POST /reset-password
├── PUT /updateUser/:userId
└── POST /refresh-token
```

#### 4. Security Architecture

**Password Security**
- **Hashing Algorithm**: bcrypt with 8 rounds
- **Salt Generation**: Automatic salt per password
- **Validation**: Strong password requirements
- **Storage**: Never store plaintext passwords

**JWT Implementation**
- **Access Token**: Short-lived (configurable, default 15min)
- **Refresh Token**: Long-lived (7 days)
- **Algorithm**: HMAC SHA256
- **Storage**: HttpOnly cookies
- **Rotation**: Automatic refresh token regeneration

**Cookie Security**
```javascript
{
  httpOnly: true,        // Prevent XSS
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 604800000     // 7 days
}
```

**Rate Limiting Strategy**
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Storage**: Memory-based tracking
- **Response**: 429 Too Many Requests

**Input Validation Layers**
1. **Schema Validation**: Mongoose model validation
2. **Express Validation**: Request body validation
3. **Sanitization**: Express Mongo Sanitize
4. **Custom Validation**: Controller-level checks

#### 5. Database Design

**MongoDB Collections**
```javascript
// Users Collection
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  // ... other fields
}

// Indexes
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "createdAt": 1 })
```

**Redis Key Patterns**
```
sessions:userId          // User session data
rateLimit:ipAddress      // Rate limiting data
passwordReset:token      // Password reset tokens
cache:user:userId        // User data cache
```

**Connection Management**
- **MongoDB**: Connection pooling with Mongoose
- **Redis**: Persistent connection with auto-reconnect
- **Error Handling**: Graceful connection failure handling

#### 6. Email Service Architecture

**Template System**
```
src/templates/
├── welcome.html              // Welcome email
├── passwordReset.html        // Password reset email
├── passwordResetSuccess.html // Reset confirmation
├── milestone.html            // User milestone
└── styles/
    ├── welcome.css
    ├── passwordReset.css
    └── passwordResetSuccess.css
```

**Email Service Configuration**
```javascript
{
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  templates: {
    welcome: 'welcome.html',
    reset: 'passwordReset.html',
    success: 'passwordResetSuccess.html'
  }
}
```

**Email Workflows**
1. **Welcome Email**: Sent on successful registration
2. **Password Reset**: Sent on forgot password request
3. **Reset Success**: Sent on successful password reset
4. **Milestone**: Sent on user achievements (extensible)

#### 7. Error Handling Strategy

**Error Class Structure**
```javascript
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}
```

**Error Middleware Flow**
```
Error Occurrence → Async Handler → Error Middleware → 
Logging → Client Response → Process Continuation
```

**Error Types**
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Rate Limit Errors**: 429 Too Many Requests
- **Server Errors**: 500 Internal Server Error

**Logging Strategy**
- **Winston Logger**: Structured logging
- **Log Levels**: error, warn, info, debug
- **Log Files**: Separate error and combined logs
- **Log Rotation**: Automatic log file management

#### 8. Deployment Architecture

**Docker Compose Setup**
```yaml
services:
  mongodb:
    image: bitnami/mongodb:8.0
    environment:
      - MONGODB_ROOT_PASSWORD=Authdb@6469
      - MONGODB_USERNAME=Auth
      - MONGODB_PASSWORD=Authuser@226547
      - MONGODB_DATABASE=auth_database
    ports: ["27017:27017"]
    volumes: ["./docker/mongodb_data:/bitnami/mongodb"]
  
  redis:
    image: redis:latest
    ports: ["6379:6379"]
    volumes: ["./docker/redis_data:/data"]
```

**Container Networking**
- **Custom Network**: `custom_network` bridge
- **Service Discovery**: Container name resolution
- **Port Mapping**: Host to container port mapping
- **Volume Persistence**: Data persistence across restarts

**Environment Configuration**
```javascript
// Production Environment
NODE_ENV=production
SERVER_PORT=3636
MONGO_URI=mongodb://Auth:Authuser@226547@auth_db:27017/auth_database
REDIS_URL=redis://redisdb_container:6379
CORS_ORIGIN=https://yourdomain.com
```

**Health Monitoring**
- **Application Health**: Express actuator integration
- **Database Health**: Connection status monitoring
- **Redis Health**: Cache service monitoring
- **Log Monitoring**: Winston log analysis

#### 9. Performance Optimization

**Database Optimization**
- **Indexing**: Strategic index placement
- **Connection Pooling**: Optimized connection management
- **Query Optimization**: Efficient database queries
- **Caching**: Redis-based response caching

**Application Optimization**
- **Compression**: Gzip response compression
- **Rate Limiting**: Request throttling
- **Session Management**: Efficient session handling
- **Memory Management**: Optimized memory usage

**Monitoring & Metrics**
- **Request Metrics**: Response time tracking
- **Error Tracking**: Error rate monitoring
- **Performance Metrics**: Throughput measurement
- **Resource Usage**: Memory and CPU monitoring

---

*This HLD provides comprehensive technical documentation for the Authentication Starter Kit, covering both high-level architecture and detailed implementation specifics.*
