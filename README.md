# CRM Application

A Role-Based Modular CRM built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Project Structure
- `client/`: Contains the React/Vite frontend application.
- `server/`: Contains the Express/Node.js backend application.

## Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

## Environment Setup
In the `server/` directory, create a `.env` file based on `server/.env.example`:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

## Installation
Run the following command from the root directory to install all dependencies for the workspace (root, client, server):
```bash
npm run install:all
```

## Development
Start both the client and server concurrently from the root directory:
```bash
npm run dev
```

Alternatively, you can run them individually:
```bash
npm run client
npm run server
```

## Production Build
To build the frontend for production:
```bash
cd client
npm run build
```
