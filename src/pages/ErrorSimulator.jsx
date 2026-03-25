import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { errorSimulation } from '../lib/statistics';

export default function ErrorSimulator() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [sampleSize, setSampleSize] = useState(30);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    return errorSimulation({ effectSize, n: sampleSize, sigLevel });
  }, [effectSize, sampleSize, sigLevel]);

  // Merge distributions for chart
  const chartData = useMemo(() => {
    return result.nullDist.map((point, i) => ({
      x: point.x,
      null: point.y,
      alt: result.altDist[i]?.y || 0,
    }));
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Type I & II Error Simulator</h1>
        <p className="page-subtitle">Visualize the relationship between statistical errors and power</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="True Effect Size" value={effectSize} onChange={setEffectSize} min={0} max={2.0} step={0.05} />
              <Slider label="Sample Size" value={sampleSize} onChange={setSampleSize} min={10} max={500} step={1} format={v => Math.round(v)} />
              <Slider label="Significance Level" sublabel="α" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
            </div>
          </div>

          <div ref={exportRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats */}
            <div className="result-grid animate-in">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#dc2626' }}>{(result.typeI * 100).toFixed(1)}%</div>
                <div className="stat-label">Type I Error (α)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#d97706' }}>{(result.typeII * 100).toFixed(1)}%</div>
                <div className="stat-label">Type II Error (β)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#059669' }}>{(result.power * 100).toFixed(1)}%</div>
                <div className="stat-label">Power (1 - β)</div>
              </div>
            </div>

            {/* Chart */}
            <div className="card animate-in">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="card-title">Distribution Visualization</h2>
                  <p className="card-subtitle">Null hypothesis (H₀) vs. alternative hypothesis (H₁)</p>
                </div>
                <ExportButton targetRef={exportRef} filename="error-simulation" />
              </div>
              <div className="card-body">
                <div className="chart-container-tall"><ChartWatermark />
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        label={{ value: 'Sample Mean', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} formatter={(v) => v.toFixed(4)} cursor={{ strokeDasharray: '3 3' }} />
                      <ReferenceLine x={result.criticalValue} stroke="#dc2626" strokeDasharray="5 5" label={{ value: `+crit = ${result.criticalValue}`, position: 'top', fontSize: 10, fill: '#dc2626' }} />
                      <ReferenceLine x={result.negativeCritical} stroke="#dc2626" strokeDasharray="5 5" label={{ value: `-crit = ${result.negativeCritical}`, position: 'top', fontSize: 10, fill: '#dc2626' }} />
                      <Area type="monotone" dataKey="null" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="Null (H₀)" dot={false} />
                      <Area type="monotone" dataKey="alt" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} name="Alternative (H₁)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="card animate-in">
              <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: 12 }}>
                  <strong>Type I Error (α):</strong> The probability of rejecting the null hypothesis when it is actually true. Set by the significance level.
                </p>
                <p style={{ marginBottom: 12 }}>
                  <strong>Type II Error (β):</strong> The probability of failing to reject the null hypothesis when it is actually false.
                </p>
                <p>
                  <strong>Power (1 - β):</strong> The probability of correctly detecting a true effect. Increasing sample size or effect size increases power.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
