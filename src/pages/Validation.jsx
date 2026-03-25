import { useMemo } from 'react';
import { pwrTTest, pwrAnovaTest, pwrChisqTest, pwrRTest } from '../lib/statistics';

// ─── Known G*Power 3.1 reference values ──────────────────────────────────────

const TTEST_CASES = [
  { d: 0.2, sigLevel: 0.05, power: 0.80, gpower: 394, label: 'd = 0.2, \u03b1 = 0.05, power = 0.80' },
  { d: 0.5, sigLevel: 0.05, power: 0.80, gpower: 64,  label: 'd = 0.5, \u03b1 = 0.05, power = 0.80' },
  { d: 0.8, sigLevel: 0.05, power: 0.80, gpower: 26,  label: 'd = 0.8, \u03b1 = 0.05, power = 0.80' },
  { d: 0.5, sigLevel: 0.01, power: 0.90, gpower: 105, label: 'd = 0.5, \u03b1 = 0.01, power = 0.90' },
];

const ANOVA_CASES = [
  { f: 0.10, k: 3, sigLevel: 0.05, power: 0.80, gpower: 322, label: 'f = 0.10, k = 3, \u03b1 = 0.05, power = 0.80' },
  { f: 0.25, k: 3, sigLevel: 0.05, power: 0.80, gpower: 53,  label: 'f = 0.25, k = 3, \u03b1 = 0.05, power = 0.80' },
  { f: 0.40, k: 4, sigLevel: 0.05, power: 0.80, gpower: 18,  label: 'f = 0.40, k = 4, \u03b1 = 0.05, power = 0.80' },
];

const CORRELATION_CASES = [
  { r: 0.1, sigLevel: 0.05, power: 0.80, gpower: 782, label: 'r = 0.1, \u03b1 = 0.05, power = 0.80' },
  { r: 0.3, sigLevel: 0.05, power: 0.80, gpower: 84,  label: 'r = 0.3, \u03b1 = 0.05, power = 0.80' },
  { r: 0.5, sigLevel: 0.05, power: 0.80, gpower: 29,  label: 'r = 0.5, \u03b1 = 0.05, power = 0.80' },
];

const CHISQ_CASES = [
  { w: 0.1, df: 1, sigLevel: 0.05, power: 0.80, gpower: 785, label: 'w = 0.1, df = 1, \u03b1 = 0.05, power = 0.80' },
  { w: 0.3, df: 1, sigLevel: 0.05, power: 0.80, gpower: 88,  label: 'w = 0.3, df = 1, \u03b1 = 0.05, power = 0.80' },
  { w: 0.5, df: 4, sigLevel: 0.05, power: 0.80, gpower: 45,  label: 'w = 0.5, df = 4, \u03b1 = 0.05, power = 0.80' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchStatus(spResult, gpResult) {
  const diff = Math.abs(spResult - gpResult);
  if (diff <= 1) return { symbol: '\u2713', className: 'match-exact', label: 'Exact' };
  if (diff <= 3) return { symbol: '\u2248', className: 'match-approx', label: 'Approx' };
  return { symbol: '\u2717', className: 'match-fail', label: 'Mismatch' };
}

// ─── Validation table component ──────────────────────────────────────────────

function ValidationTable({ title, unit, rows }) {
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div className="card-body">
        <h3 className="section-title" style={{ marginBottom: '1rem' }}>{title}</h3>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Parameters</th>
              <th style={{ textAlign: 'right' }}>G*Power 3.1</th>
              <th style={{ textAlign: 'right' }}>StatPower Pro</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Match</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const status = matchStatus(row.sp, row.gpower);
              return (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem' }}>{row.label}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>
                    {row.gpower} {unit}
                  </td>
                  <td className="mono" style={{ textAlign: 'right' }}>
                    {row.sp} {unit}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={status.className} title={status.label}>
                      {status.symbol}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Validation() {
  const ttestRows = useMemo(() =>
    TTEST_CASES.map(c => ({
      ...c,
      sp: pwrTTest({ d: c.d, power: c.power, sigLevel: c.sigLevel, type: 'two.sample' }),
    })),
  []);

  const anovaRows = useMemo(() =>
    ANOVA_CASES.map(c => ({
      ...c,
      sp: pwrAnovaTest({ k: c.k, f: c.f, power: c.power, sigLevel: c.sigLevel }),
    })),
  []);

  const corrRows = useMemo(() =>
    CORRELATION_CASES.map(c => ({
      ...c,
      sp: pwrRTest({ r: c.r, power: c.power, sigLevel: c.sigLevel }),
    })),
  []);

  const chisqRows = useMemo(() =>
    CHISQ_CASES.map(c => ({
      ...c,
      sp: pwrChisqTest({ w: c.w, df: c.df, power: c.power, sigLevel: c.sigLevel }),
    })),
  []);

  // Summary counts
  const allRows = [...ttestRows, ...anovaRows, ...corrRows, ...chisqRows];
  const exact = allRows.filter(r => Math.abs(r.sp - r.gpower) <= 1).length;
  const approx = allRows.filter(r => { const d = Math.abs(r.sp - r.gpower); return d > 1 && d <= 3; }).length;
  const fail = allRows.filter(r => Math.abs(r.sp - r.gpower) > 3).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Validation Against G*Power 3.1</h1>
        <p className="page-subtitle">
          StatPower Pro uses the same statistical formulas as G*Power 3.1.
          Below are side-by-side comparisons for standard test configurations.
        </p>
      </div>

      <div className="page-body">

        {/* Summary banner */}
        <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-card, #fff)' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success, #22c55e)' }}>{exact}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Exact matches (&#177;1)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning, #eab308)' }}>{approx}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Approximate (&#177;3)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-error, #ef4444)' }}>{fail}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Mismatches</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary, #111)' }}>{allRows.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Total test cases</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
          <span><span className="match-exact">{'\u2713'}</span> Exact match (&#177;1 sample)</span>
          <span><span className="match-approx">{'\u2248'}</span> Approximate (&#177;3 samples)</span>
          <span><span className="match-fail">{'\u2717'}</span> Mismatch (&gt;3 samples)</span>
        </div>

        {/* Validation tables */}
        <ValidationTable
          title="T-Test (Two-Sample, Two-Sided)"
          unit="per group"
          rows={ttestRows}
        />

        <ValidationTable
          title="ANOVA (One-Way)"
          unit="per group"
          rows={anovaRows}
        />

        <ValidationTable
          title="Correlation (Pearson r)"
          unit="total"
          rows={corrRows}
        />

        <ValidationTable
          title="Chi-Square Test"
          unit="total"
          rows={chisqRows}
        />

        {/* Methodology note */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Methodology</h3>
            <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
              StatPower Pro implements power analysis using the same noncentral distribution
              approach as Cohen (1988) and G*Power 3.1 (Faul et al., 2007). Minor differences
              of &#177;1 in sample size can occur due to ceiling vs. rounding conventions.
            </p>
            <p style={{ lineHeight: 1.7, marginBottom: '0.5rem' }}>
              All StatPower Pro values shown above are computed live in your browser using the
              same functions that power every calculator in this application. No results are
              hard-coded.
            </p>
          </div>
        </div>

        {/* References */}
        <div className="card">
          <div className="card-body">
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>References</h3>
            <ul style={{ lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0, listStyleType: 'none' }}>
              <li style={{ marginBottom: '0.5rem', textIndent: '-1.25rem', paddingLeft: '1.25rem' }}>
                Cohen, J. (1988). <em>Statistical Power Analysis for the Behavioral Sciences</em> (2nd ed.).
                Lawrence Erlbaum Associates.
              </li>
              <li style={{ textIndent: '-1.25rem', paddingLeft: '1.25rem' }}>
                Faul, F., Erdfelder, E., Lang, A.-G., &amp; Buchner, A. (2007). G*Power 3: A flexible
                statistical power analysis program. <em>Behavior Research Methods, 39</em>(2), 175–191.
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Scoped styles for match indicators */}
      <style>{`
        .match-exact {
          color: #22c55e;
          font-weight: 700;
          font-size: 1.2rem;
        }
        .match-approx {
          color: #eab308;
          font-weight: 700;
          font-size: 1.2rem;
        }
        .match-fail {
          color: #ef4444;
          font-weight: 700;
          font-size: 1.2rem;
        }
      `}</style>
    </>
  );
}
