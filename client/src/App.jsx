import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Session from './components/Session';
import Passage from './components/Passage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="logo">Finnish Learner</h1>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sessions">Quiz</Link></li>
            <li><Link to="/passages">Passages</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<Session />} />
            <Route path="/passages" element={<Passage />} />
          </Routes>
        </main>
        <footer className="footer">© 2026 Finnish Learner</footer>
      </div>
    </Router>
  );
}

export default App;
