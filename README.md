[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22795355&assignment_repo_type=AssignmentRepo)

# News Aggregator API

A RESTful API built with **Node.js**, **Express**, and **MongoDB** that lets users register, log in, manage their news topic preferences, and fetch personalised news articles from the internet — all secured behind JWT authentication.

---

## How It Works — Big Picture

```
Client
  │
  ├── POST /users/signup        → Creates account, stores hashed password in MongoDB
  ├── POST /users/login         → Verifies password, returns a signed JWT token
  │
  │   (All routes below require the JWT token in the Authorization header)
  │
  ├── GET  /users/preferences   → Returns the user's saved topic list from DB
  ├── PUT  /users/preferences   → Updates the user's topic list in DB
  │
  └── GET  /news                → Reads user's topics from DB → queries NewsAPI
                                   → caches result for 5 mins → returns articles
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Runtime | Node.js >= 18 | JavaScript on the server |
| Framework | Express | Routing and middleware |
| Database | MongoDB Atlas + Mongoose | Storing users and preferences |
| Auth | JWT (`jsonwebtoken`) | Stateless authentication via signed tokens |
| Password hashing | bcrypt | One-way hashing — passwords are never stored in plain text |
| HTTP client | axios | Calling the NewsAPI |
| News source | [NewsAPI](https://newsapi.org/) | External news articles |
| Caching | In-memory `Map` | Avoid redundant NewsAPI calls for same preferences |
| Testing | tap + supertest + mongodb-memory-server | Integration tests without touching real DB |

---

## Project Structure

```
app.js                                 # Bootstraps Express, connects to MongoDB, registers all routes
├── controllers/
│   ├── newsAggregatorController.js    # Business logic: register, login, get/update preferences
│   └── newsPreferenceController.js    # Business logic: fetch news from NewsAPI with caching
├── middleware/
│   ├── newsAggregatorMiddleWare.js    # Logger — prints every incoming request method + URL
│   └── validateJWT.js                # Extracts Bearer token, verifies it, attaches user to req.user
├── models/
│   └── userModel.js                  # Mongoose schema — defines shape + validation rules for a User
├── routes/
│   ├── newsAggregatorRoutes.js       # Wires /users/* URLs to controller functions
│   └── newsPreferenceRoutes.js       # Wires /news/* URLs to controller functions
└── test/
    └── server.test.js                # Full integration test suite (10 test cases)
```

---

## Prerequisites

- Node.js v18 or above
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [NewsAPI](https://newsapi.org/register) API key

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file.**

```env
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<database>?appName=<name>
JWT_SECRET=your_super_secret_key
NEWS_API_KEY=your_newsapi_key
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on |
| `MONGODB_URI` | Full MongoDB connection string including the database name |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens — keep this private |
| `NEWS_API_KEY` | API key from newsapi.org |

---

## Installation & Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd news-aggregator-api

# 2. Install dependencies
npm install

# 3. Create your .env file (see above)

# 4. Start the server
npm start
```

The server will log:
```
Connected to MongoDB via Mongoose
Express application started on port 8080
```

---

## Running Tests

Tests spin up an isolated **in-memory MongoDB** instance — your real database is never touched. Each run starts with a clean, empty database and tears it down automatically when done.

```bash
npm test
```

Expected output:
```
Asserts:  15 pass  0 fail  15 of 15 complete
```

---

## Authentication Flow

1. **Sign up** — `POST /users/signup` creates your account
2. **Log in** — `POST /users/login` returns a **JWT token** (valid for 1 hour)
3. **Use the token** — Pass it in every protected request as:
   ```
   Authorization: Bearer <your_token>
   ```
4. The `validateJWT` middleware intercepts protected routes, verifies the token, and attaches the decoded user (`{ username, email }`) to `req.user` so controllers can use it without hitting the database again.

---

## API Reference

### User & Auth Routes — base path `/users`

---

#### `POST /users/signup` — Register a new user

Creates a new user. Before saving, the password is validated against the rules then hashed with bcrypt (salt rounds: 5). Mongoose schema validation runs on the **original** password, not the hash.

**Request Body:**
```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

**Password rules:**
- Minimum 6 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 lowercase letter
- Must contain at least 1 number

**Responses:**

| Status | When |
|--------|------|
| `200` | User created successfully |
| `400` | Missing email, invalid email format, password fails rules, or email already exists |

```json
// 200
{ "message": "User registered successfully", "user": { "_id": "...", "name": "Clark Kent", "email": "clark@superman.com", "preferences": ["movies", "comics"] } }

// 400
{ "message": "Password must contain at least 1 uppercase, 1 lowercase, and 1 number" }
```

---

#### `POST /users/login` — Authenticate and get a token

Looks up the user by email, compares the provided password against the bcrypt hash, and returns a signed JWT on success.

**Request Body:**
```json
{ "email": "clark@superman.com", "password": "Krypt()n8" }
```

**Responses:**

| Status | When |
|--------|------|
| `200` | Credentials correct — token returned |
| `401` | Password is wrong |
| `404` | No user found with that email |

```json
// 200
{ "message": "Login successful", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

> Store this token — you need it for all protected routes. It expires in **1 hour**.

---

#### `GET /users/preferences` — Get preferences 🔒

Returns the list of news topics the authenticated user has saved.

**Headers:** `Authorization: Bearer <token>`

```json
// 200
{ "message": "Preferences retrieved successfully", "preferences": ["movies", "comics"] }
```

---

#### `PUT /users/preferences` — Update preferences 🔒

Replaces the user's preferences with the new array provided. The old list is completely overwritten.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "preferences": ["movies", "comics", "games"] }
```

```json
// 200
{ "message": "Preferences updated successfully", "preferences": ["movies", "comics", "games"] }

// 400 — if preferences field is missing from body
{ "message": "Preferences are required in the request body" }
```

---

### News Routes — base path `/news`

All routes require `Authorization: Bearer <token>`.

---

#### `GET /news` — Get personalised news 🔒

Fetches the authenticated user's preferences from the database, builds a query string (`"movies AND comics AND games"`), and calls the [NewsAPI /everything endpoint](https://newsapi.org/docs/endpoints/everything).

**Caching behaviour:**
- On the **first call** for a preference set → fetches from NewsAPI, stores result in memory with a timestamp
- On **subsequent calls within 5 minutes** → returns the cached result immediately (no NewsAPI call)
- After **5 minutes** → cache entry expires and the next call refreshes it

```json
// 200
{ "message": "News retrieved successfully", "news": { "status": "ok", "totalResults": 38, "articles": [ ... ] } }

// 404 — user not found
{ "message": "User not found", "news": [] }
```

---

#### `POST /news/:id/read` — Mark as read 🔒 *(placeholder)*
#### `POST /news/:id/favourite` — Mark as favourite 🔒 *(placeholder)*
#### `GET /news/read` — Get read articles 🔒 *(placeholder)*
#### `GET /news/favourite` — Get favourite articles 🔒 *(placeholder)*
#### `POST /news/search/:keyword` — Search by keyword 🔒 *(placeholder)*

These routes are scaffolded and return placeholder responses. The NewsAPI free tier does not provide endpoints for managing read/favourite state — a future implementation would store this state in MongoDB.

---

## User Schema

Defined in `models/userModel.js` using Mongoose.

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required |
| `email` | String | Required, unique, lowercase, trimmed, must match email regex |
| `password` | String | Required, min 6 chars, must have uppercase + lowercase + number (validated before hashing) |
| `preferences` | [String] | Optional, defaults to empty array `[]` |

> **Important:** The password validator runs on the plain-text password **before** bcrypt hashing. If validation ran after hashing, every password would pass (bcrypt hashes always contain uppercase, lowercase, and numbers).

---

## Middleware

### `validateJWT`
Sits in front of all protected routes. It:
1. Reads the `Authorization` header
2. Strips the `Bearer ` prefix
3. Calls `jwt.verify()` with the `JWT_SECRET`
4. On success — attaches `{ username, email }` to `req.user` and calls `next()`
5. On failure — responds with `401 Unauthorized`

### Logger
Logs every request to the console in the format:
```
Request received: GET /users/preferences
```

---

## Testing Strategy

The test suite in `test/server.test.js` covers the full request lifecycle using **supertest** (HTTP assertions) and **mongodb-memory-server** (isolated DB).

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | POST /users/signup | New user is created successfully |
| 2 | POST /users/signup missing email | Returns 400 when email is absent |
| 3 | POST /users/login | Returns 200 and a JWT token |
| 4 | POST /users/login wrong password | Returns 401 |
| 5 | GET /users/preferences | Returns correct preferences for logged-in user |
| 6 | GET /users/preferences no token | Returns 401 |
| 7 | PUT /users/preferences | Updates preferences, returns 200 |
| 8 | Check PUT /users/preferences | Verifies update persisted correctly |
| 9 | GET /news | Returns 200 with a `news` property |
| 10 | GET /news no token | Returns 401 |


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js >= 18 |
| Framework | Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (`jsonwebtoken`) |
| Password hashing | bcrypt |
| News data | NewsAPI (`axios`) |
| Testing | tap + supertest + mongodb-memory-server |

---

## Project Structure

```
app.js                                 # Entry point — Express app + Mongoose connection
├── controllers/
│   ├── newsAggregatorController.js    # Auth & preferences logic
│   └── newsPreferenceController.js    # News fetching logic with in-memory cache
├── middleware/
│   ├── newsAggregatorMiddleWare.js    # Request logger
│   └── validateJWT.js                # JWT auth middleware
├── models/
│   └── userModel.js                  # Mongoose user schema
├── routes/
│   ├── newsAggregatorRoutes.js       # /users/* routes
│   └── newsPreferenceRoutes.js       # /news/* routes
└── test/
    └── server.test.js                # Integration tests (tap)
```

---

## Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<database>?appName=<name>
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_newsapi_key
```

---

## Installation

```bash
npm install
```

---

## Running the Server

```bash
npm start
```

Server starts on the port defined in `.env` (default `8080`).

---

## Running Tests

Tests use **mongodb-memory-server** — no real database is touched.

```bash
npm test
```

---

## API Reference

### Auth Routes — `/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/signup` | ❌ | Register a new user |
| POST | `/users/login` | ❌ | Login and receive a JWT token |
| GET | `/users/preferences` | ✅ | Get the authenticated user's preferences |
| PUT | `/users/preferences` | ✅ | Update the authenticated user's preferences |

---

#### POST `/users/signup`

**Request body:**
```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

**Password rules:** min 6 chars, must contain at least 1 uppercase, 1 lowercase, 1 number.

**Response `200`:**
```json
{ "message": "User registered successfully", "user": { ... } }
```

**Response `400`** — missing/invalid fields.

---

#### POST `/users/login`

**Request body:**
```json
{ "email": "clark@superman.com", "password": "Krypt()n8" }
```

**Response `200`:**
```json
{ "message": "Login successful", "token": "<jwt>" }
```

**Response `401`** — wrong password.  
**Response `404`** — user not found.

---

#### GET `/users/preferences`

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{ "message": "Preferences retrieved successfully", "preferences": ["movies", "comics"] }
```

---

#### PUT `/users/preferences`

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{ "preferences": ["movies", "comics", "games"] }
```

**Response `200`:**
```json
{ "message": "Preferences updated successfully", "preferences": ["movies", "comics", "games"] }
```

---

### News Routes — `/news`

All routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news` | Fetch news based on user's saved preferences |
| POST | `/news/:id/read` | Mark a news item as read *(placeholder)* |
| POST | `/news/:id/favourite` | Mark a news item as favourite *(placeholder)* |
| GET | `/news/read` | Get read news *(placeholder)* |
| GET | `/news/favourite` | Get favourite news *(placeholder)* |
| POST | `/news/search/:keyword` | Search news by keyword *(placeholder)* |

---

#### GET `/news`

Fetches news from NewsAPI using the authenticated user's saved preferences as the query.  
Results are **cached in-memory for 5 minutes** per unique preference set — repeated calls with the same preferences skip the NewsAPI call.

**Response `200`:**
```json
{ "message": "News retrieved successfully", "news": { ... } }
```

---

## User Schema

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, valid format, lowercased |
| `password` | String | Required, min 6 chars, uppercase + lowercase + number |
| `preferences` | [String] | Optional, defaults to `[]` |

---

## Caching

The `/news` endpoint uses an in-memory `Map` cache keyed by the user's preferences joined as `"pref1 AND pref2"`.

- **TTL:** 5 minutes
- **Cache hit:** returns stored result instantly, no NewsAPI call made
- **Cache miss / expired:** calls NewsAPI, stores result with timestamp

> Note: This is a process-level cache. If you scale to multiple servers, replace it with Redis.