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

#### Authentication
- `POST /admin/auth/login` - Admin login
- `GET /admin/auth/me` - Get current admin info
- `POST /admin/auth/create-admin` - Create new admin (superadmin only)

#### System Stats
- `GET /admin/stats` - System statistics

#### User Management
- `GET /admin/users` - List users with pagination/search
- `GET /admin/users/:id` - Get specific user
- `POST /admin/users` - Create new user
- `POST /admin/users/:id/reset` - Reset user password or Fernet key
- `DELETE /admin/users/:id` - Delete user (superadmin only)

#### Data Management
- `GET /admin/users/:id/fish?gamemode=` - Get user's fish
- `GET /admin/users/:id/crabs?gamemode=` - Get user's crabs
- `DELETE /admin/fish/:fishId` - Delete fish record
- `DELETE /admin/crab/:crabId` - Delete crab record
- `POST /admin/fish` - Create fish records
- `POST /admin/crab` - Create crab records

#### Activity & Analytics
- `GET /admin/activity?limit=` - Recent activity
- `GET /admin/leaderboard?type=fish|crab&gamemode=` - Leaderboards

#### Maintenance
- `POST /admin/tasks/recalculate` - Recalculate statistics

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
  fish-tracker:
    image: petarmc/fish-tracker:backend
    ports:
      - "10000:10000"
    environment:
      MONGO_URI: "mongodb://exampleUser:examplePass@mongo.example.com:27017/fishdb"
      CREATE_USER_API_KEY: "create-user-api-key"
      RANDOM_ORG_API_KEY: "random-org-api-key"
      FRONTEND_API_KEY: "frontend-api-key"
    restart: unless-stopped

```
Then start the service:
```bash
docker compose up -d
```

### Docker Run Command 
```bash
docker run -d \
  --name fish-tracker \
  -p 10000:10000 \
  -e MONGO_URI="mongodb://exampleUser:examplePass@mongo.example.com:27017/fishdb" \
  -e CREATE_USER_API_KEY="create-user-api-key" \
  -e RANDOM_ORG_API_KEY="random-org-api-key" \
  -e FRONTEND_API_KEY="frontend-api-key" \
  petarmc/fish-tracker:backend
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
> [!WARNING]
> All API requests must have the `x-api-key` header with a value same as the one set for the `FRONTEND_API_KEY` value or there will be a request limit on the API

### Create New User (Admin panel only)

User creation is restricted to the admin panel and admin API endpoints. Use the admin route:

**POST** `/admin/users`

This endpoint requires an authenticated admin token (see Admin section).

### Get User Fernet Key

**GET** `/get/user/key?id=<userId>&password=<password>`
Returns the user’s Fernet key (if password and ID match).

### Submit Fish

**POST** `/post/fish?id=<userId>`

#### Headers:

```
Content-Type: application/octet-stream
```

#### Body

Raw Fernet-encrypted string of:

```json
{
  "fish": "fish",
  "rarity": 1
}
```

#### Response:

```json
{
  "message": "Fish saved for user exampleUsername",
  "id": "mongoDocumentId"
}
```

### Submit Crab

**POST** `/post/crab?id=<userId>`

#### Headers:

```
Content-Type: application/octet-stream
```

#### Body

Raw Fernet-encrypted string of:

```json
{
  "fish": "crab"
}
```

#### Response:

```json
{
  "message": "Fish saved for user exampleUsername",
  "id": "mongoDocumentId"
}
```

### Get All Fish for a User

**GET** `/get/fish?id=<userId>`

#### Response:

```json
{
  "user": "user",
  "fish": [
    {
      "name": "fish",
      "rarity": "Bronze"
    }
  ]
}
```

### Get All Crabs for a User

**GET** `/get/crab?id=<userId>`

#### Response:

```json
{
  "user": "user",
  "crabs": ["crab", "crab", "crab"]
}
```

## Data Structure

### MongoDB Databases

- core_users_data
  - `users` collection: stores [name, ID, Fernet key, etc](#user-document).
- user_data_fish
  - Has all fish data for each user. One collection per username (e.g., `user`)
- user_data_crab
  - Has all data data for each user. One collection per username (e.g., `user`)

### User Document

```json
{
  "name": "user",
  "id": "uniqueGeneratedId",
  "fernetKey": "uniqueGeneratedKey",
  "password": "password"
}
```

## [Full Fish Rarity Mapping](/README.md#full-fish-rarity-mapping)

## [License](/README.md#license)
