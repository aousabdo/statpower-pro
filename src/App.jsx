import { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  BarChart3,
  AlertTriangle,
  Ruler,
  ArrowLeftRight,
  Grid3x3,
  SquareAsterisk,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/Calculator';
import Comparison from './pages/Comparison';
import ErrorSimulator from './pages/ErrorSimulator';
import CIExplorer from './pages/CIExplorer';
import OneSidedVsTwoSided from './pages/OneSidedVsTwoSided';
import Anova from './pages/Anova';
import ChiSquare from './pages/ChiSquare';
import Guide from './pages/Guide';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'calculator', label: 'T-Test Calculator', icon: Calculator, section: 'Power Analysis' },
  { id: 'comparison', label: 'Test Comparison', icon: BarChart3 },
  { id: 'errors', label: 'Error Simulator', icon: AlertTriangle, section: 'Visualization' },
  { id: 'ci', label: 'CI Width Explorer', icon: Ruler },
  { id: 'onesided', label: 'One vs. Two-Sided', icon: ArrowLeftRight },
  { id: 'anova', label: 'ANOVA', icon: Grid3x3, section: 'Advanced Tests' },
  { id: 'chisq', label: 'Chi-Square', icon: SquareAsterisk },
  { id: 'guide', label: 'User Guide', icon: BookOpen, section: 'Reference' },
];

const PAGES = {
  dashboard: null, // handled separately because of onNavigate prop
  calculator: CalculatorPage,
  comparison: Comparison,
  errors: ErrorSimulator,
  ci: CIExplorer,
  onesided: OneSidedVsTwoSided,
  anova: Anova,
  chisq: ChiSquare,
  guide: Guide,
};

function getInitialTheme() {
  const stored = localStorage.getItem('statpower-theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialPage() {
  const hash = window.location.hash.replace('#', '');
  return PAGES.hasOwnProperty(hash) ? hash : 'dashboard';
}

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('statpower-theme', theme);
  }, [theme]);

  // Hash routing
  useEffect(() => {
    window.location.hash = activePage;
  }, [activePage]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (PAGES.hasOwnProperty(hash)) setActivePage(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((s) => !s);
        return;
      }

      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= NAV_ITEMS.length) {
        e.preventDefault();
        setActivePage(NAV_ITEMS[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  const handleNav = useCallback((id) => {
    setActivePage(id);
    setSidebarOpen(false);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const ActiveComponent = PAGES[activePage];

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img src="/logo-color.png" alt="Analytica DSS" style={{ height: 28 }} />
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="https://analyticadss.com" target="_blank" rel="noopener noreferrer" className="sidebar-brand">
            <img src="/logo-color.png" alt="Analytica Data Science Solutions" className="sidebar-logo" />
          </a>
          <div className="sidebar-app-name">StatPower Pro</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, idx) => (
            <div key={item.id}>
              {item.section && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                title={`Press ${idx + 1}`}
              >
                <item.icon />
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="theme-toggle" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts">
              <HelpCircle size={14} />
            </button>
          </div>
          <a href="https://analyticadss.com" target="_blank" rel="noopener noreferrer">
            analyticadss.com
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {activePage === 'dashboard' ? (
          <Dashboard onNavigate={handleNav} />
        ) : (
          <ActiveComponent />
        )}
      </main>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Keyboard Shortcuts</h2>
            {NAV_ITEMS.map((item, idx) => (
              <div key={item.id} className="shortcut-row">
                <span>{item.label}</span>
                <span className="shortcut-key">{idx + 1}</span>
              </div>
            ))}
            <div className="shortcut-row">
              <span>Show this dialog</span>
              <span className="shortcut-key">?</span>
            </div>
            <div className="shortcut-row">
              <span>Close this dialog</span>
              <span className="shortcut-key">Esc</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
