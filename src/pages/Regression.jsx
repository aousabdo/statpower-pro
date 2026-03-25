import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrRegression, regressionPowerCurve } from '../lib/statistics';

export default function Regression() {
  const [rSquared, setRSquared] = useState(0.1);
  const [predictors, setPredictors] = useState(3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const f2 = rSquared / (1 - rSquared);
    const n = pwrRegression({ f2, u: predictors, power, sigLevel });
    setResult({ n, rSquared, f2, predictors, power, sigLevel });
  };

  useEffect(() => { handleCalculate(); }, []);

  const curveData = useMemo(() => {
    if (!result) return [];
    return regressionPowerCurve({ f2: result.f2, u: result.predictors, sigLevel: result.sigLevel });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Regression Power Analysis</h1>
        <p className="page-subtitle">Sample size for multiple regression models</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="R-squared" sublabel="R&sup2;" value={rSquared} onChange={setRSquared} min={0.02} max={0.5} step={0.01} />
              <Slider label="Number of Predictors" sublabel="u" value={predictors} onChange={(v) => setPredictors(Math.round(v))} min={1} max={20} step={1} format={v => Math.round(v)} />
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
                    <div className="result-label">Required N (Total)</div>
                    <div className="result-value">{result.n}</div>
                    <div className="result-detail">total observations needed</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{result.rSquared}</div>
                    <div className="stat-label">R&sup2;</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.predictors}</div>
                    <div className="stat-label">Predictors</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.power}</div>
                    <div className="stat-label">Power</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.sigLevel}</div>
                    <div className="stat-label">Sig. Level (&alpha;)</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Power Curve</h2>
                      <p className="card-subtitle">Power as a function of sample size</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="regression-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="n" label={{ value: 'Total Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `N = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#06b6d4' }} />
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
