import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrAnovaTest, anovaPowerCurve } from '../lib/statistics';

export default function Anova() {
  const [groups, setGroups] = useState(3);
  const [effectSize, setEffectSize] = useState(0.25);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const n = pwrAnovaTest({ k: groups, f: effectSize, power, sigLevel });
    setResult({ n, total: n * groups, groups, effectSize, power, sigLevel });
  };

  const curveData = useMemo(() => {
    if (!result) return [];
    return anovaPowerCurve({ k: result.groups, f: result.effectSize, sigLevel: result.sigLevel });
  }, [result]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">ANOVA Sample Size Calculator</h1>
        <p className="page-subtitle">Determine the sample size per group for one-way ANOVA</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Number of Groups" value={groups} onChange={(v) => setGroups(Math.round(v))} min={2} max={10} step={1} format={v => Math.round(v)} />
              <Slider label="Effect Size" sublabel="Cohen's f" value={effectSize} onChange={setEffectSize} min={0.1} max={1.0} step={0.05} />
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
                    <div className="result-label">Per Group</div>
                    <div className="result-value">{result.n}</div>
                    <div className="result-detail">participants per group</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Total</div>
                    <div className="result-value">{result.total}</div>
                    <div className="result-detail">across {result.groups} groups</div>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="stat-card">
                    <div className="stat-value">{result.groups}</div>
                    <div className="stat-label">Groups</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{result.effectSize}</div>
                    <div className="stat-label">Effect Size (f)</div>
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
                    <ExportButton targetRef={exportRef} filename="anova-power-analysis" />
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                          <XAxis dataKey="n" label={{ value: 'Sample Size per Group', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} />
                          <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                          <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="power" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#059669' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your ANOVA</h3>
                  <p>Set your parameters and click Calculate to determine the required sample size</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
