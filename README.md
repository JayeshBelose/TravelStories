# TravelStories

TravelStories is a full-stack travel planning and managing web application where users can create, manage, discover, and share travel itineraries.

The application is built with a React frontend and Spring Boot backend, with PostgreSQL for persistent data storage and Cloudinary for production image storage.

## Live Application

**Frontend:** https://travel-stories.jayeshbelose2006.workers.dev/

**Backend:** https://travel-stories-backend-cvdg.onrender.com

> The backend is hosted on Render's free tier and may take some time(150 - 200 sec) to respond after a period of inactivity.

---

## Features

- User registration and authentication
- JWT-based authentication with access and refresh tokens
- User profiles
- Create and manage travel itineraries
- Multi-day itinerary planning
- Location and destination information
- Travel itinerary images and thumbnails
- Public itinerary discovery
- Search functionality
- Like and save itineraries
- Follow users
- Password reset functionality
- Protected user operations
- Rate limiting for sensitive endpoints
- Secure file and image validation
- Cloud-based production image storage

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Lucide React

### Backend

- Java 21
- Spring Boot 4
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- Maven
- Flyway
- Bucket4j
- slf4j
- Caffeine
- Apache Tika

### Database & Storage

- PostgreSQL
- Neon
- Cloudinary

### Deployment

- GitHub
- Cloudflare
- Render
- Neon
- Cloudinary

---

## Architecture

TravelStories follows a layered architecture designed to keep responsibilities separated and the application maintainable.

### Backend

Controller
↓
Service
↓
Repository
↓
PostgreSQL

Controllers handle HTTP requests, services contain application and business logic, and repositories handle database access.

### Frontend

Component
↓
Service
↓
API
↓
Spring Boot Backend

Frontend components communicate with backend services through a centralized API layer.

---

## Authentication

The application uses stateless JWT-based authentication.

User
↓
Login
↓
Access Token + Refresh Token
↓
Authenticated API Requests
↓
Spring Security

Access tokens are used for authenticated requests, while refresh tokens provide a mechanism for obtaining new access tokens after expiration.

Protected resources are secured through Spring Security and JWT authentication filters.

---

## Image Storage

Production image storage is handled through Cloudinary.

The application uses a storage abstraction so that storage implementation is separated from application services.

Application
↓
StorageService
↓
Cloudinary

Images are organized into separate categories for:

- Itinerary images
- Itinerary thumbnails
- Profile pictures

The backend controls image access and storage operations rather than exposing storage implementation details throughout the application.

---

## Database Migrations

TravelStories uses Flyway for database schema management.

Migration files are located at:

backend/
└── src/
└── main/
└── resources/
└── db/
└── migration/
└── V1\_\_initial_schema.sql

New schema changes should be introduced through new migration files.

For example:

V1**initial_schema.sql
V2**add_feature.sql
V3\_\_modify_table.sql

Previously applied production migrations should not be modified. New changes should be added as new versioned migrations.

Hibernate is configured to validate the schema rather than automatically modify it in production.

---

## Project Structure

TravelStories/
│
├── backend/
│ ├── src/
│ │ └── main/
│ │ ├── java/
│ │ │ └── org/travel_stories/
│ │ └── resources/
│ │ ├── db/
│ │ │ └── migration/
│ │ └── application.properties
│ │
│ ├── Dockerfile
│ ├── pom.xml
│ └── .env.example
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── .env.example
│
└── README.md

---

## Prerequisites

Make sure the following are installed:

- Java 21
- Maven
- Node.js
- npm
- PostgreSQL for local database development

---

## Running Locally

### 1. Clone the repository

git clone <repository-url>
cd TravelStories

### 2. Configure the backend

Navigate to the backend:

cd backend

Create a `.env` file based on `.env.example` and provide the required local configuration.

The backend uses environment variables for database credentials, authentication configuration, email configuration, storage configuration, and other environment-specific settings.

### 3. Start the backend

mvn spring-boot:run

The backend runs on: http://localhost:8080

unless a different `PORT` is configured.

### 4. Configure the frontend

Navigate to the frontend:

cd frontend

Create a `.env` file based on `.env.example`.

For local development:

env
VITE_API_BASE_URL=http://localhost:8080/api

### 5. Install frontend dependencies

npm install

### 6. Start the frontend

npm run dev

Vite will provide the local development URL in the terminal.

---

## Environment Variables

### Backend

The backend uses environment variables for production configuration.

Required configuration includes:

DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_EXPIRATION
JWT_REFRESH_EXPIRATION

CORS_ALLOWED_ORIGINS

STORAGE_PROVIDER

FILE_STORAGE_PATH

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD

PASSWORD_RESET_OTP_EXPIRATION
PASSWORD_RESET_TOKEN_EXPIRATION
PASSWORD_RESET_MAX_ATTEMPTS

SPRING_PROFILES_ACTIVE

### Frontend

VITE_API_BASE_URL

Example for local development:

env
VITE_API_BASE_URL=http://localhost:8080/api

Production environment variables are configured through the respective hosting platforms.

The repository contains `.env.example` files containing placeholders for required configuration.

---

## Production Architecture

The production application is deployed using the following architecture:

                         GitHub
                        /      \
                       ↓        ↓
                 Cloudflare    Render
                  Frontend     Backend
                                  |
                         +--------+---------+
                         |                  |
                         ↓                  ↓
                       Neon            Cloudinary
                    PostgreSQL           Images

### Frontend

The React/Vite application is deployed through Cloudflare.

### Backend

The Spring Boot application is deployed through Render using Docker.

### Database

PostgreSQL is hosted on Neon.

### Image Storage

Production images are stored in Cloudinary.

---

## Deployment

The repository is connected to the deployment platforms so that changes pushed to the main branch can be deployed through the configured Git-based deployment workflow.

### Frontend

GitHub
↓
Cloudflare
↓
React/Vite production build
↓
Cloudflare deployment

### Backend

GitHub
↓
Render
↓
Docker build
↓
Spring Boot application

### Database

When the backend starts against a production database, Flyway applies pending migrations before Hibernate validates the database schema.

---

## Production Configuration

The backend is configured for production using environment variables rather than hardcoded credentials or environment-specific secrets.

Important production configuration includes:

- Externalized database credentials
- Externalized JWT configuration
- Configurable CORS origins
- Cloudinary storage
- Flyway database migrations
- Hibernate schema validation
- Production logging levels
- Configurable server port
- Connection pooling
- Stateless authentication

The application does not rely on local filesystem storage for production images.

---

## Security

Security measures implemented in the application include:

- JWT authentication
- Refresh token authentication flow
- Spring Security
- Password hashing
- Protected API endpoints
- Configurable CORS
- Security headers
- Rate limiting
- Request validation
- File type and MIME validation
- File size restrictions
- Secure error responses
- Environment-based secrets
- Stateless authentication
- Ownership checks for user-owned resources

Sensitive credentials and authentication information are not intended to be exposed through API responses or application logs.

---

## Error Handling

The backend uses centralized exception handling to provide consistent API responses.

Common errors include:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `413 Payload Too Large`
- `429 Too Many Requests`
- `500 Internal Server Error`

Unexpected server errors are logged server-side while clients receive a generic error response instead of internal implementation details.

---

## Production Logging

Production logging is configured to provide useful application information while reducing unnecessary framework and Hibernate output.

The application avoids logging sensitive information such as:

- Passwords
- JWT secrets
- Access tokens
- Refresh tokens
- OTP values
- Database credentials
- Cloudinary credentials

---

## Render Free Tier

The backend is currently hosted using Render's free tier.

Free-tier services may sleep after a period of inactivity. Consequently, the first request after inactivity may take longer while the backend starts.

The application does not use an artificial keep-alive mechanism to prevent this behavior.

---

## Development Workflow

A typical development workflow is:

Develop
↓
Test locally
↓
Git commit
↓
Push to GitHub
↓
Cloudflare / Render deployment
↓
Verify production

Database schema changes should additionally follow the Flyway migration workflow.

---

## License

This project is currently intended as a personal portfolio and demonstration project.
