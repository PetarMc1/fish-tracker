# Fish Tracker API
![License](https://img.shields.io/github/license/PetarMc1/fish-tracker)
[![Discord](https://img.shields.io/discord/1281676657169535097?logo=Discord&logoColor=white&label=Discord&labelColor=blue&color=green&cacheSeconds=10)](https://discord.gg/Uah2dNRhFV)


A secure REST API for encrypted storage and retrieval of submitted **fish** and **crab** data. Built with Node.js, Express, MongoDB, and Fernet encryption.

## Security
- The API recieves encrypted data then decrypts it and puts into a database.

## Installation (For local use)
You can selfhost the API if you dont want to  use my instance.

### Install Dependencies

```bash
npm install
```


### Environment Setup
Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
RANDOM_ORG_API_KEY=your_random_org_api_key
CREATE_USER_API_KEY=your_secure_user_creation_key
```

### Run the Server

```
node index.js
```

Default port is 10000. The server runs on http://0.0.0.0:10000.

## API Endpoints

### Create New User
**POST** `/create/new/user`
Creates a new user with a unique ID and Fernet encryption key.

#### Required Headers:
```
x-api-key: <CREATE_USER_API_KEY>
```

#### Body:
```json
{
  "name": "exampleUsername"
}
```

#### Response:
```json
{
  "name": "exampleUsername",
  "id": "randomGeneratedId",
  "fernetKey": "base64EncodedKey"
}
```

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
  "fish": "crab",
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
	"crabs": [
		"crab",
		"crab",
		"crab"
    ]
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

## [License](/README.md#license)
