import ChartWatermark from '../components/ChartWatermark';
import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import CopyButton from '../components/CopyButton';
import AnimatedNumber from '../components/AnimatedNumber';
import ValidationWarnings from '../components/ValidationWarnings';
import { pwrTTest, powerCurveData } from '../lib/statistics';
import { getEffectLabel, getValidationWarnings, PRESETS_D } from '../lib/helpers';

const TEST_TYPES = [
  { value: 'two.sample', label: 'Two-Sample' },
  { value: 'one.sample', label: 'One-Sample' },
  { value: 'paired', label: 'Paired' },
];

export default function Calculator() {
  const [testType, setTestType] = useState('two.sample');
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  const result = useMemo(() => {
    const n = pwrTTest({ d: effectSize, power, sigLevel, type: testType });
    return {
      n,
      total: testType === 'two.sample' ? n * 2 : n,
      testType,
      effectSize,
      power,
      sigLevel,
    };
  }, [testType, effectSize, power, sigLevel]);

  const curveData = useMemo(() => {
    return powerCurveData({
      n: result.n,
      sigLevel: result.sigLevel,
      type: result.testType,
    });
  }, [result.n, result.sigLevel, result.testType]);

  const testLabel = TEST_TYPES.find(t => t.value === testType)?.label;
  const effectLabel = getEffectLabel(effectSize, 'd');

  const warnings = useMemo(() => getValidationWarnings({
    power, effectSize, effectType: 'd', sampleSize: result.total, sigLevel,
  }), [power, effectSize, result.total, sigLevel]);

  const interpretationText = useMemo(() => {
    if (testType === 'two.sample') {
      return `You need ${result.n} participants per group (${result.total} total) to detect a ${effectLabel} effect (d\u00a0=\u00a0${effectSize}) with ${(power * 100).toFixed(0)}% power at the ${(sigLevel * 100).toFixed(0)}% significance level.`;
    }
    return `You need ${result.n} participants to detect a ${effectLabel} effect (d\u00a0=\u00a0${effectSize}) with ${(power * 100).toFixed(0)}% power at the ${(sigLevel * 100).toFixed(0)}% significance level.`;
  }, [result.n, result.total, effectLabel, effectSize, power, sigLevel, testType]);

  const getCopyText = () =>
    `T-Test Power Analysis\n` +
    `Test Type: ${testLabel}\nEffect Size (d): ${effectSize}\nPower: ${power}\nSignificance Level: ${sigLevel}\n` +
    `Required n per group: ${result.n}\nTotal: ${result.total}\n\n${interpretationText}`;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">T-Test Sample Size Calculator</h1>
        <p className="page-subtitle">Determine the required sample size for your t-test design</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          {/* Controls */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Test Type</label>
                <select
                  className="form-select"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                >
                  {TEST_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <Slider
                label="Effect Size"
                sublabel="Cohen's d"
                value={effectSize}
                onChange={setEffectSize}
                min={0.1}
                max={2.0}
                step={0.05}
                presets={PRESETS_D}
              />

              <Slider
                label="Power"
                sublabel="1 - \u03b2"
                value={power}
                onChange={setPower}
                min={0.5}
                max={0.99}
                step={0.01}
              />

              <Slider
                label="Significance Level"
                sublabel="\u03b1"
                value={sigLevel}
                onChange={setSigLevel}
                min={0.01}
                max={0.1}
                step={0.01}
              />
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="animate-in" ref={exportRef}>
              {/* Result summary */}
              <div className="result-grid" style={{ marginBottom: 24 }}>
                <div className="result-card">
                  <div className="result-label">Per Group</div>
                  <div className="result-value"><AnimatedNumber value={result.n} /></div>
                  <div className="result-detail">participants needed</div>
                </div>
                {result.testType === 'two.sample' && (
                  <div className="result-card">
                    <div className="result-label">Total</div>
                    <div className="result-value"><AnimatedNumber value={result.total} /></div>
                    <div className="result-detail">across both groups</div>
                  </div>
                )}
              </div>

              {/* Interpretation */}
              <div className="interpretation">{interpretationText}</div>

              {/* Warnings */}
              <ValidationWarnings warnings={warnings} />

              {/* Parameters summary */}
              <div className="result-grid" style={{ marginTop: 16, marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="stat-value">{testLabel}</div>
                  <div className="stat-label">Test Type</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.effectSize}</div>
                  <div className="stat-label">Effect Size (d)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.power}</div>
                  <div className="stat-label">Power</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.sigLevel}</div>
                  <div className="stat-label">Sig. Level (\u03b1)</div>
                </div>
              </div>

              {/* Power curve */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Power Curve</h2>
                    <p className="card-subtitle">Power as a function of effect size at n = {result.n}</p>
                  </div>
                  <div className="btn-group">
                    <CopyButton getText={getCopyText} />
                    <ExportButton targetRef={exportRef} filename="ttest-power-analysis" />
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-container"><ChartWatermark />
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis
                          dataKey="d"
                          label={{ value: "Effect Size (Cohen's d)", position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }}
                          tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        />
                        <YAxis
                          domain={[0, 1]}
                          label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--text-tertiary)' } }}
                          tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                          formatter={(v) => [v.toFixed(4), 'Power']}
                          labelFormatter={(v) => `d = ${v}`}
                          cursor={{ strokeDasharray: '3 3' }}
                        />
                        <ReferenceLine y={result.power} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <ReferenceLine x={result.effectSize} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
                        <Line
                          type="monotone"
                          dataKey="power"
                          stroke="var(--accent)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 7, fill: 'var(--accent)', stroke: 'var(--bg-secondary)', strokeWidth: 2 }}
                        />
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
