# Smart Queue Management System (SQM)

**Primary Use Case:** Government Offices and Public Service Centers

---

##  Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [Database & Schema Design](#database--schema-design)
- [Authentication & Authorization](#authentication--authorization)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Important Technical Details](#important-technical-details)

---

##  Project Overview

The Smart Queue Management System (SQM) is a web-based application designed to eliminate physical queues and reduce waiting time in government offices, public service centers, hospitals, banks, and other service-oriented organizations. The system allows customers to join virtual queues remotely, track their position in real-time, and receive notifications when their turn approaches.

### Problem Statement

- Long physical queues causing customer frustration
- Inefficient manual queue management
- No real-time status updates for customers
- Difficulty in tracking service analytics
- Crowd management issues, especially post-pandemic

### Solution

A digital queue management system with real-time updates, role-based access control, and comprehensive analytics to streamline service delivery and enhance customer experience.

---

##  Technologies Used

### **Backend Technologies**

| Technology     | Version           | Purpose                                                          |
| -------------- | ----------------- | ---------------------------------------------------------------- |
| **Node.js**    | Latest            | JavaScript runtime environment for server-side development       |
| **Express.js** | 5.1.0             | Web application framework for building RESTful APIs              |
| **MongoDB**    | 8.18.3 (Mongoose) | NoSQL database for flexible data storage                         |
| **Socket.io**  | 4.8.1             | Real-time bidirectional communication between clients and server |
| **JWT**        | 9.0.2             | JSON Web Tokens for secure authentication                        |
| **bcryptjs**   | 3.0.2             | Password hashing for secure storage                              |

### **Frontend Technologies**

| Technology            | Version | Purpose                                               |
| --------------------- | ------- | ----------------------------------------------------- |
| **React.js**          | 18.2.0  | Component-based UI library                            |
| **Material-UI (MUI)** | 5.14.19 | Modern UI component library following Material Design |
| **React Router**      | 6.20.0  | Client-side routing for single-page application       |
| **Axios**             | 1.6.2   | HTTP client for API requests                          |
| **Socket.io Client**  | 4.7.2   | Real-time client-side communication                   |

### **Security Technologies**

| Technology                 | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| **Helmet.js**              | Security headers (CSP, HSTS, XSS protection) |
| **express-rate-limit**     | API rate limiting to prevent abuse           |
| **express-mongo-sanitize** | NoSQL injection prevention                   |
| **express-validator**      | Input validation and sanitization            |
| **CORS**                   | Cross-Origin Resource Sharing configuration  |

### **Development Tools**

- **dotenv** - Environment variable management
- **Validator** - String validation library
- **cross-env** - Cross-platform environment variables

---

##  Key Features

### **1. Multi-Role System**

- **Customer/User**: Join queues, track tokens, receive notifications
- **Staff**: Manage queue operations, call next customer, complete/abandon tokens
- **Admin**: Create/delete queues, view analytics, full system control

### **2. Real-Time Queue Management**

- Live queue status updates using Socket.io
- Instant notifications when token is called
- Real-time position tracking in queue
- Automatic queue status synchronization across all connected clients

### **3. Token System**

- Unique token generation with 6-digit verification PIN
- Token status tracking (waiting, serving, served, abandoned)
- Estimated wait time calculation based on current queue length
- Duplicate token prevention within 24-hour window

### **4. Security Features**

- JWT-based authentication with secure token storage
- Role-based access control (RBAC)
- Password hashing using bcrypt (10 salt rounds)
- Rate limiting on all API endpoints
- NoSQL injection protection
- Input validation and sanitization
- Secure HTTP headers (Helmet.js)
- CORS policy enforcement

### **5. Queue Operations**

- **Create Queue**: Admins can create new service queues
- **Join Queue**: Customers provide name, phone, email to get token
- **Call Next**: Staff advances to next waiting customer
- **Complete Service**: Mark current token as served
- **Abandon Token**: Handle no-show customers
- **Pause/Resume**: Temporarily stop queue operations
- **Reset Queue**: Clear all tokens and restart counters

### **6. Analytics Dashboard** (Admin Only)

- Total queues in system
- Active queues count
- Total tokens issued across all queues
- Total tokens served
- Real-time analytics updates

### **7. Customer Features**

- Join any active queue without registration
- Track token status with verification key
- View current position in queue
- Estimated wait time display
- Browser notifications when turn is near
- Auto-notification manager for turn alerts

### **8. Staff Features**

- View all assigned queues
- Real-time queue status monitoring
- Call next customer in queue
- Mark service completion
- Handle abandoned tokens
- Pause/resume queue operations

### **9. Privacy & Data Protection**

- Customer data masking for unauthorized views
- Verification key required for token tracking
- Automatic data sanitization
- Sensitive data excluded from default queries

---

##  -  Database & Schema Design

### **Database:** MongoDB (NoSQL)

**Database Name:** `smart_queue`  
**Connection:** MongoDB running on `localhost:27017`

### **Collections & Schemas**

#### **1. Users Collection**

Stores user accounts for authentication and authorization.

```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed, lowercase),
  password: String (hashed with bcrypt, select: false),
  role: String (enum: ['admin', 'staff', 'user'], default: 'user', indexed),
  isActive: Boolean (default: true, indexed),
  lastLogin: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Points:**

- Password never returned in queries (select: false)
- Pre-save hook automatically hashes password
- Indexes on username, email, role, isActive for fast queries
- Role-based access: admin > staff > user

---

#### **2. Queues Collection**

Stores queue information and token counters.

```javascript
{
  _id: ObjectId,
  name: String (unique, indexed, required),
  lastToken: Number (default: 0, min: 0, indexed),
  servingToken: Number (default: 0, min: 0, indexed),
  isActive: Boolean (default: true, indexed),
  createdAt: Date (auto),
  updatedAt: Date (auto),

  // Virtual field (not stored in DB)
  waiting: Number (calculated: lastToken - servingToken)
}
```

**Key Points:**

- `lastToken`: Last token number issued (increments on join)
- `servingToken`: Currently serving token number
- `waiting`: Virtual field showing customers in queue
- Indexes for fast queue lookups and filtering

---

#### **3. QueueTokens Collection**

Tracks individual tokens issued to customers.

```javascript
{
  _id: ObjectId,
  queue: ObjectId (ref: 'Queue', indexed),
  queueName: String (indexed),
  tokenNumber: Number (indexed, required),
  user: ObjectId (ref: 'User', indexed, optional),

  customer: {
    name: String (required),
    phone: String (optional),
    email: String (optional)
  },

  verificationKey: String (6-digit PIN, indexed, required),
  status: String (enum: ['waiting', 'serving', 'served', 'abandoned'],
                  default: 'waiting', indexed),
  estimatedWaitTime: Number (in minutes, default: 0),
  calledAt: Date (when token was called),
  servedAt: Date (when service completed),
  notes: String (special requests),

  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Points:**

- Links to both Queue (by ObjectId) and stores queueName for easier queries
- Customer info stored as sub-document
- 6-digit verification key for secure token tracking
- Status tracking throughout service lifecycle
- Timestamps for wait time and service time calculations

---

#### **4. Tokens Collection** (Auth Tokens)

Manages JWT token lifecycle (currently minimal usage).

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  token: String (unique, indexed),
  type: String (enum: ['access', 'refresh', 'reset'], indexed),
  expiresAt: Date (indexed),
  isRevoked: Boolean (default: false, indexed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Points:**

- Supports token revocation
- Multiple token types for different purposes
- Automatic expiration checking

---

#### **5. Settings Collection** (Future Use)

Reserved for system-wide configuration settings.

```javascript
{
  _id: ObjectId,
  key: String (unique),
  value: Mixed,
  description: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### **Schema Relationships**

```
Users (1) -------- (M) QueueTokens
  |
  | (manages)
  |
Queues (1) ------- (M) QueueTokens
  |
  | (generates)
  |
QueueTokens (individual customer tokens)
```

### **Indexing Strategy**

- **Primary Indexes**: \_id (automatic)
- **Unique Indexes**: username, email, queue name, auth token
- **Query Indexes**: role, isActive, status, queue reference, verification key
- **Purpose**: Fast lookups, efficient filtering, prevent duplicates

---

##  Authentication & Authorization

### **Authentication Flow (Simple Explanation)**

#### **1. User Registration**

```
Customer fills form  System validates input  Password is hashed (bcrypt)
 User saved to database  Success message returned
```

**Security Measures:**

- Password hashed with bcrypt (cannot be reversed)
- Email and username uniqueness validated
- Rate limit: Max 3 registrations per 24 hours per IP
- Input sanitization to prevent malicious data

---

#### **2. User Login**

```
User enters credentials  System finds user by email
 Compares hashed password  If match, creates JWT token
 Token sent to client  Client stores token in localStorage
 User logged in
```

**JWT Token Contains:**

- User ID
- Email
- Role (admin/staff/user)
- Expiration time (typically 24 hours)

**Security Measures:**

- Only password hash compared (original password never stored)
- Failed login attempts are rate-limited (5 attempts per hour)
- Token expires after set time period
- Token sent via secure HTTPS (in production)

---

#### **3. Protected Route Access**

```
User makes request  Client sends JWT in Authorization header
 Server verifies JWT signature  Extracts user info from token
 Checks if user exists and is active  Attaches user to request
 Proceeds to route handler
```

**Middleware Chain:**

```javascript
Request  auth (verify token)  authorize(['admin', 'staff'])  Controller
```

---

### **Authorization (Role-Based Access Control)**

#### **Role Hierarchy:**

```
Admin (highest privileges)
  
Staff (queue management)
  
User/Customer (basic access)
```

#### **Access Control Matrix:**

| Feature            | Customer | Staff | Admin |
| ------------------ | -------- | ----- | ----- |
| Join Queue         |        |     |     |
| Track Token        |        |     |     |
| View Queue Status  |        |     |     |
| Call Next Token    |        |     |     |
| Complete Service   |        |     |     |
| Pause/Resume Queue |        |     |     |
| Reset Queue        |        |     |     |
| Create Queue       |        |     |     |
| Delete Queue       |        |     |     |
| View Analytics     |        |     |     |

#### **How Authorization Works:**

1. After authentication, user object is attached to request
2. Authorization middleware checks user's role
3. If role matches required roles  Access granted
4. If role doesn't match  404 error (hides resource existence for security)

---

### **Socket.io Authentication**

Real-time connections also require authentication:

```
Client connects  Sends JWT token in handshake
 Server verifies token  Attaches user to socket
 Connection established with user context
```

**Role-Based Socket Events:**

- Customers can join queue rooms (public)
- Staff must be authenticated to subscribe to queues
- Admins can subscribe to all system events
- Unauthorized attempts are rejected with error messages

---

##  -  System Architecture

### **Architecture Pattern:** MVC (Model-View-Controller)

```

                    FRONTEND (React)                      
        
    Pages     Components   Context (State Mgmt)   
        
                                                       
                     
                                                         
                   Services Layer                         
            (API Service, Queue Service)                  

                          HTTP/WebSocket
                         

                   BACKEND (Express)                      
          
    Routes   Controllers   Models (Mongoose)    
          
                                                       
          
    Middleware       Socket.io Service              
     (Auth,        (Real-time Communication)        
     Validate)        
                                           

                         
                         
              
                 MongoDB Database   
                 (smart_queue DB)   
              
```

### **Request Flow Example: Join Queue**

```
1. Customer fills form on Frontend
   
2. React component validates input (client-side)
   
3. API Service sends POST request to /api/queues/:name/join
   
4. Backend receives request
   
5. Middleware chain executes:
   - Rate limiter checks request frequency
   - Input sanitization removes dangerous characters
   - Validation middleware checks data format
   
6. Controller (joinQueue) processes request:
   - Finds queue in database
   - Checks for duplicate tokens
   - Increments queue counter
   - Creates QueueToken document
   
7. Socket.io broadcasts update to all connected clients
   
8. Response sent back to client with token details
   
9. Frontend displays token number and verification key
```

### **Real-Time Communication Flow**

```
Staff calls next token:
  Backend updates database  Socket.io emits event
   All customers listening to that queue receive update
   Customer whose token was called gets notification
   UI updates automatically
```

---

##  Installation & Setup

### **Prerequisites**

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Add the following variables:
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_queue
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Start MongoDB service
# Windows: Open MongoDB Compass or run mongod service
# Linux/Mac: sudo systemctl start mongod

# Run the backend server
npm start

# Optional: Seed database with sample data
npm run seed
```

### **Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start

# Frontend will run on http://localhost:3000
```

---

##  Important Technical Details

### **Port Configuration**

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000
- **MongoDB:** mongodb://127.0.0.1:27017

### **Environment Variables Required**

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_queue
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### **Rate Limits**

- **Global API:** 200 requests per 15 minutes per IP
- **Login:** 5 failed attempts per hour
- **Registration:** 3 successful registrations per 24 hours per IP
- **Token Generation:** 10 tokens per 30 minutes per queue
- **Queue Actions:** 30 requests per minute

### **JWT Token Expiry**

- Access tokens expire after 24 hours
- Configurable in JWT utility

### **Password Security**

- Bcrypt salt rounds: 10
- Minimum password length: 6 characters (can be configured in validators)

### **Socket.io Events**

**Client  Server:**

- `customer:join` - Join queue room
- `staff:subscribe` - Subscribe to queue updates
- `admin:subscribe` - Subscribe to all updates

**Server  Client:**

- `customer:joined` - Confirmation of queue join
- `token:called` - Token has been called for service
- `queue:update` - Queue status updated (pause/resume/reset)
- `error` - Error message

### **API Endpoints Overview**

**Auth Routes:**

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user (protected)

**Queue Management Routes:**

- POST `/api/queues` - Create queue (admin only)
- GET `/api/queues` - List all queues
- GET `/api/queues/:name/status` - Get queue status
- DELETE `/api/queues/:name` - Delete queue (admin only)

**Token Routes:**

- POST `/api/queues/:name/join` - Join queue (get token)
- POST `/api/queues/:name/next` - Call next token (staff/admin)
- GET `/api/queues/:name/tokens` - List all tokens (staff/admin)
- POST `/api/tokens/:tokenId/complete` - Mark served (staff/admin)
- POST `/api/tokens/:tokenId/abandon` - Mark abandoned (staff/admin)
- GET `/api/tokens/verify` - Verify token by verification key

**Queue State Routes:**

- POST `/api/queues/:name/pause` - Pause queue (staff/admin)
- POST `/api/queues/:name/resume` - Resume queue (staff/admin)
- POST `/api/queues/:name/reset` - Reset queue (staff/admin)

**Analytics Routes:**

- GET `/api/analytics/counts` - Get analytics counts (admin only)

### **File Structure Highlights**

**Backend:**

- `models/` - Mongoose schemas (User, Queue, QueueToken, Token)
- `controllers/` - Business logic for each feature
- `routes/` - API endpoint definitions
- `middleware/` - Auth, authorization, validation, rate limiting
- `services/` - Socket.io real-time service
- `utils/` - JWT utilities, privacy functions
- `validators/` - Input validation rules
- `config/` - Configuration management

**Frontend:**

- `pages/` - Main views (Home, Login, CustomerView, StaffView, AdminView)
- `components/` - Reusable UI components
- `context/` - React Context for state management (Auth, Queue, Socket, Theme)
- `services/` - API service layer
- `utils/` - Helper functions and constants
- `hooks/` - Custom React hooks

### **Key Design Patterns Used**

1. **MVC (Model-View-Controller):** Separation of concerns
2. **Repository Pattern:** Models handle database operations
3. **Middleware Chain:** Sequential request processing
4. **Factory Pattern:** Middleware factories (authorize, rate limiters)
5. **Context API:** React state management
6. **Service Layer:** Abstraction of API calls
7. **Custom Hooks:** Reusable React logic

### **Dependencies Count**

- **Backend:** 13 dependencies
- **Frontend:** 13 dependencies
- **Total:** 26 production dependencies

### **Code Quality Practices**

- Consistent naming conventions
- Comprehensive error handling
- Input validation on both client and server
- Code comments for complex logic
- Modular code structure
- Security-first approach

---


##  Support & Documentation

For any questions or issues:

- Review the code comments in each file
- Check MongoDB connection before starting
- Ensure all environment variables are set
- Run `npm install` in both backend and frontend directories

---

**Project Status:** Under Active Development  
**Version:** 1.0.0  
**Last Updated:** December 2025  

---

