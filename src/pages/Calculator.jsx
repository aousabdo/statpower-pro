import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrTTest, powerCurveData } from '../lib/statistics';

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

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('d')) setEffectSize(parseFloat(params.get('d')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
    if (params.get('type')) setTestType(params.get('type'));
  }, []);

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
              />

              <Slider
                label="Power"
                sublabel="1 - β"
                value={power}
                onChange={setPower}
                min={0.5}
                max={0.99}
                step={0.01}
              />

              <Slider
                label="Significance Level"
                sublabel="α"
                value={sigLevel}
                onChange={setSigLevel}
                min={0.01}
                max={0.1}
                step={0.01}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="t-test"
                  params={{ d: effectSize, power, sigLevel, type: testLabel }}
                  result={result}
                />
                <ShareLink
                  page="calculator"
                  params={{ d: effectSize, power, alpha: sigLevel, type: testType }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="animate-in" ref={exportRef}>
              {/* Result summary */}
              <div className="result-grid" style={{ marginBottom: 24 }}>
                <div className="result-card">
                  <div className="result-label">Per Group</div>
                  <div className="result-value">{result.n}</div>
                  <div className="result-detail">participants needed</div>
                </div>
                {result.testType === 'two.sample' && (
                  <div className="result-card">
                    <div className="result-label">Total</div>
                    <div className="result-value">{result.total}</div>
                    <div className="result-detail">across both groups</div>
                  </div>
                )}
              </div>

              {/* Parameters summary */}
              <div className="result-grid" style={{ marginBottom: 24 }}>
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
                  <div className="stat-label">Sig. Level (α)</div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="interpretation-card" style={{ marginBottom: 24 }}>
                You need <strong>{result.n} participants per group</strong>
                {result.testType === 'two.sample' && <> (<strong>{result.total} total</strong>)</>}
                {' '}to detect a {effectSize <= 0.2 ? 'small' : effectSize <= 0.5 ? 'medium' : 'large'} effect
                (d = {effectSize}) with {(power * 100).toFixed(0)}% power at α = {sigLevel} ({testLabel.toLowerCase()} t-test).
              </div>

              {/* Power curve */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Power Curve</h2>
                    <p className="card-subtitle">Power as a function of effect size at n = {result.n}</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="ttest-power-analysis" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
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
                          contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-secondary)' }}
                          formatter={(v) => [v.toFixed(4), 'Power']}
                          labelFormatter={(v) => `d = ${v}`}
                        />
                        <ReferenceLine y={result.power} stroke="var(--text-tertiary)" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <ReferenceLine x={result.effectSize} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
                        <Line
                          type="monotone"
                          dataKey="power"
                          stroke="var(--accent)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: 'var(--accent)' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* About the Math */}
            <MethodologyRef
              formula={"n = \\frac{(z_{\\alpha/2} + z_\\beta)^2 \\cdot 2}{d^2}"} formulaNote="For two-sample t-test. Uses the noncentral t-distribution for exact calculations."
              assumptions={[
                'Data are normally distributed in each group',
                'Equal variances across groups (for two-sample)',
                'Independent observations within and between groups',
                'Effect size (d) is the standardized mean difference (Cohen\'s d)',
              ]}
              limitations={[
                'Assumes equal sample sizes per group',
                'Does not account for attrition or missing data',
                'Normality assumption may not hold for small samples',
                'For unequal variances, consider Welch\'s t-test adjustments',
              ]}
              references={[
                { author: 'Cohen, J.', year: 1988, title: 'Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.' },
                { author: 'Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A.', year: 2007, title: 'G*Power 3: A flexible statistical power analysis program. Behavior Research Methods, 39(2), 175-191.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
