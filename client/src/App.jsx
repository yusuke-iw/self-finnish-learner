import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Passage from './pages/Passage';
import GrammarHub from './pages/GrammarHub';
import GrammarDetail from './pages/GrammarDetail';
import GrammarPractice from './pages/GrammarPractice';
import './assets/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="logo">Finnish Learner</h1>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/grammar">Grammar & Idioms</Link></li>
            <li><Link to="/grammar/practice">Drill Studio</Link></li>
            <li><Link to="/passages">Passages</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<Session />} />
            <Route path="/passages" element={<Passage />} />
            <Route path="/grammar" element={<GrammarHub />} />
            <Route path="/grammar/practice" element={<GrammarPractice />} />
            <Route path="/grammar/:topicId" element={<GrammarDetail />} />
          </Routes>
        </main>
        <footer className="footer">© 2026 Finnish Learner</footer>
      </div>
    </Router>
  );
}

export default App;
