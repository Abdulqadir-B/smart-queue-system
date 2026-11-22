# Smart Queue Management System (SQM)

A full-stack virtual queue system for government offices, hospitals, banks, and other public service centers. Customers join a queue remotely, receive a token, and follow their position in real time. Staff call and complete tokens; administrators manage queues and analytics.

## Stack

**Backend**

- Node.js and Express 5
- MongoDB and Mongoose
- Socket.IO
- JSON Web Tokens and bcryptjs
- express-validator and express-rate-limit
- Helmet

**Frontend**

- React 18
- Vite
- Material UI
- React Router
- Axios
- Socket.IO client

## Features

- Public queue joining with optional account login
- Unique token numbers and six-digit verification keys
- Waiting, serving, served, and abandoned token states
- Duplicate active-token check within a configurable time window
- Estimated wait time based on queue position
- Staff controls for calling, completing, and abandoning tokens
- Admin queue creation, deletion, pause/resume, reset, and analytics
- Real-time queue updates and individual customer turn notifications
- JWT authentication and role-based access control
- Customer, staff, and admin views
- Light and dark themes
- Privacy masking for customer information

## Roles

| Capability | Customer | Staff | Admin |
| --- | --- | --- | --- |
| Join and track queues | Yes | Yes | Yes |
| View active tokens | Yes | Yes | Yes |
| Call or complete tokens | No | Yes | Yes |
| Pause, resume, or reset queues | No | Yes | Yes |
| Create or delete queues | No | No | Yes |
| View analytics | No | No | Yes |

## Queue API

Authentication uses a Bearer token:

```http
Authorization: Bearer <jwt>
```

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `POST` | `/api/queues` | Admin |
| `GET` | `/api/queues` | Public |
| `GET` | `/api/queues/:name/status` | Public |
| `DELETE` | `/api/queues/:name` | Admin |
| `POST` | `/api/queues/:name/join` | Public |
| `GET` | `/api/queues/:name/token/:tokenNumber?verificationKey=<key>` | Public |
| `GET` | `/api/queues/my-tokens` | Authenticated |
| `POST` | `/api/queues/:name/next` | Staff/Admin |
| `POST` | `/api/queues/:name/complete` | Staff/Admin |
| `POST` | `/api/queues/:name/token/:tokenNumber/abandon` | Staff/Admin |
| `GET` | `/api/queues/:name/tokens` | Staff/Admin |
| `POST` | `/api/queues/:name/pause` | Staff/Admin |
| `POST` | `/api/queues/:name/resume` | Staff/Admin |
| `POST` | `/api/queues/:name/reset` | Staff/Admin |
| `GET` | `/api/analytics/dashboard` | Admin |

The exact route names and authorization requirements are defined in `backend/routes`.

## Real-time events

Socket events use the following names:

**Client to server**

- `customer:join`
- `staff:subscribe`
- `admin:subscribe`

**Server to client**

- `queue:update` - queue changes such as join, next, pause, resume, or reset
- `token:called` - a token was called in a queue
- `token:your-turn` - sent directly to the matching customer socket
- `error` - Socket.IO error payload

`queue:update` includes an `action` field for the operation that changed the queue.

## Security

- Passwords are hashed with bcryptjs.
- JWTs are verified on protected HTTP and Socket.IO requests.
- Protected routes use role checks.
- Queue names and token inputs use express-validator.
- Request bodies are checked for XSS patterns.
- Request bodies, query objects, and route parameters are rejected when MongoDB operator keys such as `$ne` or dot-key syntax are present.
- Mongoose schemas cast and constrain field values.
- Helmet sets security headers, including CSP and HSTS.
- CORS uses an explicit origin configuration.
- API and login limits reduce abuse and brute-force attempts.
- Customer data is masked when an unauthenticated or unauthorized request tries to view it.

For local development, JWTs expire after 24 hours by default. Set `JWT_EXPIRES_IN` to override the lifetime.

## Atomic queue counters

Joining a queue and calling the next token use MongoDB atomic increments through `findOneAndUpdate`. This avoids separate read/write counter updates that could issue duplicate token numbers under concurrent requests.

Resetting a queue also updates its counters atomically.

## Database

The default database name is `smart_queue`.

| Model | Main fields |
| --- | --- |
| `User` | username, email, password, role, isActive |
| `Queue` | name, lastToken, servingToken, isActive |
| `QueueToken` | queue, queueName, tokenNumber, customer, verificationKey, status |
| `Token` | JWT lifecycle/revocation support |
| `Setting` | reserved application settings |

The queue waiting count is calculated as `lastToken - servingToken`, with a minimum of zero.

## Local setup

### Requirements

- Node.js 18 or newer
- MongoDB 6 or newer
- npm

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://127.0.0.1:27017/smart_queue
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=24h
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true
RATE_LIMIT_GLOBAL_WINDOW_MINS=15
RATE_LIMIT_GLOBAL_MAX=200
RATE_LIMIT_QUEUE_WINDOW_SECS=60
RATE_LIMIT_QUEUE_MAX=30
RATE_LIMIT_TOKEN_WINDOW_MINS=30
RATE_LIMIT_TOKEN_MAX=5
DUPLICATE_CHECK_WINDOW_HOURS=24
```

Start the API:

```bash
npm start
```

The backend listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm start
```

The Vite app listens on `http://localhost:3000` or the port reported by Vite.

Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in `frontend/.env` when they differ from the local defaults.

## Environment notes

- `JWT_SECRET` is required. Generate a separate production secret rather than using a development value.
- `MONGODB_URI` is required outside local development.
- `CORS_ORIGINS` accepts comma-separated origins.
- `JWT_EXPIRES_IN` accepts JSON Web Token duration strings such as `24h` or `1h`.
- Rate limits and the duplicate-token window can be tuned through environment variables.

## Project layout

```text
backend/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validators/

frontend/src/
  components/
  context/
  hooks/
  pages/
  services/
  utils/
```

Additional implementation notes are in [ARCHITECTURE.md](ARCHITECTURE.md).
