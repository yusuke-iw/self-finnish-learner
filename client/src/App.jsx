import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Passage from './pages/Passage';
import GrammarHub from './pages/GrammarHub';
import GrammarDetail from './pages/GrammarDetail';
import GrammarPractice from './pages/GrammarPractice';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import './assets/App.css';

function NavigationBar() {
  const { t } = useLanguage();

  return (
    <nav className="navbar">
      <h1 className="logo">Finnish Learner</h1>
      <ul className="nav-links">
        <li><Link to="/">{t('nav.home')}</Link></li>
        <li><Link to="/grammar">{t('nav.grammar')}</Link></li>
        <li><Link to="/grammar/practice">{t('nav.drillStudio')}</Link></li>
        <li><Link to="/passages">{t('nav.passages')}</Link></li>
      </ul>
      <div className="nav-actions">
        <LanguageToggle />
      </div>
    </nav>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          <NavigationBar />
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
    </LanguageProvider>
  );
}

export default App;
