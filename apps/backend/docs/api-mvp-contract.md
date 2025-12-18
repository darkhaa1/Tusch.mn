# API MVP Contract

Base URL: `http://localhost:3310`

---

## Listings

### GET `/listings`
- Auth: no
- Query params:
  - `category` (string, optional)
  - `page` (number >= 1, default 1)
  - `limit` (number 1..50, default 12)
  - `sort` (`newest` | `oldest`, default `newest`)
  - `legacy` (number, optional; `1` pour obtenir l’ancien format `{ data, pagination }`)
- Response (paginée, nouveau format):
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
- Legacy (quand `legacy=1`):
  ```json
  {
    "data": [ /* mêmes items */ ],
    "pagination": { "total": 1, "skip": 0, "take": 12 }
  }
  ```

### Ownership (listings)
- `PUT /listings/:id` et `DELETE /listings/:id` nécessitent auth.
- Si le listing n’existe pas → 404.
- Si `userId` du listing ≠ `req.user.id` → 403 Forbidden.
- Sinon l’opération est autorisée.

---

## Avatar Upload
- Endpoint: `PATCH /auth/me`
- Auth: oui
- Content-Type: `multipart/form-data`
- Champs acceptés: `firstName`, `lastName`, `phone`, `accountType`, `removeAvatar` (bool/string), `avatar` (file)
- Règles fichier avatar:
  - Types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Taille max: 2 MB
  - Nom de fichier: UUID + extension d’origine
  - En cas de remplacement ou suppression, l’ancien fichier est supprimé si stocké localement.

