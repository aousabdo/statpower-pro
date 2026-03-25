import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { minimumDetectableEffect } from '../lib/statistics';

const TEST_TYPES = [
  { value: 'ttest', label: 'T-Test' },
  { value: 'anova', label: 'ANOVA' },
  { value: 'chisq', label: 'Chi-Square' },
  { value: 'correlation', label: 'Correlation' },
];

export default function MinDetectableEffect() {
  const [sampleSize, setSampleSize] = useState(100);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [testType, setTestType] = useState('ttest');
  const [groups, setGroups] = useState(3);
  const [df, setDf] = useState(1);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const extraParams = useMemo(() => {
    if (testType === 'anova') return { k: groups };
    if (testType === 'chisq') return { df };
    return {};
  }, [testType, groups, df]);

  const handleCalculate = () => {
    const mde = minimumDetectableEffect({
      n: sampleSize,
      power,
      sigLevel,
      testType,
      extraParams,
    });
    setResult({ mde, sampleSize, power, testType });
  };

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const curveData = useMemo(() => {
    if (!result) return [];
    const data = [];
    const maxN = sampleSize * 3;
    const step = Math.max(1, Math.floor((maxN - 20) / 50));
    for (let n = 20; n <= maxN; n += step) {
      const mde = minimumDetectableEffect({
        n,
        power,
        sigLevel,
        testType,
        extraParams,
      });
      data.push({ n, mde });
    }
    return data;
  }, [result, sampleSize, power, sigLevel, testType, extraParams]);

  const testLabel = TEST_TYPES.find(t => t.value === testType)?.label;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Minimum Detectable Effect</h1>
        <p className="page-subtitle">Find the smallest effect your study can detect</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
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
                label="Sample Size"
                sublabel="n"
                value={sampleSize}
                onChange={setSampleSize}
                min={10}
                max={1000}
                step={5}
                format={v => Math.round(v)}
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

              {testType === 'anova' && (
                <Slider
                  label="Groups"
                  sublabel="k"
                  value={groups}
                  onChange={setGroups}
                  min={2}
                  max={10}
                  step={1}
                  format={v => Math.round(v)}
                />
              )}

              {testType === 'chisq' && (
                <Slider
                  label="Degrees of Freedom"
                  sublabel="df"
                  value={df}
                  onChange={setDf}
                  min={1}
                  max={10}
                  step={1}
                  format={v => Math.round(v)}
                />
              )}

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>
                Calculate MDE
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {result ? (
              <div className="animate-in" ref={exportRef}>
                {/* Big number result */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="result-card">
                    <div className="result-label">Minimum Detectable Effect</div>
                    <div className="result-value" style={{ color: '#0ea5e9' }}>{result.mde}</div>
                    <div className="result-detail">smallest detectable effect size</div>
                  </div>
                </div>

                {/* Parameters summary */}
                <div className="result-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card">
                    <div className="stat-value">{result.sampleSize}</div>
                    <div className="stat-label">Sample Size (n)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.power}</div>
                    <div className="stat-label">Power</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{testLabel}</div>
                    <div className="stat-label">Test Type</div>
                  </div>
                </div>

                {/* MDE curve */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">MDE vs. Sample Size</h2>
                      <p className="card-subtitle">Minimum detectable effect decreases as sample size grows</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="min-detectable-effect" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis
                            dataKey="n"
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            label={{ value: 'Min. Detectable Effect', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                            formatter={(v) => [v.toFixed(4), 'MDE']}
                            labelFormatter={(v) => `n = ${v}`}
                          />
                          <ReferenceLine x={sampleSize} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `n = ${sampleSize}`, position: 'top', fontSize: 11, fill: '#a1a1aa' }} />
                          <Line
                            type="monotone"
                            dataKey="mde"
                            stroke="#0ea5e9"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: '#0ea5e9' }}
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
