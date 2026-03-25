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
  Link2,
  TrendingUp,
  Percent,
  Equal,
  Table2,
  Target,
  ArrowRightLeft,
  Sparkles,
  BrainCircuit,
  ScatterChart,
  FlaskConical,
  ClipboardList,
  Shield,
  Users,
} from 'lucide-react';
import CalculatorPage from './pages/Calculator';
import Comparison from './pages/Comparison';
import ErrorSimulator from './pages/ErrorSimulator';
import CIExplorer from './pages/CIExplorer';
import OneSidedVsTwoSided from './pages/OneSidedVsTwoSided';
import Anova from './pages/Anova';
import ChiSquare from './pages/ChiSquare';
import Guide from './pages/Guide';
import Correlation from './pages/Correlation';
import Regression from './pages/Regression';
import TwoProportions from './pages/TwoProportions';
import PairedTTest from './pages/PairedTTest';
import Equivalence from './pages/Equivalence';
import SampleSizeTable from './pages/SampleSizeTable';
import MinDetectableEffect from './pages/MinDetectableEffect';
import EffectSizeConverter from './pages/EffectSizeConverter';
import EffectSizeInterpreter from './pages/EffectSizeInterpreter';
import BayesianSampleSize from './pages/BayesianSampleSize';
import PValueDistribution from './pages/PValueDistribution';
import ABTest from './pages/ABTest';
import SurveySampleSize from './pages/SurveySampleSize';
import Reliability from './pages/Reliability';

const NAV_ITEMS = [
  { id: 'calculator', label: 'T-Test', icon: Calculator, section: 'Power Analysis' },
  { id: 'paired', label: 'Paired T-Test', icon: Users },
  { id: 'correlation', label: 'Correlation', icon: Link2 },
  { id: 'regression', label: 'Regression', icon: TrendingUp },
  { id: 'anova', label: 'ANOVA', icon: Grid3x3 },
  { id: 'chisq', label: 'Chi-Square', icon: SquareAsterisk },
  { id: 'twoprop', label: 'Two Proportions', icon: Percent },
  { id: 'equivalence', label: 'Equivalence (TOST)', icon: Equal },
  { id: 'reliability', label: 'Reliability', icon: Shield },
  { id: 'abtest', label: 'A/B Test', icon: FlaskConical, section: 'Applied Tools' },
  { id: 'survey', label: 'Survey Sample Size', icon: ClipboardList },
  { id: 'table', label: 'Sample Size Tables', icon: Table2 },
  { id: 'mde', label: 'Min. Detectable Effect', icon: Target },
  { id: 'converter', label: 'Effect Size Converter', icon: ArrowRightLeft, section: 'Effect Sizes' },
  { id: 'interpreter', label: 'Effect Size Interpreter', icon: Sparkles },
  { id: 'errors', label: 'Error Simulator', icon: AlertTriangle, section: 'Visualization' },
  { id: 'ci', label: 'CI Width Explorer', icon: Ruler },
  { id: 'onesided', label: 'One vs. Two-Sided', icon: ArrowLeftRight },
  { id: 'pvalue', label: 'P-Value Distributions', icon: ScatterChart },
  { id: 'bayesian', label: 'Bayesian Sample Size', icon: BrainCircuit, section: 'Bayesian' },
  { id: 'comparison', label: 'Test Comparison', icon: BarChart3, section: 'Reference' },
  { id: 'guide', label: 'User Guide', icon: BookOpen },
];

const PAGES = {
  calculator: CalculatorPage,
  paired: PairedTTest,
  correlation: Correlation,
  regression: Regression,
  anova: Anova,
  chisq: ChiSquare,
  twoprop: TwoProportions,
  equivalence: Equivalence,
  reliability: Reliability,
  abtest: ABTest,
  survey: SurveySampleSize,
  table: SampleSizeTable,
  mde: MinDetectableEffect,
  converter: EffectSizeConverter,
  interpreter: EffectSizeInterpreter,
  errors: ErrorSimulator,
  ci: CIExplorer,
  onesided: OneSidedVsTwoSided,
  pvalue: PValueDistribution,
  bayesian: BayesianSampleSize,
  comparison: Comparison,
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
        <span className="mobile-title">StatPower Pro</span>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">SP</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">StatPower Pro</span>
              <span className="sidebar-brand-sub">Research Design Toolkit</span>
            </div>
          </div>
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
                <item.icon size={16} />
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="https://analyticadss.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <img
              src={import.meta.env.BASE_URL + 'analytica-logo.png'}
              alt="Analytica DSS"
              style={{ height: 22 }}
            />
          </a>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>Built by Analytica DSS</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  );
}
