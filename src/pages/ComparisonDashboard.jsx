import { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrTTest, pwrAnovaTest, pwrChisqTest, pwrRTest } from '../lib/statistics';

const COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#be185d',
];

export default function ComparisonDashboard() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const results = useMemo(() => {
    const data = [];

    // T-Test (two-sample)
    try {
      const n = pwrTTest({ d: effectSize, power, sigLevel, type: 'two.sample' });
      data.push({ test: 'T-Test (two-sample)', perGroup: n, total: n * 2 });
    } catch { /* skip */ }

    // T-Test (paired)
    try {
      const n = pwrTTest({ d: effectSize, power, sigLevel, type: 'paired' });
      data.push({ test: 'T-Test (paired)', perGroup: n, total: n });
    } catch { /* skip */ }

    // Correlation (use d/2 as approx r)
    try {
      const r = Math.min(effectSize / 2, 0.99);
      if (r > 0) {
        const n = pwrRTest({ r, power, sigLevel });
        data.push({ test: 'Correlation', perGroup: n, total: n });
      }
    } catch { /* skip */ }

    // ANOVA (3 groups, use d/2 as f)
    try {
      const f = effectSize / 2;
      if (f > 0) {
        const n = pwrAnovaTest({ k: 3, f, power, sigLevel });
        data.push({ test: 'ANOVA (3 groups)', perGroup: n, total: n * 3 });
      }
    } catch { /* skip */ }

    // ANOVA (5 groups)
    try {
      const f = effectSize / 2;
      if (f > 0) {
        const n = pwrAnovaTest({ k: 5, f, power, sigLevel });
        data.push({ test: 'ANOVA (5 groups)', perGroup: n, total: n * 5 });
      }
    } catch { /* skip */ }

    // Chi-Square (df=1, use d as w)
    try {
      const n = pwrChisqTest({ w: effectSize, df: 1, power, sigLevel });
      data.push({ test: 'Chi-Square (df=1)', perGroup: n, total: n });
    } catch { /* skip */ }

    return data;
  }, [effectSize, power, sigLevel]);

  const chartData = useMemo(() => {
    return results.map((r) => ({
      test: r.test,
      'Sample Size': r.total,
    }));
  }, [results]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Multi-Test Comparison</h1>
        <p className="page-subtitle">Compare sample size requirements across different statistical tests</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          {/* Parameters */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider
                label="Standardized Effect Size"
                sublabel="Cohen's d (converted for other tests)"
                value={effectSize}
                onChange={setEffectSize}
                min={0.1}
                max={2.0}
                step={0.05}
              />
              <Slider
                label="Power"
                sublabel="1 - &beta;"
                value={power}
                onChange={setPower}
                min={0.5}
                max={0.99}
                step={0.01}
              />
              <Slider
                label="Significance Level"
                sublabel="&alpha;"
                value={sigLevel}
                onChange={setSigLevel}
                min={0.01}
                max={0.1}
                step={0.01}
              />

              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                Effect sizes are converted across tests: d for t-tests, r = d/2 for correlation, f = d/2 for ANOVA, w = d for chi-square.
              </div>
            </div>
          </div>

          {/* Results */}
          <div ref={exportRef}>
            {results.length > 0 ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Chart */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Sample Size Comparison</h2>
                      <p className="card-subtitle">Total participants required by test type</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="multi-test-comparison" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative', height: Math.max(250, results.length * 50) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
                          barSize={28}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Total N', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <YAxis
                            dataKey="test"
                            type="category"
                            tick={{ fontSize: 12, fill: '#52525b' }}
                            width={130}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                            formatter={(value) => [value.toLocaleString(), 'Total N']}
                          />
                          <Bar dataKey="Sample Size" radius={[0, 6, 6, 0]}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                        <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="card">
                  <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Sample Size (per group)</th>
                          <th>Total N</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i}>
                            <td>{r.test}</td>
                            <td className="mono">{r.perGroup.toLocaleString()}</td>
                            <td className="mono">{r.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div className="stat-card">
                    <div className="stat-value">{Math.min(...results.map(r => r.total)).toLocaleString()}</div>
                    <div className="stat-label">Minimum Total N</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.round(results.reduce((s, r) => s + r.total, 0) / results.length).toLocaleString()}</div>
                    <div className="stat-label">Average Total N</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.max(...results.map(r => r.total)).toLocaleString()}</div>
                    <div className="stat-label">Maximum Total N</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>No Results</h3>
                  <p>Adjust the parameters to see sample size comparisons across test types</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
