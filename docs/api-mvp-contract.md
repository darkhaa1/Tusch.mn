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
