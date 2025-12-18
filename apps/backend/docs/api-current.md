# API Current (Backend)

Base URL: `http://localhost:3310`

Auth: JWT in httpOnly cookie `accessToken` set by login/oauth-login. Endpoints marked "Auth: yes" require a valid cookie.

---

## Auth

### POST `/auth/register`
- Auth: no
- Body (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "secret123",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "99112233",
    "accountType": "client"
  }
  ```
- Response (JSON):
  ```json
  {
    "id": "cku9s2q6j0001t8i8n8r9wqk2",
    "email": "user@example.com",
    "avatarUrl": null,
    "accessToken": "jwt.token.here"
  }
  ```
- Errors: 400 (validation, email already exists)

### POST `/auth/login`
- Auth: no
- Body (JSON):
  ```json
  { "email": "user@example.com", "password": "secret123" }
  ```
- Response (JSON) + sets cookie `accessToken`:
  ```json
  {
    "user": {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "email": "user@example.com",
      "avatarUrl": null
    }
  }
  ```
- Errors: 401 (invalid credentials)

### POST `/auth/oauth-login`
- Auth: no
- Body (JSON):
  ```json
  {
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "provider": "google",
    "avatarUrl": "https://example.com/avatar.png"
  }
  ```
- Response (JSON) + sets cookie `accessToken`:
  ```json
  {
    "user": {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "email": "user@example.com",
      "avatarUrl": "https://example.com/avatar.png"
    }
  }
  ```
- Errors: 400 (validation)

### GET `/auth/me`
- Auth: yes
- Response (JSON):
  ```json
  {
    "user": {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "99112233",
      "accountType": "client",
      "avatarUrl": "/uploads/avatars/uuid.png",
      "createdAt": "2025-12-17T09:22:00.000Z",
      "updatedAt": "2025-12-17T09:30:00.000Z"
    }
  }
  ```
- Errors: 401

### PATCH `/auth/me`
- Auth: yes
- Content-Type: `multipart/form-data`
- Body (form fields):
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `phone` (string, optional)
  - `accountType` (string, optional)
  - `removeAvatar` (string `"true"` or boolean, optional)
  - `avatar` (file, optional; image only; max 5MB)
- Response (JSON):
  ```json
  {
    "user": {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "99112233",
      "accountType": "client",
      "avatarUrl": "/uploads/avatars/uuid.png",
      "createdAt": "2025-12-17T09:22:00.000Z",
      "updatedAt": "2025-12-17T09:30:00.000Z"
    }
  }
  ```
- Errors: 400 (non-image upload), 401

### DELETE `/auth/me`
- Auth: yes
- Response (JSON):
  ```json
  { "success": true }
  ```
- Errors: 401

### POST `/auth/logout`
- Auth: no
- Response (JSON):
  ```json
  { "message": "Logout successful" }
  ```

---

## Users / Profile

### GET `/users`
- Auth: yes
- Response (JSON): array of user records as stored (includes `password` in current implementation).
  ```json
  [
    {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "email": "user@example.com",
      "password": "$2b$10$hash...",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "99112233",
      "accountType": "client",
      "avatarUrl": null,
      "createdAt": "2025-12-17T09:22:00.000Z",
      "updatedAt": "2025-12-17T09:30:00.000Z"
    }
  ]
  ```
- Errors: 401

### GET `/users/me`
- Auth: yes
- Response (JSON): JWT payload injected by guard.
  ```json
  {
    "sub": "cku9s2q6j0001t8i8n8r9wqk2",
    "email": "user@example.com",
    "firstname": "Jane",
    "lastname": "Doe",
    "phone": "99112233",
    "accountType": "client",
    "avatarUrl": "/uploads/avatars/uuid.png",
    "iat": 1734432000,
    "exp": 1734518400
  }
  ```
- Errors: 401

---

## Listings

### POST `/listings`
- Auth: yes
- Body (JSON):
  ```json
  {
    "title": "Plumber service",
    "description": "Fixing leaks and pipes",
    "price": 50000,
    "location": "Ulaanbaatar",
    "category": "network_repair"
  }
  ```
- Response (JSON):
  ```json
  {
    "id": "cku9s9m0w0002t8i8v6w8x2b1",
    "title": "Plumber service",
    "description": "Fixing leaks and pipes",
    "price": 50000,
    "location": "Ulaanbaatar",
    "category": "network_repair",
    "userId": "cku9s2q6j0001t8i8n8r9wqk2",
    "createdAt": "2025-12-17T09:45:00.000Z",
    "updatedAt": "2025-12-17T09:45:00.000Z"
  }
  ```
- Errors: 401, 400 (validation)

### GET `/listings`
- Auth: no
- Query params:
  - `category` (string, optional)
  - `page` (number >= 1, default 1)
  - `limit` (number 1..50, default 12)
  - `sort` (`newest` | `oldest`, default `newest`)
  - `legacy` (number, optional; set to `1` to return legacy response format)
- Response (JSON):
  ```json
  {
    "items": [
      {
        "id": "cku9s9m0w0002t8i8v6w8x2b1",
        "title": "Plumber service",
        "description": "Fixing leaks and pipes",
        "price": 50000,
        "location": "Ulaanbaatar",
        "category": "network_repair",
        "userId": "cku9s2q6j0001t8i8n8r9wqk2",
        "createdAt": "2025-12-17T09:45:00.000Z",
        "updatedAt": "2025-12-17T09:45:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 12
  }
  ```
- Legacy response (when `legacy=1`):
  ```json
  {
    "data": [
      {
        "id": "cku9s9m0w0002t8i8v6w8x2b1",
        "title": "Plumber service",
        "description": "Fixing leaks and pipes",
        "price": 50000,
        "location": "Ulaanbaatar",
        "category": "network_repair",
        "userId": "cku9s2q6j0001t8i8n8r9wqk2",
        "createdAt": "2025-12-17T09:45:00.000Z",
        "updatedAt": "2025-12-17T09:45:00.000Z"
      }
    ],
    "pagination": { "total": 1, "skip": 0, "take": 12 }
  }
  ```
- Errors: 400 (validation)

### GET `/listings/me`
- Auth: yes
- Response (JSON): array of listings owned by current user.
- Errors: 401

### GET `/listings/:id`
- Auth: no
- Response (JSON): listing with author info.
  ```json
  {
    "id": "cku9s9m0w0002t8i8v6w8x2b1",
    "title": "Plumber service",
    "description": "Fixing leaks and pipes",
    "price": 50000,
    "location": "Ulaanbaatar",
    "category": "network_repair",
    "userId": "cku9s2q6j0001t8i8n8r9wqk2",
    "createdAt": "2025-12-17T09:45:00.000Z",
    "updatedAt": "2025-12-17T09:45:00.000Z",
    "user": {
      "id": "cku9s2q6j0001t8i8n8r9wqk2",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "user@example.com",
      "phone": "99112233",
      "avatarUrl": "/uploads/avatars/uuid.png"
    }
  }
  ```
- Errors: 404

### PUT `/listings/:id`
- Auth: yes
- Body (JSON, all optional):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "price": 55000,
    "location": "UB",
    "category": "moving"
  }
  ```
- Response (JSON): updated listing.
- Errors: 401, 403 (not owner), 404

### DELETE `/listings/:id`
- Auth: yes
- Response (JSON):
  ```json
  { "ok": true }
  ```
- Errors: 401, 403 (not owner), 404

---

## Categories

No dedicated categories endpoint exists in the current backend.
