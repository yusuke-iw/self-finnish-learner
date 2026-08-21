---
name: tdd-development
description: >-
  Use this skill when you need to perform Test-Driven Development (TDD), write tests before writing implementation, run unit or integration tests, or refactor code under test coverage.
---

# TDD Development Skill

This skill provides step-by-step procedures for initializing test suites and running a Test-Driven Development loop.

---

## 1. Initial Test Setup

If testing libraries are not yet installed in the backend or frontend:

### A. Backend (Jest + Supertest)
1. Install Jest and Supertest in the `server/` directory:
   ```bash
   cd server
   npm install --save-dev jest supertest
   ```
2. Configure Jest in `server/package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watchAll"
   }
   ```

### B. Frontend (Vitest + React Testing Library)
1. Install Vitest, jsdom, and Testing Library in the `client/` directory:
   ```bash
   cd client
   npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```
2. Configure test environment in `client/vite.config.js` or `client/vitest.config.js`:
   ```javascript
   // client/vite.config.js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/setupTests.js',
     },
   })
   ```
3. Create `client/src/setupTests.js` to import Jest Dom extensions:
   ```javascript
   import '@testing-library/jest-dom';
   ```
4. Set up scripts in `client/package.json`:
   ```json
   "scripts": {
     "test": "vitest",
     "test:run": "vitest run"
   }
   ```

---

## 2. Red-Green-Refactor Workflow Execution

When implementing a feature:

### Step 2.1: Write the Test Case
1. Identify the file to modify/create (e.g. `server/src/controllers/authController.js`).
2. Create or open the corresponding test file (e.g. `server/src/controllers/__tests__/authController.test.js`).
3. Write test cases targeting the new requirement. Do not write any implementation code yet.

### Step 2.2: Verify Test Failure (Red)
1. Run the test command:
   - For backend: `npm run test` (inside `server/`)
   - For frontend: `npm run test:run` (inside `client/`)
2. Verify that the new test fails, while all existing tests pass.

### Step 2.3: Write the Implementation (Green)
1. Write the minimal production code in the target implementation file (e.g. `server/src/controllers/authController.js`) to make the test pass.
2. Run the test command again. If it fails, adjust the code until it passes.

### Step 2.4: Refactor (Refactor)
1. Clean up, re-organize, and optimize the code.
2. Run the test command to verify that everything remains green.
