# Smart Issue Tracker

A mobile ticket tracking app with a Node.js/Express API and MongoDB.

## Repository structure

- `frontend/` — React Native mobile application (Android and iOS)
- `backend/` — Express API, authentication, ticket workflows, MongoDB models, and Swagger documentation

## Requirements

- Node.js 22.11 or newer
- MongoDB, local or hosted
- Android Studio for Android development; Xcode for iOS development (macOS)

## Configure and run the backend

Create `backend/.env` (never commit it) with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-issue-tracker
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-unique-password
```

Use your hosted MongoDB connection string for `MONGODB_URI` if applicable.

```sh
cd backend
npm install
npm start
```

The API is at `http://localhost:5000`; Swagger UI is at `http://localhost:5000/api-docs`.
To create or update the initial admin account in that MongoDB database, run `npm run seed` after setting a unique `ADMIN_EMAIL` and strong `ADMIN_PASSWORD` in `backend/.env`. Keep those credentials private.

## Configure and run the mobile app

In another terminal, from the repository root:

```sh
cd frontend
npm install
npm start
```

Then run `npm run android` or `npm run ios` from `frontend/` with the relevant native development tools installed. The API host is configured in `frontend/src/services/api.js` and must be reachable from your emulator or device.

## Authentication and API testing

Register or log in using the `/api/auth` endpoints. Login returns a bearer token. In Swagger, use **Authorize** with that token to run protected operations. Endpoint definitions are in `backend/src/routes/`.

## Database records

Mongoose models in `backend/src/models/` define users, tickets, comments, notifications, SLA policies, and ticket history. The backend connects using `MONGODB_URI`; MongoDB collections are populated as the API creates records. Do not commit credentials or production data.
