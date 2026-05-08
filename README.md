# ScholarHub Portal

ScholarHub is now a full-stack scholarship management platform with:

- React frontend with responsive student and admin routes
- Spring Boot REST API with JWT authentication
- MongoDB persistence for users, scholarships, applications, documents, and activities
- Admin panel for reviewing applications, verifying documents, and managing scholarships
- File upload validation for student documents

## Tech Stack

- Frontend: React, React Router, Testing Library
- Backend: Spring Boot, Spring Security, Spring Validation, Spring Data MongoDB
- Database: MongoDB
- Deployment: Docker, Docker Compose, Nginx

## Local Development

### 1. Start MongoDB

Run MongoDB with a `scholarhub` database available to the backend.

If you prefer Docker:

```bash
docker run -d --name scholarhub-mongo -p 27017:27017 mongo:7
```

### 2. Start the backend

```bash
cd /Users/vikasgayri/scholarship-portal/backend
mvn spring-boot:run
```

The API uses `https://scholarship-portal-zrng.onrender.com` for production deployments.

If port `8080` is already occupied, stop the existing service first. For example,
if Homebrew Tomcat is running:

```bash
brew services stop tomcat
```

### 3. Start the frontend

From the repo root:

```bash
cd /Users/vikasgayri/scholarship-portal
npm start
```

The app runs through the React dev server during development.
API requests use `REACT_APP_API_BASE_URL`, which defaults to
`https://scholarship-portal-zrng.onrender.com`.

## Useful Scripts

From the repo root:

```bash
npm start
npm run start:backend
npm run build
npm run build:backend
npm run test:frontend
npm run test:backend
```

## Environment Variables

Frontend:

- `REACT_APP_API_BASE_URL=https://scholarship-portal-zrng.onrender.com`

Backend:

- `SPRING_DATA_MONGODB_URI=mongodb+srv://user:password@cluster.example.com/scholarhub`
- `APP_JWT_SECRET=scholarhub-secret-key-change-me-at-least-32-characters`
- `APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.example`
- `SPRING_MAIL_USERNAME=your-gmail-address@gmail.com`
- `SPRING_MAIL_PASSWORD=your-gmail-app-password`
- `APP_MAIL_FROM=your-gmail-address@gmail.com`

For Gmail delivery, create a Gmail App Password and use it as
`SPRING_MAIL_PASSWORD`; do not use your normal Google account password. On
Render, add these backend environment variables in the service dashboard.

See [.env.example](/Users/vikasgayri/scholarship-portal/.env.example).

## Core Features

### Student

- Register and log in with a real account
- View dashboard metrics and recent activity
- Browse scholarships from the backend
- Submit validated applications
- Upload PDF/JPG/PNG supporting documents
- Update student profile details

### Admin

- View system overview stats
- Review and update application statuses
- Verify or reject student documents
- Create and update scholarships

## Running With Docker Compose

From the repo root:

```bash
docker compose up --build
```

This starts:

- MongoDB on port `27017`
- Spring Boot API on port `8080`
- Frontend on port `3000`

## Testing

Frontend:

```bash
npm run test:frontend
```

Backend:

```bash
cd /Users/vikasgayri/scholarship-portal/backend
mvn test
```

## API Shape

Public routes:

- `GET /api/scholarships`
- `GET /api/public/scholarships`
- `POST /api/auth/register`
- `POST /api/auth/login`

Student routes:

- `GET /api/student/dashboard`
- `GET /api/student/applications`
- `POST /api/student/applications`
- `GET /api/applications/user/{userId}`
- `POST /api/applications`
- `GET /api/student/documents`
- `POST /api/student/documents`
- `GET /api/files/{filename}`
- `GET /api/student/profile`
- `PUT /api/student/profile`

Admin routes:

- `GET /api/admin/overview`
- `GET /api/admin/applications`
- `PATCH /api/admin/applications/{id}/status`
- `PUT /api/admin/application/{id}/status`
- `GET /api/admin/documents`
- `PATCH /api/admin/documents/{id}/status`
- `GET /api/admin/scholarships`
- `POST /api/admin/scholarships`
- `PUT /api/admin/scholarships/{id}`
