# Public Profile API (MVP)

## Endpoint
- `GET /users/:id/public` (public, no auth)

### Query params
- `page` (optional, default 1) — pagination for reviews
- `limit` (optional, default 10, max 20) — reviews per page

### Response (whitelist)
```json
{
  "user": {
    "id": "user_id",
    "firstName": "Бат",
    "lastName": "Болд",
    "avatarUrl": "/uploads/avatars/abc.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "verification": {
      "emailVerified": false,
      "phoneVerified": false,
      "idVerified": false
    }
  },
  "stats": {
    "listingsCount": 3,
    "completedCount": null,
    "responseRate": null,
    "ratingAvg": 4.8,
    "reviewsCount": 12
  },
  "recentListings": [
    {
      "id": "listing_id",
      "category": "moving",
      "price": 20000,
      "location": "Улаанбаатар",
      "description": "Тайлбар...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "imageUrl": "/uploads/..."
    }
  ],
  "reviews": [
    {
      "id": "review_id",
      "rating": 5,
      "comment": "Сэтгэгдэл",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "reviewer": {
        "id": "reviewer_id",
        "firstName": "Тэмүүжин",
        "lastName": "Тайван",
        "avatarUrl": "/uploads/..."
      }
    }
  ]
}
```

### Privacy
- **Never exposed**: email, phone, passwords, tokens, OAuth ids. Only the fields shown above are returned.

---

## Providers (public)

### GET `/users/providers`
- Query params:
  - `q` (string, optional) search on firstName/lastName, case-insensitive
  - `category` (string, optional) users with at least one listing in category
  - `page` (number >= 1, default 1)
  - `limit` (number 1..50, default 12)

### Response
```json
{
  "items": [
    {
      "id": "user_id",
      "firstName": "Naraa",
      "lastName": "Bat",
      "avatarUrl": "/uploads/avatars/abc.jpg",
      "location": null,
      "topCategory": "moving",
      "listingsCount": 3,
      "ratingAvg": 4.8,
      "reviewsCount": 12
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 12
}
```

### Privacy
- **Never exposed**: email, phone, passwords, tokens, OAuth ids. Only the fields shown above are returned.

---

# Admin API (MVP)

> All endpoints below require admin auth. Backend enforces `isAdmin === true` and `status === ACTIVE`.

## GET `/admin/stats`

### Response
```json
{
  "usersTotal": 120,
  "usersSuspended": 3,
  "listingsTotal": 45,
  "listingsHidden": 2,
  "messagesTotal": 980,
  "reviewsTotal": 12
}
```

## GET `/admin/users`

### Query params
- `page` (default 1)
- `limit` (default 20, max 50)
- `q` (search in firstName/lastName/email, case-insensitive)
- `status` (`ACTIVE` | `SUSPENDED`)

### Response
```json
{
  "items": [
    {
      "id": "user_id",
      "firstName": "Naraa",
      "lastName": "Bat",
      "email": "user@email.com",
      "phone": "+976...",
      "status": "ACTIVE",
      "isAdmin": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

## PATCH `/admin/users/:id/status`

### Body
```json
{
  "status": "SUSPENDED"
}
```

## GET `/admin/listings`

### Query params
- `page` (default 1)
- `limit` (default 20, max 50)
- `q` (search in description/location/category/owner name, case-insensitive)
- `status` (`ACTIVE` | `HIDDEN`)
- `category` (string)

### Response
```json
{
  "items": [
    {
      "id": "listing_id",
      "category": "moving",
      "price": 20000,
      "location": "Ulaanbaatar",
      "description": "...",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "firstName": "Naraa",
        "lastName": "Bat"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

## PATCH `/admin/listings/:id/status`

### Body
```json
{
  "status": "HIDDEN"
}
```
