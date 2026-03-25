import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrTTest, powerCurveData, tTestPower } from '../lib/statistics';

export default function PairedTTest() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [correlation, setCorrelation] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const dEff = effectSize / Math.sqrt(2 * (1 - correlation));
    const n = pwrTTest({ d: dEff, power, sigLevel, type: 'paired' });
    setResult({ n, effectSize, correlation, dEff, power, sigLevel });
  };

  useEffect(() => { handleCalculate(); }, []);

  const curveData = useMemo(() => {
    if (!result) return [];
    return powerCurveData({ n: result.n, sigLevel: result.sigLevel, type: 'paired', dRange: [0.1, 2.0], steps: 50 });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Paired T-Test Calculator</h1>
        <p className="page-subtitle">Sample size for within-subjects and matched-pair designs</p>
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
                min={0.1}
                max={2.0}
                step={0.05}
              />
              <Slider
                label="Correlation Between Pairs"
                sublabel="r"
                value={correlation}
                onChange={setCorrelation}
                min={0.0}
                max={0.95}
                step={0.05}
              />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>Calculate</button>
            </div>
          </div>

          <div ref={exportRef}>
            {result ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="result-grid">
                  <div className="result-card">
                    <div className="result-label">Required N Pairs</div>
                    <div className="result-value" style={{ color: '#0891b2' }}>{result.n}</div>
                    <div className="result-detail">matched pairs needed</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{result.effectSize}</div>
                    <div className="stat-label">Cohen&apos;s d</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.correlation}</div>
                    <div className="stat-label">Correlation (r)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.dEff.toFixed(3)}</div>
                    <div className="stat-label">Effective d</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.power}</div>
                    <div className="stat-label">Power</div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: '#71717a', margin: 0, padding: '0 4px' }}>
                  With correlation of <strong>{result.correlation}</strong> between pairs, your effective effect size is <strong>{result.dEff.toFixed(3)}</strong> (vs. <strong>{result.effectSize}</strong> for independent groups).
                </p>

                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Power Curve</h2>
                      <p className="card-subtitle">Power as a function of effect size at n = {result.n}</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="paired-ttest-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="d" label={{ value: "Effect Size (Cohen's d)", position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `d = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.effectSize} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#0891b2" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0891b2' }} />
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
                  <h3>Configure Your Paired T-Test</h3>
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
