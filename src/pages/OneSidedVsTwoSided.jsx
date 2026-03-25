import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import CopyButton from '../components/CopyButton';
import AnimatedNumber from '../components/AnimatedNumber';
import ValidationWarnings from '../components/ValidationWarnings';
import { pwrTTest } from '../lib/statistics';
import { getEffectLabel, getValidationWarnings, PRESETS_D } from '../lib/helpers';

export default function OneSidedVsTwoSided() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const nTwoSided = pwrTTest({ d: effectSize, power, sigLevel, type: 'two.sample', alternative: 'two.sided' });
    const nOneSided = pwrTTest({ d: effectSize, power, sigLevel, type: 'two.sample', alternative: 'greater' });
    return {
      data: [
        { type: 'Two-Sided', n: nTwoSided, total: nTwoSided * 2 },
        { type: 'One-Sided', n: nOneSided, total: nOneSided * 2 },
      ],
      savings: nTwoSided - nOneSided,
      savingsPercent: (((nTwoSided - nOneSided) / nTwoSided) * 100).toFixed(1),
    };
  }, [effectSize, power, sigLevel]);

  const effectLabel = getEffectLabel(effectSize, 'd');

  const warnings = useMemo(() => getValidationWarnings({
    power, effectSize, effectType: 'd', sampleSize: result.data[0]?.total, sigLevel,
  }), [power, effectSize, result.data, sigLevel]);

  const interpretationText = `A one-sided test saves ${result.savings} participants per group (${result.savingsPercent}% reduction) compared to two-sided, for a ${effectLabel} effect (d\u00a0=\u00a0${effectSize}) at ${(power * 100).toFixed(0)}% power.`;

  const getCopyText = () =>
    `One-Sided vs Two-Sided Comparison\nEffect Size (d): ${effectSize}\nPower: ${power}\nSignificance Level: ${sigLevel}\n\n` +
    result.data.map(r => `${r.type}: ${r.n} per group, ${r.total} total`).join('\n') +
    `\n\n${interpretationText}`;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">One-Sided vs. Two-Sided Tests</h1>
        <p className="page-subtitle">Compare sample size requirements for directional and non-directional hypotheses</p>
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
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Sample Size Savings</div>
                  <div className="result-value"><AnimatedNumber value={result.savings} /></div>
                  <div className="result-detail">fewer per group with one-sided ({result.savingsPercent}% reduction)</div>
                </div>
              </div>

              <div className="interpretation">{interpretationText}</div>
              <ValidationWarnings warnings={warnings} />

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Per-Group Sample Size</h2>
                    <p className="card-subtitle">Two-sample t-test comparison</p>
                  </div>
                  <div className="btn-group">
                    <CopyButton getText={getCopyText} />
                    <ExportButton targetRef={exportRef} filename="onesided-vs-twosided" />
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container"><ChartWatermark />
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} barSize={80}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis dataKey="type" tick={{ fontSize: 13, fill: 'var(--text-secondary)' }} />
                        <YAxis label={{ value: 'n per group', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
                        <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                          <Cell fill="#2563eb" />
                          <Cell fill="#7c3aed" />
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
                      {result.data.map((r, i) => (
                        <tr key={i}>
                          <td>{r.type}</td>
                          <td className="mono">{r.n}</td>
                          <td className="mono">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <p>
                    <strong>One-sided tests</strong> require fewer participants because they concentrate all statistical power in one direction.
                    However, they should only be used when there is a strong theoretical basis for predicting the direction of the effect.
                    A two-sided test is the safer default when the direction is uncertain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
