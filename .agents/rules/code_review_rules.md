# Code Review Guidelines

This document defines the criteria, priorities, and standard checklist that the agent must use when performing code reviews. Review feedback should be constructive, specific, and actionable.

---

## 1. Code Review Checklist

### A. Security (Highest Priority)
- **Sensitive Data Exposure**: Ensure API keys, database URIs, passwords, or salts are never hardcoded. Verify they are loaded from `process.env`.
- **Input Validation**: Check that all incoming API payloads (Express routes) are properly validated (e.g., via Joi or express-validator) to prevent injections, SQL/NoSQL injections, and bad inputs.
- **Authentication & Authorization**: Verify that protected API endpoints implement proper auth middleware (e.g., JWT verification) and that users can only access their own resources.
- **XSS & CORS**: Verify that CORS configuration in Express is restricted to trusted origins, and data rendered in React is sanitized.

### B. MERN Stack Architecture
- **Layer Separation**: Check that backend logic is split correctly: router handles routes, controller handles request/response flow and business logic, model handles schemas.
- **Error Handling**: Look for uncaught promises, empty `catch` blocks, or generic `res.status(500)` responses without passing errors to the centralized middleware.
- **Schema Design**: Verify Mongoose models have appropriate validations, required fields, and logical schemas.

### C. Performance & Resource Management
- **MongoDB Queries**: Verify that appropriate indexes are defined on MongoDB collections for fields used frequently in search/filters (e.g., username, email). Ensure queries use projection (e.g., `.select('-password')`) to only load required fields.
- **React Performance**: Look out for:
  - Heavy logic inside component render paths (suggest `useMemo`).
  - Functions recreated on every render passed to children (suggest `useCallback`).
  - Missing `key` props in list renderings.

### D. Code Quality, Style & Maintainability
- **Naming Conventions**: Check for descriptive variable, function, and component names (camelCase for variables/functions, PascalCase for React components).
- **Magic Numbers/Strings**: Identify hardcoded magic numbers or configuration strings. Suggest pulling them out into constants or environment variables.
- **Duplication**: Identify duplicated logic and suggest refactoring into shared helper functions or custom hooks.

---

## 2. Review Response Format

When providing feedback to the user, structure your review comments as follows:

1. **Summary**: Provide a high-level summary of the changes (e.g., "Good implementation of Auth middleware, but 2 potential security issues found.").
2. **Review Comments**: Group issues by severity:
   - 🚨 **Critical (Security / Crashes)**: Must-fix before merge.
   - ⚠️ **Warning (Performance / Design Guidelines)**: Recommended improvements.
   - 💡 **Suggestion (Style / Refactoring)**: Non-blocking suggestions.
3. **Specific Details**:
   - Provide the file name and specific lines.
   - Explain **why** it needs to be changed.
   - Show a **concrete code example or diff block** of how to fix it.
