import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrRTest, correlationPowerCurve } from '../lib/statistics';

export default function Correlation() {
  const [r, setR] = useState(0.3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('r')) setR(parseFloat(params.get('r')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
  }, []);

  const result = useMemo(() => {
    const n = pwrRTest({ r, power, sigLevel });
    return { n, r, power, sigLevel };
  }, [r, power, sigLevel]);

  const curveData = useMemo(() => {
    return correlationPowerCurve({ r: result.r, sigLevel: result.sigLevel });
  }, [result.r, result.sigLevel]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Correlation Power Analysis</h1>
        <p className="page-subtitle">Determine sample size for detecting a significant correlation</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Correlation" sublabel="r" value={r} onChange={setR} min={0.1} max={0.9} step={0.05} />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="correlation"
                  testType="correlation"
                  params={{ r, power, sigLevel }}
                  result={result}
                />
                <ShareLink
                  page="correlation"
                  params={{ r, power, alpha: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required N</div>
                  <div className="result-value">{result.n}</div>
                  <div className="result-detail">participants needed</div>
                </div>
              </div>

              <div className="result-grid">
                <div className="stat-card">
                  <div className="stat-value">{result.r}</div>
                  <div className="stat-label">Correlation (r)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.power}</div>
                  <div className="stat-label">Power</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.sigLevel}</div>
                  <div className="stat-label">Sig. Level (&alpha;)</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Power Curve</h2>
                    <p className="card-subtitle">Power as a function of sample size</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="correlation-power-analysis" />
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
                        <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#8b5cf6' }} />
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
              formula="n = ((z_{α/2} + z_β) / C(r))² + 3 where C(r) = 0.5 × ln((1+r)/(1-r)) — Fisher z transformation"
              assumptions={[
                'Bivariate normality',
                'Linear relationship',
                'Pearson correlation',
              ]}
              limitations={[
                'Pearson only (not rank correlations)',
                'Assumes bivariate normal distribution',
              ]}
              references={[
                { author: 'Cohen, J.', year: 1988, title: 'Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.' },
                { author: 'Fisher, R. A.', year: 1921, title: 'On the "probable error" of a coefficient of correlation deduced from a small sample. Metron, 1, 3-32.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
