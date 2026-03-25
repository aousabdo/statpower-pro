import { useState, useRef, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pvalueDistribution } from '../lib/statistics';

export default function PValueDistribution() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [sampleSize, setSampleSize] = useState(50);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const dist = pvalueDistribution({ effectSize, n: sampleSize, sigLevel });
    setResult(dist);
  };

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.h0.map((point, i) => ({
      x: point.x,
      h0: point.density,
      h1: result.h1[i]?.density || 0,
    }));
  }, [result]);

  const typeIRate = sigLevel;
  const power = result?.powerArea || 0;
  const typeIIRate = Math.round((1 - power) * 10000) / 10000;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">P-Value Distribution Simulator</h1>
        <p className="page-subtitle">Visualize how p-values behave under null and alternative hypotheses</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider
                label="Effect Size"
                sublabel="Cohen's d"
                value={effectSize}
                onChange={setEffectSize}
                min={0}
                max={2.0}
                step={0.05}
              />

              <Slider
                label="Sample Size"
                sublabel="n per group"
                value={sampleSize}
                onChange={setSampleSize}
                min={10}
                max={500}
                step={5}
                format={v => Math.round(v)}
              />

              <Slider
                label="Significance Level"
                sublabel="\u03b1"
                value={sigLevel}
                onChange={setSigLevel}
                min={0.01}
                max={0.1}
                step={0.01}
              />

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>
                Simulate
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {result ? (
              <div className="animate-in" ref={exportRef}>
                {/* Stats */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card">
                    <div className="stat-value" style={{ color: '#059669' }}>{(power * 100).toFixed(1)}%</div>
                    <div className="stat-label">Power (1 - \u03b2)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ color: '#dc2626' }}>{(typeIRate * 100).toFixed(1)}%</div>
                    <div className="stat-label">Type I Error (\u03b1)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ color: '#d97706' }}>{(typeIIRate * 100).toFixed(1)}%</div>
                    <div className="stat-label">Type II Error (\u03b2)</div>
                  </div>
                </div>

                {/* P-value distribution chart */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">P-Value Density</h2>
                      <p className="card-subtitle">Distribution of p-values under H\u2080 and H\u2081</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="pvalue-distribution" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container-tall" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis
                            dataKey="x"
                            type="number"
                            domain={[0, 1]}
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'P-Value', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                            formatter={(v, name) => [v.toFixed(4), name === 'h0' ? 'H\u2080 (null)' : 'H\u2081 (alternative)']}
                            labelFormatter={(v) => `p = ${v}`}
                          />
                          <ReferenceLine
                            x={sigLevel}
                            stroke="#dc2626"
                            strokeDasharray="5 5"
                            label={{ value: `\u03b1 = ${sigLevel}`, position: 'top', fontSize: 11, fill: '#dc2626' }}
                          />
                          <Area type="monotone" dataKey="h0" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeWidth={2} name="H\u2080 (null)" dot={false} />
                          <Area type="monotone" dataKey="h1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="H\u2081 (alternative)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                        <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="card animate-in">
                  <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 12 }}>
                      <strong>Under H\u2080 (null hypothesis):</strong> P-values follow a uniform distribution between 0 and 1, shown by the flat grey line. Only {(sigLevel * 100).toFixed(0)}% of p-values fall below the significance threshold by chance.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                      <strong>Under H\u2081 (alternative hypothesis):</strong> P-values are skewed toward 0, shown by the indigo curve. The proportion of p-values below \u03b1 = {sigLevel} equals the statistical power ({(power * 100).toFixed(1)}%).
                    </p>
                    <p>
                      The vertical red line marks the significance level. Increasing the effect size or sample size pushes the H\u2081 distribution further left, increasing power.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your Simulation</h3>
                  <p>Set your parameters and click Simulate to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
