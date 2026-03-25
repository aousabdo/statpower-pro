import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { pwrRegression, regressionPowerCurve } from '../lib/statistics';

export default function Regression() {
  const [rSquared, setRSquared] = useState(0.1);
  const [predictors, setPredictors] = useState(3);
  const [power, setPower] = useState(0.8);
  const [sigLevel, setSigLevel] = useState(0.05);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('r2')) setRSquared(parseFloat(params.get('r2')));
    if (params.get('predictors')) setPredictors(parseInt(params.get('predictors')));
    if (params.get('power')) setPower(parseFloat(params.get('power')));
    if (params.get('alpha')) setSigLevel(parseFloat(params.get('alpha')));
  }, []);

  const result = useMemo(() => {
    const f2 = rSquared / (1 - rSquared);
    const n = pwrRegression({ f2, u: predictors, power, sigLevel });
    return { n, rSquared, f2, predictors, power, sigLevel };
  }, [rSquared, predictors, power, sigLevel]);

  const curveData = useMemo(() => {
    return regressionPowerCurve({ f2: result.f2, u: result.predictors, sigLevel: result.sigLevel });
  }, [result.f2, result.predictors, result.sigLevel]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Regression Power Analysis</h1>
        <p className="page-subtitle">Sample size for multiple regression models</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="R-squared" sublabel="R&sup2;" value={rSquared} onChange={setRSquared} min={0.02} max={0.5} step={0.01} />
              <Slider label="Number of Predictors" sublabel="u" value={predictors} onChange={(v) => setPredictors(Math.round(v))} min={1} max={20} step={1} format={v => Math.round(v)} />
              <Slider label="Power" sublabel="1 - &beta;" value={power} onChange={setPower} min={0.5} max={0.99} step={0.01} />
              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="multiple regression"
                  testType="regression"
                  params={{ f2: result.f2, predictors, power, sigLevel }}
                  result={result}
                />
                <ShareLink
                  page="regression"
                  params={{ r2: rSquared, predictors, power, alpha: sigLevel }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required N (Total)</div>
                  <div className="result-value">{result.n}</div>
                  <div className="result-detail">total observations needed</div>
                </div>
              </div>

              <div className="result-grid">
                <div className="stat-card">
                  <div className="stat-value">{result.rSquared}</div>
                  <div className="stat-label">R&sup2;</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.predictors}</div>
                  <div className="stat-label">Predictors</div>
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
                  <ExportButton targetRef={exportRef} filename="regression-power-analysis" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="n" label={{ value: 'Total Sample Size (N)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <YAxis domain={[0, 1]} label={{ value: 'Power', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [v.toFixed(4), 'Power']} labelFormatter={(v) => `N = ${v}`} />
                        <ReferenceLine y={result.power} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ${result.power}`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                        <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="power" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#06b6d4' }} />
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
              formula={"n = \\frac{(z_{\\alpha/2} + z_\\beta)^2}{f^2} + u + 1 \\quad \\text{where} \\quad f^2 = \\frac{R^2}{1 - R^2}"} formulaNote="u = number of predictors. Uses Cohen's f² effect size."
              assumptions={[
                'Linear relationship between predictors and outcome',
                'Normally distributed residuals',
                'No multicollinearity among predictors',
              ]}
              limitations={[
                'Assumes fixed number of predictors',
                'Omnibus test only (not individual coefficients)',
              ]}
              references={[
                { author: 'Cohen, J.', year: 1988, title: 'Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.' },
                { author: 'Green, S. B.', year: 1991, title: 'How many subjects does it take to do a regression analysis? Multivariate Behavioral Research, 26(3), 499-510.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
