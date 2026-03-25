import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrChisqTest, chisqPowerCurve } from '../lib/statistics';

export default function ChiSquare() {
  const [df, setDf] = useState(1);
  const [effectSize, setEffectSize] = useState(0.3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('df')) setDf(parseInt(params.get('df')));
    if (params.get('w')) setEffectSize(parseFloat(params.get('w')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
  }, []);

  const result = useMemo(() => {
    const N = pwrChisqTest({ w: effectSize, df, power, sigLevel });
    return { N, df, effectSize, power, sigLevel };
  }, [df, effectSize, power, sigLevel]);

  const curveData = useMemo(() => {
    return chisqPowerCurve({ w: result.effectSize, df: result.df, sigLevel: result.sigLevel });
  }, [result.effectSize, result.df, result.sigLevel]);

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
              <Slider label="Effect Size" sublabel="Cohen's w" value={effectSize} onChange={setEffectSize} min={0.1} max={1.0} step={0.05} />
              <Slider label="Power" sublabel="1 - β" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="α" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="chi-square test"
                  testType="chi-square"
                  params={{ w: effectSize, df, power, sigLevel }}
                  result={{ n: result.N, ...result }}
                />
                <ShareLink
                  page="chi-square"
                  params={{ df, w: effectSize, power, alpha: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required Sample Size</div>
                  <div className="result-value">{result.N}</div>
                  <div className="result-detail">total observations needed</div>
                </div>
              </div>

              <div className="result-grid">
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
                  <ExportButton targetRef={exportRef} filename="chisquare-power-analysis" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="N" label={{ value: 'Total Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `N = ${v}`} />
                        <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                        <ReferenceLine x={result.N} stroke="#a1a1aa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#d97706' }} />
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
              formula={"n = \\frac{(z_{\\alpha/2} + z_\\beta)^2}{w^2} \\quad \\text{where} \\quad df = (r-1)(c-1)"} formulaNote="w = Cohen's effect size for chi-square tests."
              assumptions={[
                'Expected cell frequencies >= 5',
                'Independent observations',
              ]}
              limitations={[
                'Does not account for sparse tables',
                'Goodness-of-fit only with specified df',
              ]}
              references={[
                { author: 'Cohen, J.', year: 1988, title: 'Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
