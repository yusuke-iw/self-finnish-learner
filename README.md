# Finnish Learner

An interactive, gamified web application designed to help users learn the Finnish language. Progress from basic A2 conversational phrases all the way up to advanced C1 abstract discussions through targeted modules, scaffolded quizzes, and immersive reading comprehension exercises.

## 🚀 Product Overview

Finnish Learner is inspired by modern language-learning platforms (like Duolingo). It uses a spaced, module-based learning path to guide students through the complexities of Finnish grammar and vocabulary. The app dynamically generates interactive quizzes and provides smart, typo-tolerant feedback to ensure smooth and encouraging language acquisition.

## ✨ Main Features

- **Gamified Learning Path:** A structured, vertical curriculum featuring 7 distinct modules ranging from A2 (Running errands, travel) to C1 (Abstract discussions, idioms).
- **Interactive Quizzes (3 Levels):** 
  - *Multiple Choice:* Select the correct translation.
  - *Word Bank:* Construct sentences by selecting word chips in the correct order.
  - *Typing:* Type the Finnish translation directly with smart typo detection.
- **Immersive Reading Passages:** Read full Finnish texts in context, complete with toggleable English translations and targeted vocabulary lists.
- **Typo Tolerance:** Uses Levenshtein distance algorithms to forgive minor typos (like missing a double consonant or mixing up ä/a) while still reinforcing the perfect answer.
- **Premium Dark Mode UI:** A beautiful, responsive interface featuring an "aurora-inspired" dark theme, micro-animations, and glassmorphism.

## 🛠️ Technology Used

This project is built using the **MERN** stack (with Vite replacing Create React App).

**Frontend:**
- **React 19:** Component-based UI.
- **Vite:** Extremely fast frontend tooling and bundling.
- **React Router DOM:** For seamless single-page application (SPA) routing.
- **Zustand:** Lightweight state management.
- **Vanilla CSS:** Custom design system utilizing CSS variables for consistent theming.

**Backend:**
- **Node.js & Express:** RESTful API architecture.
- **MongoDB & Mongoose:** NoSQL database for storing user progress, sentences, and passages.
- **Jest & Supertest:** For robust backend API testing and test-driven development (TDD).

## 📦 Getting Started

1. **Install Dependencies:**
   Run `npm install` in both the root, `client`, and `server` directories.
   
2. **Start the Backend Server:**
   Navigate to `/server` and run `npm run dev`. The server will run on port 5000 (with an automatic memory-fallback mode if MongoDB is not connected).
   
3. **Start the Frontend Client:**
   Navigate to `/client` and run `npm run dev`. The Vite dev server will start on port 5173.
