import { useState, useRef, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { effectSizeBenchmarks, distributionOverlap, convertEffectSize } from '../lib/statistics';

const EFFECT_TYPES = [
  { value: 'd', label: "Cohen's d" },
  { value: 'r', label: 'Correlation r' },
  { value: 'f', label: "Cohen's f" },
  { value: 'w', label: "Cohen's w" },
  { value: 'eta2', label: 'Eta-squared η²' },
  { value: 'f2', label: 'f²' },
];

const BADGE_COLORS = {
  negligible: { bg: '#f1f5f9', text: '#64748b' },
  small: { bg: '#dbeafe', text: '#2563eb' },
  medium: { bg: '#fef3c7', text: '#d97706' },
  large: { bg: '#fce7f3', text: '#db2777' },
};

export default function EffectSizeInterpreter() {
  const [effectValue, setEffectValue] = useState(0.5);
  const [effectType, setEffectType] = useState('d');
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const bench = effectSizeBenchmarks(effectValue, effectType);
    // Convert to d for the overlap chart
    const dValue = effectType === 'd' ? effectValue : convertEffectSize(effectValue, effectType, 'd');
    const overlapData = distributionOverlap({ d: Math.abs(dValue) });
    const overlapPercent = bench.overlapPercent !== null
      ? bench.overlapPercent
      : Math.round(2 * 0.5 * (1 + Math.erf(-Math.abs(dValue) / (2 * Math.SQRT2))) * 10000) / 100;

    setResult({
      label: bench.label,
      benchmarks: bench.benchmarks,
      overlapData,
      overlapPercent,
      dValue: Math.round(Math.abs(dValue) * 10000) / 10000,
      effectValue,
      effectType,
    });
  };

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const typeLabel = useMemo(() => {
    return EFFECT_TYPES.find(t => t.value === effectType)?.label || effectType;
  }, [effectType]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Effect Size Interpreter</h1>
        <p className="page-subtitle">Understand the practical meaning of your effect size</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Effect Size Type</label>
                <select
                  className="form-select"
                  value={effectType}
                  onChange={(e) => setEffectType(e.target.value)}
                >
                  {EFFECT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <Slider
                label="Effect Size Value"
                value={effectValue}
                onChange={setEffectValue}
                min={0.01}
                max={2.0}
                step={0.01}
              />

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>
                Interpret Effect Size
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {result ? (
              <div className="animate-in" ref={exportRef}>
                {/* Classification badge */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    borderRadius: 12,
                    fontSize: 20,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    background: BADGE_COLORS[result.label]?.bg || '#f1f5f9',
                    color: BADGE_COLORS[result.label]?.text || '#64748b',
                  }}>
                    {result.label}
                  </div>
                </div>

                {/* Benchmarks */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card">
                    <div className="stat-value">{result.benchmarks.small}</div>
                    <div className="stat-label">Small</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.benchmarks.medium}</div>
                    <div className="stat-label">Medium</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.benchmarks.large}</div>
                    <div className="stat-label">Large</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.overlapPercent}%</div>
                    <div className="stat-label">Distribution Overlap</div>
                  </div>
                </div>

                {/* Distribution overlap chart */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Distribution Overlap</h2>
                      <p className="card-subtitle">Control vs. treatment group distributions (d = {result.dValue})</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="effect-size-interpreter" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container-tall" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.overlapData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis
                            dataKey="x"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Value', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                            formatter={(v) => v.toFixed(4)}
                          />
                          <Area type="monotone" dataKey="null" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} name="Control (H₀)" dot={false} />
                          <Area type="monotone" dataKey="alt" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2} name="Treatment (H₁)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                        <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="card animate-in">
                  <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 12 }}>
                      A {typeLabel} of <strong>{result.effectValue}</strong> (d = {result.dValue}) means the treatment group mean is <strong>{result.dValue} standard deviations</strong> above the control group.
                    </p>
                    <p>
                      The distributions overlap by approximately <strong>{result.overlapPercent}%</strong>, indicating that {result.label === 'large' ? 'the groups are well separated' : result.label === 'medium' ? 'there is moderate separation between groups' : 'there is substantial overlap between groups'}.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your Analysis</h3>
                  <p>Set your parameters and click Interpret to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
