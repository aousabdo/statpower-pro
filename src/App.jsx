import { useState } from 'react';
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
} from 'lucide-react';
import CalculatorPage from './pages/Calculator';
import Comparison from './pages/Comparison';
import ErrorSimulator from './pages/ErrorSimulator';
import CIExplorer from './pages/CIExplorer';
import OneSidedVsTwoSided from './pages/OneSidedVsTwoSided';
import Anova from './pages/Anova';
import ChiSquare from './pages/ChiSquare';
import Guide from './pages/Guide';

const NAV_ITEMS = [
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
  calculator: CalculatorPage,
  comparison: Comparison,
  errors: ErrorSimulator,
  ci: CIExplorer,
  onesided: OneSidedVsTwoSided,
  anova: Anova,
  chisq: ChiSquare,
  guide: Guide,
};

export default function App() {
  const [activePage, setActivePage] = useState('calculator');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = PAGES[activePage];

  const handleNav = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

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
          {NAV_ITEMS.map((item) => (
            <div key={item.id}>
              {item.section && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <item.icon />
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="https://analyticadss.com" target="_blank" rel="noopener noreferrer">
            analyticadss.com
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  );
}
