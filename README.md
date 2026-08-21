# Finnish Learner

An interactive, gamified web application designed to help users learn the Finnish language. Progress from basic A2 conversational phrases all the way up to advanced C1 abstract discussions through targeted modules, scaffolded quizzes, and immersive reading comprehension exercises.

## 🚀 Product Overview

Finnish Learner is inspired by modern language-learning platforms (like Duolingo). It uses a spaced, module-based learning path to guide students through the complexities of Finnish grammar and vocabulary. The app dynamically generates interactive quizzes and provides smart, typo-tolerant feedback to ensure smooth and encouraging language acquisition.

## ✨ Main Features

- **Structured Curriculum UI:** A sleek, text-based learning path featuring 7 distinct modules ranging from A2 (Running errands, travel) to C1 (Abstract discussions, idioms). Lesson cards permanently display content overview and level options.
- **Interactive Quizzes (3 Levels):** 
  - *Level 1 (Multiple Choice):* Select the correct translation for recognition.
  - *Level 2 (Word Bank):* Construct sentences by selecting word chips in the correct order.
  - *Level 3 (Typing):* Type the Finnish translation directly with smart typo detection.
- **Progress Tracking:** Saves your progression locally in the browser, tracking your mastery (Levels 1-3) across different lessons.
- **Text-to-Speech (TTS):** High-quality, neural Finnish pronunciation powered by the Google Cloud TTS (WaveNet) API, completely hidden behind an Express proxy to protect API keys. Features smart caching and dynamic pitch variation based on sentence IDs.
- **Unit Guidebooks:** Dedicated study modals that pull sentences related to your current unit, providing you with essential vocabulary and explicit grammar notes before you start a quiz.
- **Immersive Reading Passages:** Read full Finnish texts in context, complete with toggleable English translations, native audio reading, and targeted vocabulary lists.
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
   From the root directory, run `npm run install-all`. This will install dependencies for the root, client, and server.
   
2. **Start the Application:**
   From the root directory, run `npm run dev`. This uses `concurrently` to start both the backend server (port 5000) and the frontend client (port 5173) simultaneously.
