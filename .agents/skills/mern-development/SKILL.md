---
name: mern-development
description: >-
  Use this skill when you need to initialize, develop, build, run, or verify a MERN (MongoDB, Express, React, Node.js) stack application.
---

# MERN Stack Development Skill

This skill provides step-by-step workflows for setting up, developing, and running a MERN stack project.

---

## 1. Initial Project Setup

To initialize a new MERN stack application, follow these sub-steps.

### Step 1.1: Backend Structure
Initialize the Node.js project inside a `server/` directory:
1. Create the `server` directory and configure `package.json` with dependencies:
   ```bash
   npm init -y
   npm install express mongoose dotenv cors helmet
   npm install --save-dev nodemon
   ```
2. Setup the entry point `server/src/server.js` and database config in `server/src/config/db.js`.
3. Set up scripts in `server/package.json`:
   ```json
   "scripts": {
     "start": "node src/server.js",
     "dev": "nodemon src/server.js"
   }
   ```

### Step 1.2: Frontend Structure
Initialize React with Vite inside a `client/` directory:
1. Run the non-interactive Vite initialization (using `--template react`):
   ```bash
   npx -y create-vite@latest client --template react
   ```
2. Navigate to `client/` and install dependencies:
   ```bash
   npm install
   npm install axios react-router-dom
   ```

### Step 1.3: Configure Proxy (Vite Config)
Modify `client/vite.config.js` to proxy API requests to the backend server to avoid CORS issues during development:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 2. Database Connection Check

Before running the full application, verify MongoDB connectivity:
1. Create a script `server/src/config/testDb.js` or connect during server initialization in `server.js`.
2. Ensure you have MongoDB running (either locally, via Docker, or MongoDB Atlas).
3. Specify your MongoDB URI in `server/.env`:
   ```text
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/self-finnish-learner
   ```
4. Example Database configuration (`server/src/config/db.js`):
   ```javascript
   const mongoose = require('mongoose');
   const connectDB = async () => {
     try {
       await mongoose.connect(process.env.MONGO_URI);
       console.log('MongoDB successfully connected.');
     } catch (err) {
       console.error('Database connection failed:', err.message);
       process.exit(1);
     }
   };
   module.exports = connectDB;
   ```

---

## 3. Launching Development Servers

To run both the server and client concurrently:

### Option A: Manual Setup (Two Terminals)
- **Terminal 1 (Backend)**:
  `cd server && npm run dev`
- **Terminal 2 (Frontend)**:
  `cd client && npm run dev`

### Option B: Concurrent Setup (Single Root Command)
Install `concurrently` at the project root level to run both servers with a single command:
1. In the project root (`self-finnish-learner/`), initialize `package.json`:
   ```bash
   npm init -y
   npm install concurrently --save-dev
   ```
2. Configure the scripts in the root `package.json`:
   ```json
   "scripts": {
     "server": "npm run dev --prefix server",
     "client": "npm start --prefix client",
     "dev": "concurrently \"npm run server\" \"npm run client\""
   }
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```

---

## 4. Verification Checklists

Ensure the MERN setup is working properly:
- [ ] Backend server logs "MongoDB successfully connected."
- [ ] API routes (e.g., GET `/api/health`) return JSON `{ success: true }`.
- [ ] React UI is fully loaded at the port printed by Vite (typically `http://localhost:5173`).
- [ ] React UI can fetch data from backend API without CORS errors (verifying Vite proxy setup).
