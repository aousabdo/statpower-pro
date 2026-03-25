import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { reliabilitySampleSize, reliabilityPowerCurve } from '../lib/statistics';

export default function Reliability() {
  const [alpha0, setAlpha0] = useState(0.7);
  const [alpha1, setAlpha1] = useState(0.85);
  const [k, setK] = useState(10);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('alpha0')) setAlpha0(parseFloat(params.get('alpha0')));
    if (params.get('alpha1')) setAlpha1(parseFloat(params.get('alpha1')));
    if (params.get('k')) setK(parseInt(params.get('k')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('sig')) setSigLevel(parseFloat(params.get('sig')));
  }, []);

  const isValid = alpha1 > alpha0;

  const result = useMemo(() => {
    if (!isValid) return { n: '—', alpha0, alpha1, k, power, sigLevel };
    const n = reliabilitySampleSize({ alpha0, alpha1, k, power, sigLevel });
    return { n, alpha0, alpha1, k, power, sigLevel };
  }, [alpha0, alpha1, k, power, sigLevel, isValid]);

  const curveData = useMemo(() => {
    if (!isValid) return [];
    return reliabilityPowerCurve({ alpha0: result.alpha0, alpha1: result.alpha1, k: result.k, sigLevel: result.sigLevel });
  }, [isValid, result.alpha0, result.alpha1, result.k, result.sigLevel]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reliability Analysis</h1>
        <p className="page-subtitle">Sample size for Cronbach&apos;s alpha testing</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider
                label="Null Alpha"
                sublabel="α₀ (alpha to exceed)"
                value={alpha0}
                onChange={setAlpha0}
                min={0.5}
                max={0.9}
                step={0.05}
              />
              <Slider
                label="Expected Alpha"
                sublabel="α₁"
                value={alpha1}
                onChange={setAlpha1}
                min={0.6}
                max={0.99}
                step={0.01}
              />

              {!isValid && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 12px 0' }}>
                  Expected alpha (&alpha;&#x2081;) must be greater than null alpha (&alpha;&#x2080;).
                </p>
              )}

              <Slider
                label="Number of Items"
                sublabel="k"
                value={k}
                onChange={v => setK(Math.round(v))}
                min={2}
                max={50}
                step={1}
                format={v => Math.round(v)}
              />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  showPreview
                  testName="reliability (Cronbach's alpha)"
                  params={{ alpha0, alpha1, k, power, sigLevel }}
                  result={result}
                />
                <ShareLink
                  page="reliability"
                  params={{ alpha0, alpha1, k, power, sig: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required N</div>
                  <div className="result-value" style={{ color: '#7c3aed' }}>{result.n}</div>
                  <div className="result-detail">participants needed</div>
                </div>
              </div>

              <div className="result-grid">
                <div className="stat-card">
                  <div className="stat-value">{result.alpha0}</div>
                  <div className="stat-label">Null Alpha (&alpha;&#x2080;)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.alpha1}</div>
                  <div className="stat-label">Expected Alpha (&alpha;&#x2081;)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.k}</div>
                  <div className="stat-label">Items (k)</div>
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
                    <p className="card-subtitle">Power as a function of sample size</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="reliability-power-analysis" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="n" label={{ value: 'Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} />
                        <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                        {isValid && <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />}
                        <Line type="monotone" dataKey="power" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
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
              formula={"H_0: \\alpha = \\alpha_0 \\quad \\text{vs} \\quad H_1: \\alpha = \\alpha_1"}
              formulaNote="Uses Feldt et al. (1987) approach for testing Cronbach's alpha."
              assumptions={[
                'Items are essentially tau-equivalent',
                'Multivariate normality of item scores',
              ]}
              limitations={[
                "Cronbach's alpha only",
                'Assumes tau-equivalence (equal factor loadings)',
              ]}
              references={[
                { author: 'Feldt, L. S., Woodruff, D. J., & Salih, F. A.', year: 1987, title: 'Statistical inference for coefficient alpha. Applied Psychological Measurement, 11(1), 93-103.' },
                { author: 'Bonett, D. G.', year: 2002, title: 'Sample size requirements for testing and estimating coefficient alpha. Journal of Educational and Behavioral Statistics, 27(4), 335-340.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
