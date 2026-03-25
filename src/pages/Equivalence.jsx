import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrTOST, tostPowerCurve } from '../lib/statistics';

export default function Equivalence() {
  const [delta, setDelta] = useState(0.0);
  const [sd, setSd] = useState(1.0);
  const [margin, setMargin] = useState(0.5);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('delta')) setDelta(parseFloat(params.get('delta')));
    if (params.get('sd')) setSd(parseFloat(params.get('sd')));
    if (params.get('margin')) setMargin(parseFloat(params.get('margin')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
  }, []);

  const result = useMemo(() => {
    const n = pwrTOST({ delta, sd, power, sigLevel, margin });
    return { n, delta, sd, margin, power, sigLevel };
  }, [delta, sd, margin, power, sigLevel]);

  const curveData = useMemo(() => {
    return tostPowerCurve({ delta: result.delta, sd: result.sd, sigLevel: result.sigLevel, margin: result.margin });
  }, [result.delta, result.sd, result.sigLevel, result.margin]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Equivalence Testing (TOST)</h1>
        <p className="page-subtitle">Sample size for Two One-Sided Tests equivalence studies</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="True Difference" sublabel="&delta;" value={delta} onChange={setDelta} min={0} max={0.5} step={0.01} />
              <Slider label="Standard Deviation" sublabel="&sigma;" value={sd} onChange={setSd} min={0.5} max={3.0} step={0.1} />
              <Slider label="Equivalence Margin" sublabel="&epsilon;" value={margin} onChange={setMargin} min={0.1} max={2.0} step={0.05} />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="equivalence test (TOST)"
                  params={{ delta, sd, margin, power, sigLevel }}
                  result={result}
                />
                <ShareLink
                  page="equivalence"
                  params={{ delta, sd, margin, power, alpha: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required N per Group</div>
                  <div className="result-value">{result.n}</div>
                  <div className="result-detail">participants per group</div>
                </div>
              </div>

              <div className="result-grid">
                <div className="stat-card">
                  <div className="stat-value">{result.delta}</div>
                  <div className="stat-label">True Difference (&delta;)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.sd}</div>
                  <div className="stat-label">Std. Dev. (&sigma;)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.margin}</div>
                  <div className="stat-label">Margin (&epsilon;)</div>
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
                  <ExportButton targetRef={exportRef} filename="equivalence-tost-analysis" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="n" label={{ value: 'Sample Size per Group', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `n = ${v}`} />
                        <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                        <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} />
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
              formula="Uses TOST (Two One-Sided Tests): n = (t_{α,df} + t_{β,df})² × σ² / (δ - |Δ|)² where δ = equivalence margin"
              assumptions={[
                'Normal distributions in both groups',
                'Known true difference and standard deviation',
              ]}
              limitations={[
                'Sensitive to margin choice',
                'Requires pre-specification of equivalence bounds',
              ]}
              references={[
                { author: 'Schuirmann, D. J.', year: 1987, title: 'A comparison of the two one-sided tests procedure and the power approach for assessing the equivalence of average bioavailability. Journal of Pharmacokinetics and Biopharmaceutics, 15(6), 657-680.' },
                { author: 'Lakens, D.', year: 2017, title: 'Equivalence tests: A practical primer for t tests, correlations, and meta-analyses. Social Psychological and Personality Science, 8(4), 355-362.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
