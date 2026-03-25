import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrTwoProportions, twoProportionsPowerCurve } from '../lib/statistics';

export default function TwoProportions() {
  const [p1, setP1] = useState(0.10);
  const [p2, setP2] = useState(0.15);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [ratio, setRatio] = useState(1.0);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const n1 = pwrTwoProportions({ p1, p2, power, sigLevel, ratio });
    const n2 = Math.ceil(n1 * ratio);
    setResult({ n1, n2, total: n1 + n2, p1, p2, diff: Math.abs(p2 - p1), power, sigLevel, ratio });
  };

  useEffect(() => { handleCalculate(); }, []);

  const curveData = useMemo(() => {
    if (!result) return [];
    return twoProportionsPowerCurve({ p1: result.p1, p2: result.p2, sigLevel: result.sigLevel, ratio: result.ratio });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Two Proportions Test</h1>
        <p className="page-subtitle">Compare conversion rates or proportions between two groups</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Group 1 Proportion" sublabel="p&sub1;" value={p1} onChange={setP1} min={0.01} max={0.99} step={0.01} />
              <Slider label="Group 2 Proportion" sublabel="p&sub2;" value={p2} onChange={setP2} min={0.01} max={0.99} step={0.01} />
              <Slider label="Allocation Ratio" sublabel="n&sub2;/n&sub1;" value={ratio} onChange={setRatio} min={0.5} max={3.0} step={0.1} />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
              <button className="btn btn-primary btn-block" onClick={handleCalculate}>Calculate Sample Size</button>
            </div>
          </div>

          <div ref={exportRef}>
            {result ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="result-grid">
                  <div className="result-card">
                    <div className="result-label">Group 1 (n&sub1;)</div>
                    <div className="result-value">{result.n1}</div>
                    <div className="result-detail">per group 1</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Group 2 (n&sub2;)</div>
                    <div className="result-value">{result.n2}</div>
                    <div className="result-detail">per group 2</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Total</div>
                    <div className="result-value">{result.total}</div>
                    <div className="result-detail">across both groups</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{result.p1}</div>
                    <div className="stat-label">p&sub1;</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.p2}</div>
                    <div className="stat-label">p&sub2;</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.diff.toFixed(2)}</div>
                    <div className="stat-label">Difference</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.power}</div>
                    <div className="stat-label">Power</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Power Curve</h2>
                      <p className="card-subtitle">Power as a function of sample size per group</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="two-proportions-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="n" label={{ value: 'Sample Size per Group (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.n1} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#ec4899" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ec4899' }} />
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
