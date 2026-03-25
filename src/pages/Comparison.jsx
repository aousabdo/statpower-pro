import { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { pwrTTest } from '../lib/statistics';

const COLORS = ['#2563eb', '#7c3aed', '#059669'];

export default function Comparison() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const types = ['two.sample', 'one.sample', 'paired'];
    const labels = ['Two-Sample', 'One-Sample', 'Paired'];

    return types.map((type, i) => {
      const n = pwrTTest({ d: effectSize, power, sigLevel, type });
      return {
        type: labels[i],
        perGroup: n,
        total: type === 'two.sample' ? n * 2 : n,
      };
    });
  }, [effectSize, power, sigLevel]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Test Type Comparison</h1>
        <p className="page-subtitle">Compare sample sizes across different t-test designs</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Effect Size" sublabel="Cohen's d" value={effectSize} onChange={setEffectSize} min={0.1} max={2.0} step={0.05} />
              <Slider label="Power" sublabel="1 - β" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="α" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Sample Size Comparison</h2>
                    <p className="card-subtitle">Total participants required by test type</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="test-comparison" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="type" tick={{ fontSize: 13, fill: '#52525b' }} />
                        <YAxis label={{ value: 'Total N', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                          {result.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                      <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Test Type</th>
                        <th>Per Group</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.map((r, i) => (
                        <tr key={i}>
                          <td>{r.type}</td>
                          <td className="mono">{r.perGroup}</td>
                          <td className="mono">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
