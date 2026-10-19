import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider } from './context/LanguageContext';
import { useLanguage } from './context/useLanguage';
import './assets/App.css';

const Session = lazy(() => import('./pages/Session'));
const Review = lazy(() => import('./pages/Review'));
const WordBook = lazy(() => import('./pages/WordBook'));
const NumberPractice = lazy(() => import('./pages/NumberPractice'));
const Passage = lazy(() => import('./pages/Passage'));
const GrammarHub = lazy(() => import('./pages/GrammarHub'));
const GrammarDetail = lazy(() => import('./pages/GrammarDetail'));
const GrammarPractice = lazy(() => import('./pages/GrammarPractice'));

function RouteFallback() {
  const { t } = useLanguage();
  return (
    <div className="loading-state" role="status">
      <div className="loading-spinner" />
      <p>{t('common.loading')}</p>
    </div>
  );
}

function NavigationBar() {
  const { t } = useLanguage();

  return (
    <nav className="navbar">
      <h1 className="logo">Finnish Learner</h1>
      <ul className="nav-links">
        <li><Link to="/">{t('nav.home')}</Link></li>
        <li><Link to="/review">{t('nav.review')}</Link></li>
        <li><Link to="/words">{t('nav.words')}</Link></li>
        <li><Link to="/numbers">{t('nav.numbers')}</Link></li>
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
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sessions" element={<Session />} />
                <Route path="/review" element={<Review />} />
                <Route path="/words" element={<WordBook />} />
                <Route path="/numbers" element={<NumberPractice />} />
                <Route path="/passages" element={<Passage />} />
                <Route path="/grammar" element={<GrammarHub />} />
                <Route path="/grammar/practice" element={<GrammarPractice />} />
                <Route path="/grammar/:topicId" element={<GrammarDetail />} />
              </Routes>
            </Suspense>
          </main>
          <footer className="footer">© 2026 Finnish Learner</footer>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
