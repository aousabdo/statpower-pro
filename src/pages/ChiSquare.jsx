import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrChisqTest, chisqPowerCurve } from '../lib/statistics';

export default function ChiSquare() {
  const [df, setDf] = useState(1);
  const [effectSize, setEffectSize] = useState(0.3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const computeResult = (w, d, p, s) => {
    const N = pwrChisqTest({ w, df: d, power: p, sigLevel: s });
    return { N, df: d, effectSize: w, power: p, sigLevel: s };
  };

  const [result, setResult] = useState(() => computeResult(0.3, 1, 0.8, 0.05));

  const handleCalculate = () => {
    setResult(computeResult(effectSize, df, power, sigLevel));
  };

  const curveData = useMemo(() => {
    if (!result) return [];
    return chisqPowerCurve({ w: result.effectSize, df: result.df, sigLevel: result.sigLevel });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Chi-Square Sample Size Calculator</h1>
        <p className="page-subtitle">Determine the required sample size for chi-square tests of association</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Degrees of Freedom" value={df} onChange={(v) => setDf(Math.round(v))} min={1} max={10} step={1} format={v => Math.round(v)} />
              <Slider label="Effect Size" sublabel="Cohen's w" value={effectSize} onChange={setEffectSize} min={0.1} max={1.0} step={0.05} />
              <Slider label="Power" sublabel="1 - β" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="α" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
              <button className="btn btn-primary btn-block" onClick={handleCalculate}>Calculate Sample Size</button>
            </div>
          </div>

          <div ref={exportRef}>
            {result ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="result-grid">
                  <div className="result-card">
                    <div className="result-label">Required Sample Size</div>
                    <div className="result-value">{result.N}</div>
                    <div className="result-detail">total observations needed</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{result.df}</div>
                    <div className="stat-label">Degrees of Freedom</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.effectSize}</div>
                    <div className="stat-label">Effect Size (w)</div>
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
                      <p className="card-subtitle">Power as a function of total sample size</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="chisquare-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="N" label={{ value: 'Total Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `N = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.N} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#d97706' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your Chi-Square Test</h3>
                  <p>Set parameters and click Calculate to determine the required sample size</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
