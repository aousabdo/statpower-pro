import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrTTest, powerCurveData } from '../lib/statistics';

export default function PairedTTest() {
  const [effectSize, setEffectSize] = useState(0.5);
  const [correlation, setCorrelation] = useState(0.5);
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
    if (params.get('r')) setCorrelation(parseFloat(params.get('r')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
  }, []);

  const result = useMemo(() => {
    const dEff = effectSize / Math.sqrt(2 * (1 - correlation));
    const n = pwrTTest({ d: dEff, power, sigLevel, type: 'paired' });
    return { n, effectSize, correlation, dEff, power, sigLevel };
  }, [effectSize, correlation, power, sigLevel]);

  const curveData = useMemo(() => {
    return powerCurveData({ n: result.n, sigLevel: result.sigLevel, type: 'paired', dRange: [0.1, 2.0], steps: 50 });
  }, [result.n, result.sigLevel]);

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

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="paired t-test"
                  testType="paired-t"
                  params={{ d: effectSize, power, sigLevel }}
                  result={result}
                />
                <ShareLink
                  page="paired-ttest"
                  params={{ d: effectSize, r: correlation, power, alpha: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
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

            {/* About the Math */}
            <MethodologyRef
              formula="n = ((z_{α/2} + z_β)² × (1 + (1 - 2ρ))) / d² — uses correlation between pairs to reduce required n"
              assumptions={[
                'Paired observations (within-subjects or matched pairs)',
                'Normal difference scores',
                'Known correlation between pairs',
              ]}
              limitations={[
                'Assumes known correlation',
                'Sensitive to non-normality of differences',
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
