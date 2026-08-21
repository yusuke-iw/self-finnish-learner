# MERN Stack Development Guidelines

This document outlines the coding standards, folder structures, and best practices for developing applications using the MERN stack (MongoDB, Express, React, Node.js). Follow these rules to ensure the codebase remains clean, secure, performant, and maintainable.

---

## 1. Project Directory Structure

Use a clean separation between the frontend (client) and backend (server).

```text
self-finnish-learner/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views / Router targets
│   │   ├── context/        # React Contexts (e.g., AuthContext)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration / clients (Axios/Fetch)
│   │   ├── assets/         # Images, global styles, fonts
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                 # Express Backend (Node.js)
│   ├── src/
│   │   ├── config/         # Database and third-party API configs
│   │   ├── controllers/    # Route handlers / business logic
│   │   ├── models/         # Mongoose Schemas & models
│   │   ├── routes/         # Express Router routes
│   │   ├── middleware/     # Custom Express middlewares (Auth, Error)
│   │   └── server.js       # Express app entry point
│   ├── .env.example
│   └── package.json
├── .agents/                # Agent configurations
└── README.md
```

---

## 2. Backend (Node.js & Express) Guidelines

### A. General Principles
- **Asynchronous Code**: Use `async/await` for handling asynchronous operations. Avoid callback hell and raw promises where possible.
- **Environment Variables**: Never hardcode credentials. Use `dotenv` to load configurations from a `.env` file. Provide a `.env.example` file.

### B. Mongoose & MongoDB
- **Schema Validation**: Define proper validation rules (e.g., `required`, `trim`, `lowercase`, and custom validators) in your models.
- **Indexes**: Set up appropriate indexes (like `unique: true` for emails) to optimize queries.
- **Data Safety**: Avoid returning sensitive data (e.g., password hashes) in API responses. Utilize schema-level transforms:
  ```javascript
  userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      delete returnedObject.password;
      delete returnedObject.__v;
    }
  });
  ```

### C. Error Handling
- **Centralized Error Handler**: Never let requests hang. Catch errors in controllers using `try/catch` (or an async handler wrapper) and forward them to a global error-handling middleware.
  ```javascript
  // middleware/errorHandler.js
  const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  };
  ```
- **Consistent Response Format**: All API responses must follow a consistent JSON format:
  - Success: `{ success: true, data: { ... } }`
  - Error: `{ success: false, error: 'Error description' }`

### D. Security Best Practices
- **Middleware**: Use security middlewares such as `cors` and `helmet`.
- **Input Validation**: Use schema-based validators like `joi` or `express-validator` to validate request payloads before processing them in controllers.
- **Rate Limiting**: Apply `express-rate-limit` to sensitive routes like authentication.

---

## 3. Frontend (React with Vite) Guidelines

### A. Visuals & Design System (CRITICAL)
- **Rich Aesthetics**: Avoid browser-default styles or generic themes. Design the application with modern layouts, appropriate color contrast, subtle drop shadows, smooth hover transitions, and dark modes where appropriate.
- **Styling**: Use Vanilla CSS for components unless TailwindCSS is explicitly requested. Keep styles scoped or use CSS Modules (`Component.module.css`) to avoid namespace collision.
- **No Placeholders**: Do not leave broken images or standard placeholder blocks. Use dynamic mockups or generated assets.

### B. Routing & Page Organization
- Use `react-router-dom` for application routing.
- Keep the `pages/` folder mapped to full-page layouts, and the `components/` folder for reusable visual blocks (buttons, inputs, cards).

### C. API Communication
- Centralize API requests in a service client (e.g., Axios or Fetch instance with interceptors for authentication tokens).
- Maintain loading states, success notifications, and user-friendly error messages when doing network requests.
