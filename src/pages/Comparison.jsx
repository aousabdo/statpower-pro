import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import CopyButton from '../components/CopyButton';
import ValidationWarnings from '../components/ValidationWarnings';
import { pwrTTest } from '../lib/statistics';
import { getEffectLabel, getValidationWarnings, PRESETS_D } from '../lib/helpers';

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
      return { type: labels[i], perGroup: n, total: type === 'two.sample' ? n * 2 : n };
    });
  }, [effectSize, power, sigLevel]);

  const effectLabel = getEffectLabel(effectSize, 'd');

  const warnings = useMemo(() => getValidationWarnings({
    power, effectSize, effectType: 'd', sampleSize: result[0]?.total, sigLevel,
  }), [power, effectSize, result, sigLevel]);

  const interpretationText = `With a ${effectLabel} effect (d\u00a0=\u00a0${effectSize}) at ${(power * 100).toFixed(0)}% power: Two-Sample needs ${result[0]?.total} total, One-Sample needs ${result[1]?.total}, and Paired needs ${result[2]?.total} participants.`;

  const getCopyText = () =>
    `Test Type Comparison\nEffect Size (d): ${effectSize}\nPower: ${power}\nSignificance Level: ${sigLevel}\n\n` +
    result.map(r => `${r.type}: ${r.perGroup} per group, ${r.total} total`).join('\n') +
    `\n\n${interpretationText}`;

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
              <Slider label="Effect Size" sublabel="Cohen's d" value={effectSize} onChange={setEffectSize} min={0.1} max={2.0} step={0.05} presets={PRESETS_D} />
              <Slider label="Power" sublabel="1 - \u03b2" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="\u03b1" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="interpretation">{interpretationText}</div>
              <ValidationWarnings warnings={warnings} />

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Sample Size Comparison</h2>
                    <p className="card-subtitle">Total participants required by test type</p>
                  </div>
                  <div className="btn-group">
                    <CopyButton getText={getCopyText} />
                    <ExportButton targetRef={exportRef} filename="test-comparison" />
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container"><ChartWatermark />
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis dataKey="type" tick={{ fontSize: 13, fill: 'var(--text-secondary)' }} />
                        <YAxis label={{ value: 'Total N', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                          {result.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
