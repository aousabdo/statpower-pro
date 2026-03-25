import { useState } from 'react';
import { FileText, Check } from 'lucide-react';

export default function ReportGenerator({ analysisType, params }) {
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    const { n, total, effectSize, power, sigLevel } = params;

    const effectLabel = getEffectLabel(analysisType, effectSize);
    const testName = getTestName(analysisType);
    const sampleDesc = getSampleDesc(analysisType, n, total, params);

    return `A priori power analysis was conducted using StatPower Pro (Analytica DSS, ${new Date().getFullYear()}) to determine the minimum sample size needed. ${testName} was planned with ${(power * 100).toFixed(0)}% power to detect ${effectLabel} at α = ${sigLevel}. The analysis indicated that ${sampleDesc}.`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
      marginTop: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <FileText size={14} />
          Methodology Paragraph
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 11, color: copied ? 'var(--success)' : 'var(--accent)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {copied ? <><Check size={12} /> Copied</> : 'Copy to clipboard'}
        </button>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
        {generateReport()}
      </p>
    </div>
  );
}

function getTestName(type) {
  const names = {
    ttest: 'An independent samples t-test',
    'ttest-one': 'A one-sample t-test',
    'ttest-paired': 'A paired samples t-test',
    paired: 'A paired samples t-test',
    correlation: 'A test for Pearson correlation',
    regression: 'A multiple regression analysis',
    anova: 'A one-way ANOVA',
    chisq: 'A chi-square test of association',
    twoprop: 'A two-proportions z-test',
    equivalence: 'A TOST equivalence test',
    reliability: 'A reliability analysis',
    abtest: 'An A/B test (two-proportions)',
    survey: 'A survey',
    bayesian: 'A Bayesian analysis',
  };
  return names[type] || 'A statistical test';
}

function getEffectLabel(type, es) {
  const size = es <= 0.2 ? 'a small' : es <= 0.5 ? 'a medium' : es <= 0.8 ? 'a large' : 'a very large';
  const metrics = {
    ttest: `${size} effect (Cohen's d = ${es})`,
    paired: `${size} effect (Cohen's d = ${es})`,
    correlation: `a correlation of r = ${es}`,
    regression: `an R² of ${es}`,
    anova: `${size} effect (Cohen's f = ${es})`,
    chisq: `${size} effect (Cohen's w = ${es})`,
    twoprop: `a difference in proportions`,
    equivalence: `equivalence within the specified margin`,
    reliability: `a target Cronbach's alpha`,
    abtest: `a relative lift of ${(es * 100).toFixed(0)}%`,
    survey: `the desired margin of error`,
    bayesian: `${size} effect (d = ${es})`,
  };
  return metrics[type] || `an effect size of ${es}`;
}

function getSampleDesc(type, n, total, params) {
  if (type === 'survey') return `${n} survey responses are required`;
  if (type === 'abtest') return `${n.toLocaleString()} visitors per variant (${total.toLocaleString()} total) are required, corresponding to approximately ${params.duration || '?'} days at ${params.dailyVisitors?.toLocaleString() || '?'} daily visitors`;
  if (type === 'anova') return `${n} participants per group (${total} total across ${params.groups || '?'} groups) are required`;
  if (total && total !== n) return `${n} participants per group (${total} total) are required`;
  return `a minimum of ${n} participants ${type === 'paired' ? '(pairs)' : ''} are required`;
}
