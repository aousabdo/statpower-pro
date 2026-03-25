import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { abTestSampleSize, abTestDuration, twoProportionsPowerCurve } from '../lib/statistics';

export default function ABTest() {
  const [baseline, setBaseline] = useState(0.05);
  const [mde, setMde] = useState(0.1);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [dailyVisitors, setDailyVisitors] = useState(10000);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const { n1, n2, totalN, days } = abTestDuration({ baseline, mde, power, sigLevel, dailyVisitors });
    const p1 = baseline;
    const p2 = baseline * (1 + mde);
    setResult({ n1, n2, totalN, days, baseline, mde, power, sigLevel, dailyVisitors, p1, p2 });
  };

  useEffect(() => { handleCalculate(); }, []);

  const curveData = useMemo(() => {
    if (!result) return [];
    return twoProportionsPowerCurve({ p1: result.p1, p2: result.p2, sigLevel: result.sigLevel, nRange: [10, Math.max(result.n1 * 3, 500)], steps: 50 });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">A/B Test Calculator</h1>
        <p className="page-subtitle">Plan your experiment with confidence &mdash; sample size, duration, and power</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider
                label="Baseline Conversion Rate"
                sublabel="Current rate"
                value={baseline}
                onChange={setBaseline}
                min={0.01}
                max={0.5}
                step={0.005}
                format={v => `${(v * 100).toFixed(1)}%`}
              />
              <Slider
                label="Minimum Detectable Effect"
                sublabel="Relative lift"
                value={mde}
                onChange={setMde}
                min={0.05}
                max={0.5}
                step={0.01}
                format={v => `${(v * 100).toFixed(0)}% lift`}
              />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              <div className="form-group">
                <label className="form-label">Daily Visitors</label>
                <input
                  type="number"
                  className="form-input"
                  value={dailyVisitors}
                  onChange={e => setDailyVisitors(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                />
              </div>

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>Calculate</button>
            </div>
          </div>

          <div ref={exportRef}>
            {result ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="result-grid">
                  <div className="result-card">
                    <div className="result-label">Sample Size Per Variant</div>
                    <div className="result-value" style={{ color: '#f43f5e' }}>{result.n1.toLocaleString()}</div>
                    <div className="result-detail">visitors needed per arm</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Total Sample Size</div>
                    <div className="result-value" style={{ color: '#f43f5e' }}>{result.totalN.toLocaleString()}</div>
                    <div className="result-detail">across both variants</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Estimated Duration</div>
                    <div className="result-value" style={{ color: '#f43f5e' }}>{result.days}</div>
                    <div className="result-detail">days to run</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{(result.baseline * 100).toFixed(1)}%</div>
                    <div className="stat-label">Baseline Rate</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{(result.p2 * 100).toFixed(2)}%</div>
                    <div className="stat-label">Expected Rate After Lift</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{((result.p2 - result.p1) * 100).toFixed(2)}%</div>
                    <div className="stat-label">Absolute Difference</div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: '#71717a', margin: 0, padding: '0 4px' }}>
                  You need <strong>{result.n1.toLocaleString()}</strong> visitors per variant to detect a <strong>{(result.mde * 100).toFixed(0)}%</strong> relative lift from a <strong>{(result.baseline * 100).toFixed(1)}%</strong> baseline with <strong>{(result.power * 100).toFixed(0)}%</strong> power.
                </p>

                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Power Curve</h2>
                      <p className="card-subtitle">Power as a function of sample size per variant</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="ab-test-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="n" label={{ value: 'Sample Size Per Variant', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.n1} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f43f5e' }} />
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
                  <h3>Configure Your A/B Test</h3>
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
