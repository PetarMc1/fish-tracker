# Fish Tracker API

![License](https://img.shields.io/github/license/PetarMc1/fish-tracker)
[![Discord](https://img.shields.io/discord/1281676657169535097?logo=Discord&logoColor=white&label=Discord&labelColor=blue&color=green&cacheSeconds=10)](https://discord.gg/Uah2dNRhFV)

A secure REST API for encrypted storage and retrieval of submitted **fish** and **crab** data. Built with Node.js, Express, MongoDB, and Fernet encryption.

## Admin Panel Setup

The API includes a comprehensive admin panel for managing users, data, and system statistics.

### Creating Admin Users

1. **Initial Setup**: Create your first superadmin user:
   ```bash
   node create-admin.js [username] [password]
   ```
   Default: `node create-admin.js admin admin123`

2. **Via API**: Superadmins can create additional admin users through the admin panel or API:
   ```bash
   POST /admin/auth/create-admin
   Authorization: Bearer <superadmin-token>
   {
     "username": "newadmin",
     "password": "securepass",
     "role": "admin"
   }
   ```

### Admin Roles

- **superadmin**: Full access to all features including user deletion and creating new admins
- **admin**: Access to most features except user deletion and admin creation

### Admin API Endpoints

> All admin routes require Bearer auth **and** `x-csrf-token`, except `POST /v1/admin/auth/login` and `GET /v1/admin/auth/csrf-token`.

#### Authentication (v1)
- `GET /v1/admin/auth/csrf-token` - Fetch CSRF token
- `POST /v1/admin/auth/login` - Admin login
- `GET /v1/admin/auth/me` - Get current admin info
- `POST /v1/admin/auth/create-admin` - Create new admin (superadmin only)

#### System Stats (v1)
- `GET /v1/admin/stats` - System statistics

#### User Management (v1)
- `GET /v1/admin/users` - List users with pagination/search
- `GET /v1/admin/users/:id` - Get specific user
- `POST /v1/admin/users` - Create new user
- `POST /v1/admin/users/:id/reset` - Reset user password or Fernet key
- `DELETE /v1/admin/users/:id` - Delete user (superadmin only)

#### Data Management (v1)
- `GET /v1/admin/users/:id/fish?gamemode=` - Get user's fish
- `GET /v1/admin/users/:id/crabs?gamemode=` - Get user's crabs
- `DELETE /v1/admin/fish/:fishId` - Delete fish record
- `DELETE /v1/admin/crab/:crabId` - Delete crab record
- `POST /v1/admin/fish` - Create fish records
- `POST /v1/admin/crab` - Create crab records

#### Activity & Analytics (v1)
- `GET /v1/admin/leaderboard?type=fish|crab&gamemode=` - Leaderboards

**v2 (dev) endpoints** mirror the v1 admin routes under `/v2/admin/...` and also require Bearer auth plus `x-csrf-token`.

### Environment Variables

Add these to your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend Admin Panel

Access the admin panel at `/admin` in your frontend application. The panel includes:

- **Stats Dashboard**: System overview with user/fish/crab counts
- **User Management**: Search, view, create, reset, and delete users
- **Data Management**: View and manage user fish/crab data
- **Activity Monitoring**: Recent activity and leaderboards
- **Maintenance**: System tasks and admin user creation

All admin routes require JWT authentication with Bearer tokens.

## Docker Deployment

### Docker Compose (Recommended)
Create `docker-compose.yml`:
```yml
version: "3.9"

services:
   fish-tracker-backend:
      image: petarmc/fish-tracker-backend:1.x.x
      ports:
         - "10000:10000"
      environment:
         MONGO_URI: "mongodb://exampleUser:examplePass@mongo.example.com:27017/fishdb"
         RANDOM_ORG_API_KEY: "random-org-api-key"
         FRONTEND_API_KEY: "frontend-api-key"
         JWT_SECRET: "your-super-secret-jwt-token"
         ALLOWED_ORIGIN: "https://your-frontend-domain.com" # optional
         RATE_LIMIT_WINDOW: 5  # optional otherwise defaults to 5 minutes
         RATE_LIMIT_MAX_REQUESTS: 25   # optional otherwise defaults to 25 requests per window
         PORT: 10000  # optional, if you change it here, change the port mapping above too
      restart: unless-stopped
```
Then start the service:
```bash
docker compose up -d
```

### Docker Run Command 
```bash
docker run -d \
   --name fish-tracker-backend \
   -p 10000:10000 \
   -e MONGO_URI="mongodb://exampleUser:examplePass@mongo.example.com:27017/fishdb" \
   -e RANDOM_ORG_API_KEY="random-org-api-key" \
   -e FRONTEND_API_KEY="frontend-api-key" \
   -e JWT_SECRET="your-super-secret-jwt-token" \
   # -e ALLOWED_ORIGIN="https://your-frontend-domain.com" \
   # -e PORT=10000 \
   # -e RATE_LIMIT_WINDOW=5 \
   # -e RATE_LIMIT_MAX_REQUESTS=25 \
   --restart unless-stopped \
   petarmc/fish-tracker-backend:1.x.x
```



## Installation (For local use)

You can selfhost the API if you dont want to use my instance.

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
RANDOM_ORG_API_KEY=your_random_org_api_key
CREATE_USER_API_KEY=your_secure_user_creation_key
```

### Run the Server

```bash
node index.js
```

Default port is 10000. The server runs on http://0.0.0.0:10000.

## API Endpoints
For information on available API endpoints, refer to the [API Documentation](https://docs.petarmc.com/fish-tracker/backend/api).

## Data Structure
For information on the data structure and encryption methods, refer to the [Data Structure documentation](https://docs.petarmc.com/fish-tracker/backend/models).

## [Full Fish Rarity Mapping](/README.md#full-fish-rarity-mapping)

## [License](/README.md#license)
