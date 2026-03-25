import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import CopyButton from '../components/CopyButton';
import AnimatedNumber from '../components/AnimatedNumber';
import ValidationWarnings from '../components/ValidationWarnings';
import { pwrAnovaTest, anovaPowerCurve } from '../lib/statistics';
import { getEffectLabel, getValidationWarnings, PRESETS_F } from '../lib/helpers';

export default function Anova() {
  const [groups, setGroups] = useState(3);
  const [effectSize, setEffectSize] = useState(0.25);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const n = pwrAnovaTest({ k: groups, f: effectSize, power, sigLevel });
    return { n, total: n * groups, groups, effectSize, power, sigLevel };
  }, [groups, effectSize, power, sigLevel]);

  const curveData = useMemo(() => {
    return anovaPowerCurve({ k: result.groups, f: result.effectSize, sigLevel: result.sigLevel });
  }, [result.groups, result.effectSize, result.sigLevel]);

  const effectLabel = getEffectLabel(effectSize, 'f');

  const warnings = useMemo(() => getValidationWarnings({
    power, effectSize, effectType: 'f', sampleSize: result.total, sigLevel,
  }), [power, effectSize, result.total, sigLevel]);

  const interpretationText = `You need ${result.n} participants per group (${result.total} total across ${groups} groups) to detect a ${effectLabel} effect (f\u00a0=\u00a0${effectSize}) with ${(power * 100).toFixed(0)}% power.`;

  const getCopyText = () =>
    `ANOVA Power Analysis\nGroups: ${groups}\nEffect Size (f): ${effectSize}\nPower: ${power}\nSignificance Level: ${sigLevel}\n` +
    `Required n per group: ${result.n}\nTotal: ${result.total}\n\n${interpretationText}`;

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
              <Slider label="Effect Size" sublabel="Cohen's f" value={effectSize} onChange={setEffectSize} min={0.1} max={1.0} step={0.05} presets={PRESETS_F} />
              <Slider label="Power" sublabel="1 - \u03b2" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="\u03b1" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Per Group</div>
                  <div className="result-value"><AnimatedNumber value={result.n} /></div>
                  <div className="result-detail">participants per group</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total</div>
                  <div className="result-value"><AnimatedNumber value={result.total} /></div>
                  <div className="result-detail">across {result.groups} groups</div>
                </div>
              </div>

              <div className="interpretation">{interpretationText}</div>
              <ValidationWarnings warnings={warnings} />

              <div className="result-grid" style={{ marginTop: 8 }}>
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
                  <div className="btn-group">
                    <CopyButton getText={getCopyText} />
                    <ExportButton targetRef={exportRef} filename="anova-power-analysis" />
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container"><ChartWatermark />
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis dataKey="n" label={{ value: 'Sample Size per Group', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} cursor={{ strokeDasharray: '3 3' }} />
                        <ReferenceLine y={result.power} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <ReferenceLine x={result.n} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 7, fill: '#059669', stroke: 'var(--bg-secondary)', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
