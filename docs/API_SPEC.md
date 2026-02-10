# Madadgar — API Specification

**Base URL:** `/api` (Next.js routes) or Supabase client direct

---

## Authentication

All endpoints except `POST /auth/otp/send` require a valid Supabase session (JWT in `Authorization: Bearer <token>` or cookie).

---

## 1. Auth

### 1.1 Send OTP
```http
POST /auth/otp/send
Content-Type: application/json

{
  "phone": "+923001234567"
}

Response 200:
{
  "success": true
}

Response 429:
{
  "error": "RATE_LIMIT",
  "retry_after": 60
}
```

### 1.2 Verify OTP
```http
POST /auth/otp/verify
Content-Type: application/json

{
  "phone": "+923001234567",
  "token": "123456"
}

Response 200:
{
  "session": { ... },
  "user": { "id": "uuid", "phone": "+923001234567" }
}

Response 400:
{
  "error": "INVALID_OTP"
}
```

---

## 2. Profiles

### 2.1 Get Current Profile
```http
GET /api/profiles/me

Response 200:
{
  "id": "uuid",
  "user_id": "uuid",
  "display_name": "Ali",
  "area": "DHA Phase 5",
  "city": "Lahore",
  "is_worker": false,
  "trust_score": 72.5,
  "recommendations_count": 4,
  "phone_masked": false,
  "created_at": "2025-02-01T00:00:00Z"
}
```

### 2.2 Update Profile
```http
PUT /api/profiles/me
Content-Type: application/json

{
  "display_name": "Ali Khan",
  "area": "DHA Phase 5",
  "city": "Lahore",
  "is_worker": true,
  "worker_skill": "plumber",
  "worker_intro": "10 years experience",
  "worker_rate": "500/hr",
  "availability": true,
  "phone_masked": false
}

Response 200: { "profile": { ... } }
```

### 2.3 Get Public Profile
```http
GET /api/profiles/:id

Response 200:
{
  "id": "uuid",
  "display_name": "Ali",
  "area": "DHA Phase 5",
  "city": "Lahore",
  "is_worker": true,
  "worker_skill": "plumber",
  "worker_intro": "...",
  "worker_rate": "500/hr",
  "availability": true,
  "gallery_urls": [...],
  "trust_score": 72.5,
  "recommendations_count": 4,
  "phone": "+923****567"  // masked if phone_masked
}
```

---

## 3. Feed

### 3.1 Nearby
```http
GET /api/feed/nearby?lat=31.5204&lng=74.3587&category=&radius=5000

Query params:
- lat (required): float
- lng (required): float
- category: UUID (optional)
- radius: int, default 5000 (meters)

Response 200:
{
  "items": [
    {
      "id": "uuid",
      "author_id": "uuid",
      "category_name": "Plumber",
      "post_type": "recommendation",
      "worker_name": "Rashid",
      "phone": "+923001234567",
      "area_text": "DHA Phase 5",
      "reason": "Fixed my tap in 30 mins",
      "relation_tag": "mera plumber",
      "images": [],
      "availability": true,
      "madad_count": 12,
      "distance_m": 1200,
      "avg_rating": 4.5,
      "rec_count": 3,
      "created_at": "2025-02-08T10:00:00Z"
    }
  ]
}
```

### 3.2 Top Rated
```http
GET /api/feed/top-rated?category=&city=Lahore

Response 200: { "items": [...] }
```

### 3.3 All
```http
GET /api/feed/all?category=&city=&page=1&limit=20

Response 200:
{
  "items": [...],
  "has_more": true
}
```

---

## 4. Posts

### 4.1 Create Recommendation
```http
POST /api/posts
Content-Type: application/json

{
  "post_type": "recommendation",
  "category_id": "uuid",
  "worker_name": "Rashid",
  "phone": "+923001234567",
  "lat": 31.5204,
  "lng": 74.3587,
  "area_text": "DHA Phase 5",
  "reason": "Fixed my tap in 30 mins",
  "relation_tag": "mera plumber",
  "images": ["https://..."]
}

Response 201: { "post": { ... } }

Response 429:
{
  "error": "MAX_POSTS_PER_DAY"
}
```

### 4.2 Create Self-Post
```http
POST /api/posts
Content-Type: application/json

{
  "post_type": "self",
  "category_id": "uuid",
  "phone": "+923001234567",
  "lat": 31.5204,
  "lng": 74.3587,
  "area_text": "DHA Phase 5",
  "intro": "10 years experience",
  "optional_rate": "500/hr",
  "images": ["https://..."]
}
```

### 4.3 Get Post
```http
GET /api/posts/:id

Response 200: { "post": { ... }, "ratings": [...], "user_madad": false }
```

### 4.4 Madad (Like)
```http
POST /api/posts/:id/madad

Response 200: { "madad_count": 13 }

Response 409: { "error": "ALREADY_MADAD" }
```

### 4.5 Remove Madad
```http
DELETE /api/posts/:id/madad

Response 200: { "madad_count": 12 }
```

### 4.6 Update Post (availability, etc.)
```http
PATCH /api/posts/:id
Content-Type: application/json

{
  "availability": false
}
```

---

## 5. Chat

### 5.1 Create Thread
```http
POST /api/chat/threads
Content-Type: application/json

{
  "post_id": "uuid",
  "other_user_id": "uuid"  // post author or first participant
}

Response 201: { "thread": { "id": "uuid", ... } }
```

### 5.2 List Threads
```http
GET /api/chat/threads

Response 200: { "threads": [...] }
```

### 5.3 Get Messages
```http
GET /api/chat/threads/:id/messages?before=&limit=50

Response 200: { "messages": [...], "has_more": true }
```

### 5.4 Send Message
```http
POST /api/chat/threads/:id/messages
Content-Type: application/json

{
  "content": "Hello",
  "message_type": "text"
}

// For image:
{
  "message_type": "image",
  "metadata": { "url": "https://..." }
}

// For location:
{
  "message_type": "location",
  "metadata": { "lat": 31.52, "lng": 74.35 }
}

Response 201: { "message": { ... } }
```

### 5.5 Job Done
```http
POST /api/chat/threads/:id/job-done

Response 200: { "redirect": "/ratings/new?post_id=..." }
```

---

## 6. Ratings

### 6.1 Submit Rating
```http
POST /api/ratings
Content-Type: application/json

{
  "post_id": "uuid",
  "rating": 5,
  "review_text": "Excellent work!",
  "job_done": true
}

Response 201: { "rating": { ... } }
```

### 6.2 Get Post Ratings
```http
GET /api/posts/:id/ratings

Response 200: { "ratings": [...], "avg_rating": 4.5 }
```

---

## 7. Safety

### 7.1 Report
```http
POST /api/reports
Content-Type: application/json

{
  "post_id": "uuid",
  "reason": "spam"
}

// Or report user:
{
  "user_id": "uuid",
  "reason": "harassment"
}
```

### 7.2 Block
```http
POST /api/blocks
Content-Type: application/json

{
  "blocked_id": "uuid"
}
```

### 7.3 Unblock
```http
DELETE /api/blocks/:user_id
```

---

## 8. Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | BAD_REQUEST | Invalid input |
| 401 | UNAUTHORIZED | Missing or invalid auth |
| 403 | FORBIDDEN | Not allowed |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate, already exists |
| 429 | RATE_LIMIT | Too many requests |

---

## 9. Rate Limits

| Endpoint | Limit |
|----------|-------|
| /auth/otp/send | 3/minute per phone |
| /feed/* | 30/minute |
| /posts (POST) | 3/day (enforced by DB) |
| /chat/messages | 60/minute |
| /reports | 10/minute |

---

*End of API Spec*
