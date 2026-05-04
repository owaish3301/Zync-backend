# Authentication

Zync uses [Better Auth](https://www.better-auth.com) for authentication. This document is written for frontend developers implementing auth on the client side.

---

## Table of Contents

- [Overview](#overview)
- [User Roles & Status](#user-roles--status)
- [Invite System](#invite-system)
- [How to Integrate](#how-to-integrate)
- [API Reference](#api-reference)
- [Middleware & Access Control](#middleware--access-control)
- [Common Error Responses](#common-error-responses)
- [Flows](#flows)

---

## Overview

All auth routes are handled by Better Auth and are available under `/api/auth/*`.

Zync auth has three layers on top of standard email/password auth:
1. **Invite-only signups** — a valid invite code is required to register
2. **Account approval** — users invited by a regular member start as `PENDING` and need SuperAdmin approval before they can use the platform
3. **Username requirement** — users must set a username before accessing any platform features

---

## User Roles & Status

Every user has a `role` and a `status`. Both affect what a user can do.

### Role

| Value | Description |
|-------|-------------|
| `User` | Default. Standard community member. |
| `SuperAdmin` | Full platform access. Can manage users, approve signups, and generate multi-use invites. |

### Status

| Value | Description |
|-------|-------------|
| `PENDING` | Signed up but not yet approved by a SuperAdmin. Cannot access the platform. |
| `ACTIVE` | Approved. Full access. |
| `BANNED` | Access revoked. Cannot log in. |

> Users invited by a `SuperAdmin` are automatically set to `ACTIVE`. Users invited by a regular `User` start as `PENDING` and must be approved manually.

---

## Invite System

Signups are restricted to invite-only. Every new user needs a valid invite code to register.

### How invites work

1. An existing member calls `POST /api/invites` to generate an invite code
2. The response includes the `inviteCode` and `expiresAt`
3. You construct a shareable signup URL, e.g. `https://yourapp.com/signup?invite=<code>`
4. When the user lands on the signup page, extract the code from the URL
5. Send the code in the signup request body alongside the user's details

### Invite rules

| Condition | Regular User | SuperAdmin |
|-----------|-------------|------------|
| Max uses per code | 1 | Custom (set via `maxUses` in request body) |
| Expiry | 2 hours from creation | 2 hours from creation |
| Invitee status after signup | `PENDING` | `ACTIVE` |

---

==Note : This is an important decision for race condition during invite claims, if ever we want to change the number of max users that can signup from one invite code then we will need to fix the after hook in the signup auth.==What i mean by change the number of max users for a code is that - if after creating a invite code for lets say 5 user the creator decided to edit that to 6.

## How to Integrate

There are two ways to call the auth API from the frontend:

### Option 1 — Better Auth Client Library (recommended)

Better Auth provides an official client library with full TypeScript support, automatic session handling, and built-in hooks.

```bash
npm install better-auth
```

```typescript
import { createAuthClient } from "better-auth/client"

const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
})

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "Jane Doe",
  fetchOptions: {
    body: { inviteCode: "your-invite-code" }
  }
})

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123"
})

// Get session
const session = await authClient.getSession()

// Sign out
await authClient.signOut()

// Update user (e.g. set username)
await authClient.updateUser({
  username: "janedoe"
})
```

### Option 2 — Fetch / Axios

Call the API endpoints directly. See [API Reference](#api-reference) below.

---

## API Reference

### POST `/api/auth/sign-up/email`

Register a new user. Requires a valid invite code.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "yourpassword",
  "inviteCode": "uuid-invite-code"
}
```

**Success response:** `200 OK` — returns session and user object

**Error responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `BAD_REQUEST` | Missing or invalid invite code |
| `400` | `BAD_REQUEST` | Invite code has reached its use limit |
| `400` | `BAD_REQUEST` | Invite code has expired |

---

### POST `/api/auth/sign-in/email`

Log in with email and password.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "yourpassword"
}
```

**Success response:** `200 OK` — returns session and user object

**Error responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `403` | `FORBIDDEN` | Account is pending approval |
| `403` | `FORBIDDEN` | Account has been banned |
| `403` | `FORBIDDEN` | Account not found (soft deleted) |
| `401` | — | Wrong email or password (handled by Better Auth) |

---

### POST `/api/auth/sign-out`

Log out the current user. Invalidates the session.

**Headers:** Requires valid session cookie or token

**Success response:** `200 OK`

---

### GET `/api/auth/get-session`

Get the current session and user info.

**Headers:** Requires valid session cookie or token

**Success response:** `200 OK`
```json
{
  "session": { ... },
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "username": null,
    "role": "User",
    "status": "ACTIVE",
    ...
  }
}
```

Returns `null` if no active session.

---

### POST `/api/auth/update-user`

Update the current user's profile. Used to set username after signup.

**Headers:** Requires valid session cookie or token

**Request body (any combination):**
```json
{
  "username": "janedoe",
  "name": "Jane Doe",
  "image": "https://..."
}
```

**Success response:** `200 OK` — returns updated user object

---

### POST `/api/auth/change-password`

Change the current user's password.

**Headers:** Requires valid session cookie or token

**Request body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

### POST `/api/invites`

Generate a new invite code. Requires authentication, active status, and a username.

**Headers:** Requires valid session cookie or token

**Request body:**
```json
{
  "maxUses": 5
}
```

> `maxUses` is only respected for `SuperAdmin` users. For regular users it is always set to `1` regardless of what is sent.

**Success response:** `201 Created`
```json
{
  "message": "Invite created",
  "data": {
    "inviteCode": "uuid-code",
    "expiresAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

## Middleware & Access Control

The backend applies middleware in this order on protected routes:

```
validateAuth → requireActive → requireUsername → [route handler]
```

| Middleware | What it checks | Error if failed |
|------------|---------------|-----------------|
| `validateAuth` | Valid session exists | `401 UNAUTHORIZED` |
| `requireActive` | `status === "ACTIVE"` | `403 INACTIVE_USER` |
| `requireUsername` | `username !== null` | `403 USERNAME_REQUIRED` |
| `checkSuperAdmin` | `role === "SuperAdmin"` | `403 forbidden` |

> Not every route uses all middleware. `checkSuperAdmin` is only applied to admin routes.

---

## Common Error Responses

```json
// 401 — No session
{ "error": "UNAUTHORIZED", "message": "Unauthorized" }

// 403 — Account pending
{ "message": "Your account is pending approval" }

// 403 — Account banned
{ "message": "Your account has been banned" }

// 403 — Inactive user (caught by requireActive middleware)
{ "error": "INACTIVE_USER", "message": "Your account is PENDING" }

// 403 — No username set
{ "error": "USERNAME_REQUIRED", "message": "Please set a username before continuing" }

// 403 — Not a SuperAdmin
{ "error": "forbidden", "message": "Forbidden" }
```

---

## Flows

### First-time signup flow

```
1. User receives invite link: https://yourapp.com/signup?invite=<code>
2. Frontend extracts invite code from URL
3. User fills signup form (name, email, password)
4. POST /api/auth/sign-up/email with inviteCode in body
5. On success:
   - If invited by SuperAdmin → status: ACTIVE → proceed to set username
   - If invited by regular user → status: PENDING → show "awaiting approval" screen
6. Once active, if username is null → redirect to username setup screen
7. POST /api/auth/update-user with { username: "..." }
8. User can now access the platform
```

### Login flow

```
1. User submits email + password
2. POST /api/auth/sign-in/email
3. On success → store session (Better Auth handles cookie automatically)
4. Call GET /api/auth/get-session to get user object
5. Check status:
   - PENDING → show "awaiting approval" screen
   - BANNED → show "account banned" screen
   - ACTIVE → check username:
     - null → redirect to username setup
     - set → proceed to dashboard
```

### Session handling

Better Auth uses cookies for session management by default. The session cookie is set automatically on login and cleared on logout.

If you are making requests from a separate frontend origin, make sure:
- Your fetch/axios calls include `credentials: "include"`
- CORS on the backend allows your frontend origin (currently set to `*` in development)
