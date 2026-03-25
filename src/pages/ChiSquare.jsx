import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import CopyButton from '../components/CopyButton';
import AnimatedNumber from '../components/AnimatedNumber';
import ValidationWarnings from '../components/ValidationWarnings';
import { pwrChisqTest, chisqPowerCurve } from '../lib/statistics';
import { getEffectLabel, getValidationWarnings, PRESETS_W } from '../lib/helpers';

export default function ChiSquare() {
  const [df, setDf] = useState(1);
  const [effectSize, setEffectSize] = useState(0.3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const N = pwrChisqTest({ w: effectSize, df, power, sigLevel });
    return { N, df, effectSize, power, sigLevel };
  }, [effectSize, df, power, sigLevel]);

  const curveData = useMemo(() => {
    return chisqPowerCurve({ w: result.effectSize, df: result.df, sigLevel: result.sigLevel });
  }, [result.effectSize, result.df, result.sigLevel]);

  const effectLabel = getEffectLabel(effectSize, 'w');

  const warnings = useMemo(() => getValidationWarnings({
    power, effectSize, effectType: 'w', sampleSize: result.N, sigLevel,
  }), [power, effectSize, result.N, sigLevel]);

  const interpretationText = `You need ${result.N} total observations to detect a ${effectLabel} effect (w\u00a0=\u00a0${effectSize}) with ${df} degree${df > 1 ? 's' : ''} of freedom at ${(power * 100).toFixed(0)}% power.`;

  const getCopyText = () =>
    `Chi-Square Power Analysis\nDegrees of Freedom: ${df}\nEffect Size (w): ${effectSize}\nPower: ${power}\nSignificance Level: ${sigLevel}\n` +
    `Required N: ${result.N}\n\n${interpretationText}`;

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
              <Slider label="Effect Size" sublabel="Cohen's w" value={effectSize} onChange={setEffectSize} min={0.1} max={1.0} step={0.05} presets={PRESETS_W} />
              <Slider label="Power" sublabel="1 - \u03b2" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="\u03b1" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required Sample Size</div>
                  <div className="result-value"><AnimatedNumber value={result.N} /></div>
                  <div className="result-detail">total observations needed</div>
                </div>
              </div>

              <div className="interpretation">{interpretationText}</div>
              <ValidationWarnings warnings={warnings} />

              <div className="result-grid" style={{ marginTop: 8 }}>
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
                  <div className="btn-group">
                    <CopyButton getText={getCopyText} />
                    <ExportButton targetRef={exportRef} filename="chisquare-power-analysis" />
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container"><ChartWatermark />
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis dataKey="N" label={{ value: 'Total Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `N = ${v}`} cursor={{ strokeDasharray: '3 3' }} />
                        <ReferenceLine y={result.power} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <ReferenceLine x={result.N} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 7, fill: '#d97706', stroke: 'var(--bg-secondary)', strokeWidth: 2 }} />
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
