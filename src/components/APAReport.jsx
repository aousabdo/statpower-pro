import { useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';

const effectSizeLabel = (d) => {
  const v = Math.abs(Number(d));
  if (v < 0.2) return 'negligible';
  if (v < 0.5) return 'small';
  if (v < 0.8) return 'medium';
  return 'large';
};

const testTemplates = {
  'two-sample-t': (p, r) => {
    const sided = p.tails === 1 || p.sided === 'one' ? 'one-tailed' : 'two-tailed';
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) indicated that a minimum sample of ${r.n} participants per group (N = ${r.total || r.n * 2} total) is required to detect a ${effectSizeLabel(p.d)} effect (d = ${p.d}) with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel} (${sided}).`;
  },
  'paired-t': (p, r) => {
    const sided = p.tails === 1 || p.sided === 'one' ? 'one-tailed' : 'two-tailed';
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) indicated that a minimum sample of ${r.n} paired observations is required to detect a ${effectSizeLabel(p.d)} effect (d = ${p.d}) with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel} (${sided}).`;
  },
  'anova': (p, r) => {
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) for a one-way ANOVA with ${p.groups || p.k} groups indicated that a minimum of ${r.n} participants per group (N = ${r.total || r.n * (p.groups || p.k)} total) is required to detect a ${effectSizeLabel(p.f)} effect (f = ${p.f}) with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel}.`;
  },
  'correlation': (p, r) => {
    const sided = p.tails === 1 || p.sided === 'one' ? 'one-tailed' : 'two-tailed';
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) indicated that a minimum sample of ${r.n} participants is required to detect a correlation of r = ${p.r} with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel} (${sided}).`;
  },
  'chi-square': (p, r) => {
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) for a chi-square test with ${p.df} degree(s) of freedom indicated that a minimum sample of ${r.n} participants is required to detect a ${effectSizeLabel(p.w)} effect (w = ${p.w}) with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel}.`;
  },
  'regression': (p, r) => {
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) for multiple regression with ${p.predictors} predictors indicated that a minimum sample of ${r.n} participants is required to detect a ${effectSizeLabel(p.f2)} effect (f\u00b2 = ${p.f2}) with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel}.`;
  },
  'two-proportions': (p, r) => {
    return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) indicated that a minimum of ${r.n} participants per group (N = ${r.total || r.n * 2} total) is required to detect the difference between proportions of ${p.p1} and ${p.p2} with ${(p.power * 100).toFixed(0)}% power at \u03b1 = ${p.alpha || p.sigLevel}.`;
  },
};

function buildGenericReport(testName, params, result) {
  const power = params.power ? `${(params.power * 100).toFixed(0)}%` : '80%';
  const alpha = params.alpha || params.sigLevel || 0.05;
  const n = result.n || result.sampleSize || '?';
  const total = result.total || n;
  return `A priori power analysis using StatPower Pro (Analytica DSS, 2026) for a ${testName} indicated that a minimum sample of ${n} (N = ${total} total) is required with ${power} power at \u03b1 = ${alpha}.`;
}

export default function APAReport({ testName, testType, params, result }) {
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    const template = testTemplates[testType];
    if (template) {
      return template(params, result);
    }
    return buildGenericReport(testName || testType || 'statistical test', params, result);
  };

  const handleCopy = async () => {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: copied ? 'var(--success)' : 'var(--bg-tertiary)',
    color: copied ? '#fff' : 'var(--text-secondary)',
    border: copied ? '1px solid var(--success)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    transition: 'all 0.2s',
  };

  const Icon = copied ? Check : ClipboardCopy;

  return (
    <button style={buttonStyle} onClick={handleCopy} title="Copy APA-style methods paragraph">
      <Icon size={14} />
      {copied ? 'Copied!' : 'Copy APA Report'}
    </button>
  );
}
