# Smart Queue Management System (SQM)

**Primary Use Case:** Government Offices and Public Service Centers

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [Database and Schema Design](#database-and-schema-design)
- [Authentication and Authorization](#authentication-and-authorization)
- [System Architecture](#system-architecture)
- [Installation and Setup](#installation-and-setup)
- [Important Technical Details](#important-technical-details)

---

## Project Overview

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

## Technologies Used

### Backend Technologies

| Technology | Version | Purpose |
| --- | --- | --- |
| **Node.js** | Latest | JavaScript runtime environment for server-side development |
| **Express.js** | 5.1.0 | Web application framework for building RESTful APIs |
| **MongoDB** | 8.18.3 (Mongoose) | NoSQL database for flexible data storage |
| **Socket.io** | 4.8.1 | Real-time bidirectional communication between clients and server |
| **JWT** | 9.0.2 | JSON Web Tokens for secure authentication |
| **bcryptjs** | 3.0.2 | Password hashing for secure storage |

### Frontend Technologies

| Technology | Version | Purpose |
| --- | --- | --- |
| **React.js** | 18.2.0 | Component-based UI library |
| **Vite** | 6.4.3 | Frontend build tool and development server |
| **Material-UI (MUI)** | 5.14.19 | Modern UI component library following Material Design |
| **React Router** | 6.20.0 | Client-side routing for single-page application |
| **Axios** | 1.6.2 | HTTP client for API requests |
| **Socket.io Client** | 4.7.2 | Real-time client-side communication |

### Security Technologies

| Technology | Purpose |
| --- | --- |
| **Helmet.js** | Security headers (CSP, HSTS, XSS protection) |
| **express-rate-limit** | API rate limiting to prevent abuse |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **express-validator** | Input validation and sanitization |
| **CORS** | Cross-Origin Resource Sharing configuration |

### Development Tools

- **dotenv** - Environment variable management
- **Validator** - String validation library

---

## Key Features

### 1. Multi-Role System

- **Customer/User**: Join queues, track tokens, receive notifications
- **Staff**: Manage queue operations, call next customer, complete/abandon tokens
- **Admin**: Create/delete queues, view analytics, full system control

### 2. Real-Time Queue Management

- Live queue status updates using Socket.io
- Instant notifications when token is called
- Real-time position tracking in queue
- Automatic queue status synchronization across all connected clients

### 3. Token System

- Unique token generation with 6-digit verification PIN
- Token status tracking (waiting, serving, served, abandoned)
- Estimated wait time calculation based on current queue length
- Duplicate token prevention within 24-hour window
- Logged-in users can view all their active tokens across queues

### 4. Security Features

- JWT-based authentication with secure token storage
- Role-based access control (RBAC)
- Password hashing using bcrypt (10 salt rounds)
- Rate limiting on all API endpoints
- NoSQL injection protection
- Input validation and sanitization
- Secure HTTP headers (Helmet.js)
- CORS policy enforcement

### 5. Queue Operations

- **Create Queue**: Admins can create new service queues
- **Join Queue**: Customers provide name, phone, email to get token
- **Call Next**: Staff advances to next waiting customer
- **Complete Service**: Mark current token as served
- **Abandon Token**: Handle no-show customers
- **Pause/Resume**: Temporarily stop queue operations
- **Reset Queue**: Clear all tokens and restart counters

### 6. Analytics Dashboard (Admin Only)

- Total queues in system
- Active queues count
- Total tokens issued across all queues
- Total tokens served
- Real-time analytics updates

### 7. Customer Features

- Join any active queue without registration (optional login links token to account)
- Track token status with verification key
- View current position in queue
- Estimated wait time display
- Browser notifications when turn is near
- Auto-notification manager for turn alerts

### 8. Staff Features

- View all assigned queues
- Real-time queue status monitoring
- Call next customer in queue
- Mark service completion
- Handle abandoned tokens
- Pause/resume queue operations

### 9. Privacy and Data Protection

- Customer data masking for unauthorized views
- Verification key required for token tracking
- Automatic data sanitization
- Sensitive data excluded from default queries

### 10. Theme and UI

- Dark mode and light mode support
- User theme preference persisted across sessions via localStorage
- Defaults to dark mode for first-time visitors

---

## Database and Schema Design

### Database: MongoDB (NoSQL)

**Database Name:** `smart_queue`
**Connection:** MongoDB running on `localhost:27017`

### Collections

| Collection | Purpose |
| --- | --- |
| **Users** | Stores user accounts with role, hashed password, and activity status |
| **Queues** | Stores queue names, token counters (lastToken, servingToken), and active state |
| **QueueTokens** | Tracks every token issued, linking customer info, queue reference, verification key, and status |
| **Tokens** | Manages JWT token lifecycle for revocation support |
| **Settings** | Reserved for future system-wide configuration |

### Key Schema Notes

- Passwords are never returned in queries (select: false) and are hashed on save via a pre-save hook
- QueueTokens stores queueName alongside the ObjectId reference for simpler queries
- The waiting count on a Queue is a virtual field calculated as lastToken minus servingToken
- All frequently queried fields (role, isActive, status, verificationKey) are indexed

### Schema Relationships

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

### Indexing Strategy

- **Primary Indexes**: _id (automatic)
- **Unique Indexes**: username, email, queue name, auth token
- **Query Indexes**: role, isActive, status, queue reference, verification key
- **Purpose**: Fast lookups, efficient filtering, prevent duplicates

---

## Authentication and Authorization

### Authentication Flow

#### 1. User Registration

```
Customer fills form -> System validates input -> Password is hashed (bcrypt)
-> User saved to database -> Success message returned
```

**Security Measures:**

- Password hashed with bcrypt (cannot be reversed)
- Email and username uniqueness validated
- Rate limit: Max 3 registrations per 24 hours per IP
- Input sanitization to prevent malicious data

---

#### 2. User Login

```
User enters credentials -> System finds user by email
-> Compares hashed password -> If match, creates JWT token
-> Token sent to client -> Client stores token in localStorage
-> User logged in
```

**JWT Token Contains:**

- User ID
- Email
- Role (admin/staff/user)
- Expiration time (24 hours)

**Security Measures:**

- Only password hash compared (original password never stored)
- Failed login attempts are rate-limited (5 attempts per hour)
- Token expires after set time period
- Token sent via secure HTTPS (in production)

---

#### 3. Protected Route Access

```
User makes request -> Client sends JWT in Authorization header
-> Server verifies JWT signature -> Extracts user info from token
-> Checks if user exists and is active -> Attaches user to request
-> Proceeds to route handler
```

**Middleware Chain:**

```
Request -> auth (verify token) -> authorize(['admin', 'staff']) -> Controller
```

---

### Authorization (Role-Based Access Control)

#### Role Hierarchy

```
Admin (highest privileges)

Staff (queue management)

User/Customer (basic access)
```

#### Access Control Matrix

| Feature | Customer | Staff | Admin |
| --- | --- | --- | --- |
| Join Queue | Yes | Yes | Yes |
| Track Token | Yes | Yes | Yes |
| View Queue Status | Yes | Yes | Yes |
| Call Next Token | No | Yes | Yes |
| Complete Service | No | Yes | Yes |
| Pause/Resume Queue | No | Yes | Yes |
| Reset Queue | No | Yes | Yes |
| Create Queue | No | No | Yes |
| Delete Queue | No | No | Yes |
| View Analytics | No | No | Yes |

#### How Authorization Works

1. After authentication, user object is attached to request
2. Authorization middleware checks user role
3. If role matches required roles -> Access granted
4. If role does not match -> 404 error (hides resource existence for security)

---

### Socket.io Authentication

Real-time connections also require authentication:

```
Client connects -> Sends JWT token in handshake
-> Server verifies token -> Attaches user to socket
-> Connection established with user context
```

**Role-Based Socket Events:**

- Customers can join queue rooms (public)
- Staff must be authenticated to subscribe to queues
- Admins can subscribe to all system events
- Unauthorized attempts are rejected with error messages

---

## System Architecture

### Architecture Pattern: MVC (Model-View-Controller)

```
                    FRONTEND (React + Vite)

    Pages     Components   Context (State Mgmt)

                   Services Layer
            (ApiService, QueueService, AnalyticsService)

                          HTTP/WebSocket

                   BACKEND (Express)

    Routes   Controllers   Models (Mongoose)

    Middleware       Socket.io Service
     (Auth,        (Real-time Communication)
     Validate)

                  MongoDB Database
                  (smart_queue DB)
```

### Request Flow Example: Join Queue

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

### Real-Time Communication Flow

```
Staff calls next token:
  Backend updates database -> Socket.io emits event
   -> All customers listening to that queue receive update
   -> Customer whose token was called gets notification
   -> UI updates automatically
```

---

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm package manager

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_queue
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Start MongoDB service
# Windows: Open MongoDB Compass or run the mongod service
# Linux/Mac: sudo systemctl start mongod

# Run the backend server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start

# Frontend will run on http://localhost:5173
```

---

## Important Technical Details

### Port Configuration

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **MongoDB:** mongodb://127.0.0.1:27017

### Environment Variables Required

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_queue
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Rate Limits

- **Global API:** 200 requests per 15 minutes per IP
- **Login:** 5 failed attempts per hour
- **Registration:** 3 successful registrations per 24 hours per IP
- **Token Generation:** 5 tokens per 30 minutes per queue per IP
- **Queue Actions:** 30 requests per minute
- **Token Status Checks:** Separate rate limiter applied

### JWT Token Expiry

- Access tokens expire after 24 hours
- Configurable in JWT utility

### Password Security

- Bcrypt salt rounds: 10
- Minimum password length: 6 characters (configurable in validators)

### Socket.io Events

**Client to Server:**

- `customer:join` - Join queue room
- `staff:subscribe` - Subscribe to queue updates
- `admin:subscribe` - Subscribe to all updates

**Server to Client:**

- `customer:joined` - Confirmation of queue join
- `token:called` - Token has been called for service
- `queue:update` - Queue status updated (pause/resume/reset)
- `error` - Error message

### API Endpoints

**Auth Routes:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile (protected)
- `POST /api/auth/logout` - Logout current user (protected)
- `DELETE /api/auth/delete-account` - Delete user account (protected)

**Queue Management Routes:**

- `POST /api/queues` - Create queue (admin only)
- `GET /api/queues` - List all queues
- `GET /api/queues/:name/status` - Get queue status
- `DELETE /api/queues/:name` - Delete queue (admin only)

**Token Routes:**

- `GET /api/queues/my-tokens` - Get logged-in user active tokens (protected)
- `POST /api/queues/:name/join` - Join queue and receive a token
- `GET /api/queues/:name/token/:tokenNumber` - Get token status (requires verificationKey query param)
- `POST /api/queues/:name/next` - Call next token (staff/admin)
- `POST /api/queues/:name/complete` - Mark current token as served (staff/admin)
- `POST /api/queues/:name/token/:tokenNumber/abandon` - Mark token as abandoned (staff/admin)
- `GET /api/queues/:name/tokens` - List all tokens for a queue (staff/admin)

**Queue State Routes:**

- `POST /api/queues/:name/pause` - Pause queue (staff/admin)
- `POST /api/queues/:name/resume` - Resume queue (staff/admin)
- `POST /api/queues/:name/reset` - Reset queue (staff/admin)

**Analytics Routes:**

- `GET /api/analytics/counts` - Get system-wide analytics counts (admin only)

### File Structure

**Backend:**

- `models/` - Mongoose schemas (User, Queue, QueueToken, Token, Setting)
- `controllers/` - Business logic (auth, queue management, queue state, tokens, analytics)
- `routes/` - API endpoint definitions (authRoutes, queueManagementRoutes, queueStateRoutes, tokenRoutes, analyticsRoutes)
- `middleware/` - Auth, authorization, rate limiting, error handler, sanitize
- `services/` - Socket.io real-time service
- `utils/` - JWT utilities, privacy functions
- `validators/` - Input validation rules
- `config/` - Configuration management

**Frontend:**

- `pages/` - Main views (Home, Login, Register, CustomerView, StaffView, AdminView, Privacy, Terms, NotFound, Unauthorized)
- `components/` - Reusable UI components split by role (admin/, staff/, customer/, common/)
- `context/` - React Context for state management (AuthContext, QueueContext, SocketContext, ThemeContext)
- `services/` - API service layer (ApiService, QueueService, AnalyticsService)
- `utils/` - Helper functions, constants, error handler, sanitizer, logger
- `hooks/` - Custom React hooks (useNotification)

### Key Design Patterns Used

1. **MVC (Model-View-Controller):** Separation of concerns
2. **Repository Pattern:** Models handle database operations
3. **Middleware Chain:** Sequential request processing
4. **Factory Pattern:** Middleware factories (authorize, rate limiters)
5. **Context API:** React state management
6. **Service Layer:** Abstraction of API calls
7. **Custom Hooks:** Reusable React logic

---

**Project Status:** Under Active Development
**Version:** 1.0.0
**Last Updated:** September 2026

---
