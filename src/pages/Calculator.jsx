import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrTTest, powerCurveData } from '../lib/statistics';

const TEST_TYPES = [
  { value: 'two.sample', label: 'Two-Sample' },
  { value: 'one.sample', label: 'One-Sample' },
  { value: 'paired', label: 'Paired' },
];

const DEFAULTS = { d: 0.5, power: 0.8, sigLevel: 0.05, type: 'two.sample' };
const INITIAL_N = pwrTTest(DEFAULTS);
const INITIAL_RESULT = { n: INITIAL_N, total: INITIAL_N * 2, testType: DEFAULTS.type, effectSize: DEFAULTS.d, power: DEFAULTS.power, sigLevel: DEFAULTS.sigLevel };

export default function Calculator() {
  const [testType, setTestType] = useState('two.sample');
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [result, setResult] = useState(INITIAL_RESULT);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const n = pwrTTest({ d: effectSize, power, sigLevel, type: testType });
    setResult({
      n,
      total: testType === 'two.sample' ? n * 2 : n,
      testType,
      effectSize,
      power,
      sigLevel,
    });
  };

  const curveData = useMemo(() => {
    if (!result) return [];
    return powerCurveData({
      n: result.n,
      sigLevel: result.sigLevel,
      type: result.testType,
    });
  }, [result]);

  const testLabel = TEST_TYPES.find(t => t.value === testType)?.label;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">T-Test Sample Size Calculator</h1>
        <p className="page-subtitle">Determine the required sample size for your t-test design</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          {/* Controls */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Test Type</label>
                <select
                  className="form-select"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                >
                  {TEST_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <Slider
                label="Effect Size"
                sublabel="Cohen's d"
                value={effectSize}
                onChange={setEffectSize}
                min={0.1}
                max={2.0}
                step={0.05}
              />

              <Slider
                label="Power"
                sublabel="1 - β"
                value={power}
                onChange={setPower}
                min={0.5}
                max={0.99}
                step={0.01}
              />

              <Slider
                label="Significance Level"
                sublabel="α"
                value={sigLevel}
                onChange={setSigLevel}
                min={0.01}
                max={0.1}
                step={0.01}
              />

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>
                Calculate Sample Size
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {result ? (
              <div className="animate-in" ref={exportRef}>
                {/* Result summary */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="result-card">
                    <div className="result-label">Per Group</div>
                    <div className="result-value">{result.n}</div>
                    <div className="result-detail">participants needed</div>
                  </div>
                  {result.testType === 'two.sample' && (
                    <div className="result-card">
                      <div className="result-label">Total</div>
                      <div className="result-value">{result.total}</div>
                      <div className="result-detail">across both groups</div>
                    </div>
                  )}
                </div>

                {/* Parameters summary */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card">
                    <div className="stat-value">{testLabel}</div>
                    <div className="stat-label">Test Type</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.effectSize}</div>
                    <div className="stat-label">Effect Size (d)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.power}</div>
                    <div className="stat-label">Power</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.sigLevel}</div>
                    <div className="stat-label">Sig. Level (α)</div>
                  </div>
                </div>

                {/* Power curve */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Power Curve</h2>
                      <p className="card-subtitle">Power as a function of effect size at n = {result.n}</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="ttest-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container"><ChartWatermark />
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis
                            dataKey="d"
                            label={{ value: "Effect Size (Cohen's d)", position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                          />
                          <YAxis
                            domain={[0, 1]}
                            label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }}
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                            formatter={(v) => [v.toFixed(4), 'Power']}
                            labelFormatter={(v) => `d = ${v}`}
                          />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.effectSize} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line
                            type="monotone"
                            dataKey="power"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: '#2563eb' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your Analysis</h3>
                  <p>Set your parameters and click Calculate to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
