import {
  Calculator,
  BarChart3,
  AlertTriangle,
  Ruler,
  ArrowLeftRight,
  Grid3x3,
  SquareAsterisk,
} from 'lucide-react';
import { useMemo } from 'react';
import { pwrTTest, pwrAnovaTest, pwrChisqTest } from '../lib/statistics';

const cards = [
  {
    id: 'calculator',
    title: 'T-Test Calculator',
    icon: Calculator,
    desc: 'Calculate required sample size for t-tests',
    compute: () => {
      const n = pwrTTest({ d: 0.5, power: 0.8, sigLevel: 0.05, type: 'two.sample' });
      return { value: n, label: 'per group at d=0.5' };
    },
  },
  {
    id: 'comparison',
    title: 'Test Comparison',
    icon: BarChart3,
    desc: 'Compare sample sizes across t-test designs',
    compute: () => {
      const n = pwrTTest({ d: 0.5, power: 0.8, sigLevel: 0.05, type: 'two.sample' });
      return { value: n * 2, label: 'total for two-sample' };
    },
  },
  {
    id: 'errors',
    title: 'Error Simulator',
    icon: AlertTriangle,
    desc: 'Visualize Type I and Type II errors interactively',
    compute: () => ({ value: '80%', label: 'default power', raw: true }),
  },
  {
    id: 'ci',
    title: 'CI Width Explorer',
    icon: Ruler,
    desc: 'See how sample size affects estimate precision',
    compute: () => ({ value: '95%', label: 'confidence level', raw: true }),
  },
  {
    id: 'onesided',
    title: 'One vs. Two-Sided',
    icon: ArrowLeftRight,
    desc: 'Compare directional and non-directional tests',
    compute: () => {
      const two = pwrTTest({ d: 0.5, power: 0.8, sigLevel: 0.05, type: 'two.sample', alternative: 'two.sided' });
      const one = pwrTTest({ d: 0.5, power: 0.8, sigLevel: 0.05, type: 'two.sample', alternative: 'greater' });
      return { value: two - one, label: 'fewer per group (one-sided)' };
    },
  },
  {
    id: 'anova',
    title: 'ANOVA Calculator',
    icon: Grid3x3,
    desc: 'Sample size per group for one-way ANOVA',
    compute: () => {
      const n = pwrAnovaTest({ k: 3, f: 0.25, power: 0.8, sigLevel: 0.05 });
      return { value: n, label: 'per group (3 groups, f=0.25)' };
    },
  },
  {
    id: 'chisq',
    title: 'Chi-Square Calculator',
    icon: SquareAsterisk,
    desc: 'Sample size for chi-square tests of association',
    compute: () => {
      const N = pwrChisqTest({ w: 0.3, df: 1, power: 0.8, sigLevel: 0.05 });
      return { value: N, label: 'total observations (w=0.3)' };
    },
  },
];

export default function Dashboard({ onNavigate }) {
  const results = useMemo(() => cards.map(c => ({ ...c, result: c.compute() })), []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Quick overview of all statistical power analysis tools</p>
      </div>
      <div className="page-body">
        <div className="dashboard-grid">
          {results.map((card) => (
            <div
              key={card.id}
              className="dashboard-card"
              onClick={() => onNavigate(card.id)}
            >
              <div className="dashboard-card-icon">
                <card.icon size={24} />
              </div>
              <div className="dashboard-card-title">{card.title}</div>
              <div className="dashboard-card-value">
                {card.result.raw ? card.result.value : card.result.value}
              </div>
              <div className="dashboard-card-desc">
                {card.result.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
