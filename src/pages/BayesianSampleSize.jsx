import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { bayesianSampleSize, bayesianBFCurve } from '../lib/statistics';

export default function BayesianSampleSize() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [targetBF, setTargetBF] = useState(10);
  const [priorScale, setPriorScale] = useState(0.707);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const n = bayesianSampleSize({ d: effectSize, bf: targetBF, prior: priorScale });
    return { n, effectSize, targetBF, priorScale };
  }, [effectSize, targetBF, priorScale]);

  const curveData = useMemo(() => {
    return bayesianBFCurve({
      d: effectSize,
      prior: priorScale,
      nRange: [5, Math.max(result.n * 2, 300)],
      steps: 50,
    });
  }, [effectSize, priorScale, result.n]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bayesian Sample Size</h1>
        <p className="page-subtitle">Plan sample sizes using Bayes Factors</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider
                label="Expected Effect Size"
                sublabel="Cohen's d"
                value={effectSize}
                onChange={setEffectSize}
                min={0.1}
                max={2.0}
                step={0.05}
              />

              <Slider
                label="Target Bayes Factor"
                sublabel="BF₁₀"
                value={targetBF}
                onChange={setTargetBF}
                min={3}
                max={30}
                step={1}
                format={v => Math.round(v)}
              />

              <Slider
                label="Prior Scale"
                sublabel="Cauchy r"
                value={priorScale}
                onChange={setPriorScale}
                min={0.3}
                max={1.5}
                step={0.05}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="animate-in" ref={exportRef}>
              {/* Big number result */}
              <div className="result-grid" style={{ marginBottom: 24 }}>
                <div className="result-card">
                  <div className="result-label">Required N per Group</div>
                  <div className="result-value" style={{ color: '#14b8a6' }}>{result.n}</div>
                  <div className="result-detail">to achieve BF₁₀ = {result.targetBF}</div>
                </div>
              </div>

              {/* Parameters summary */}
              <div className="result-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="stat-value">{result.effectSize}</div>
                  <div className="stat-label">Effect Size (d)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.targetBF}</div>
                  <div className="stat-label">Target BF</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.priorScale}</div>
                  <div className="stat-label">Prior Scale</div>
                </div>
              </div>

              {/* BF curve */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Bayes Factor vs. Sample Size</h2>
                    <p className="card-subtitle">Expected BF₁₀ as sample size increases (d = {effectSize})</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="bayesian-sample-size" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis
                          dataKey="n"
                          tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                          label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }}
                        />
                        <YAxis
                          scale="log"
                          domain={['auto', 'auto']}
                          allowDataOverflow
                          width={70}
                          tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                          tickFormatter={(v) => {
                            if (v >= 1e6) return `${(v/1e6).toFixed(0)}M`;
                            if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`;
                            if (v >= 1) return v.toFixed(0);
                            return v.toFixed(2);
                          }}
                          label={{ value: 'BF₁₀ (log scale)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 11, fill: 'var(--text-tertiary)' } }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                          formatter={(v) => [v.toFixed(3), 'BF₁₀']}
                          labelFormatter={(v) => `n = ${v}`}
                        />
                        <ReferenceLine
                          y={targetBF}
                          stroke="#dc2626"
                          strokeDasharray="5 5"
                          label={{ value: `Target BF = ${targetBF}`, position: 'right', fontSize: 11, fill: '#dc2626' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bf10"
                          stroke="#14b8a6"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: '#14b8a6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                      <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
