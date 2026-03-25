import { useState, useRef, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import APAReport from '../components/APAReport';
import ShareLink from '../components/ShareLink';
import MethodologyRef from '../components/MethodologyRef';
import { surveySampleSize, surveyMoECurve } from '../lib/statistics';

export default function SurveySampleSize() {
  const [population, setPopulation] = useState(10000);
  const [infinitePop, setInfinitePop] = useState(false);
  const [marginOfError, setMarginOfError] = useState(0.05);
  const [confLevel, setConfLevel] = useState(0.95);
  const [proportion, setProportion] = useState(0.5);
  const exportRef = useRef(null);

  // Load from URL params
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx));
    if (params.get('pop')) {
      const popVal = params.get('pop');
      if (popVal === 'inf') { setInfinitePop(true); } else { setPopulation(parseInt(popVal)); }
    }
    if (params.get('moe')) setMarginOfError(parseFloat(params.get('moe')));
    if (params.get('conf')) setConfLevel(parseFloat(params.get('conf')));
    if (params.get('p')) setProportion(parseFloat(params.get('p')));
  }, []);

  const effectivePopulation = infinitePop ? Infinity : population;

  const result = useMemo(() => {
    const n = surveySampleSize({ population: effectivePopulation, marginOfError, confLevel, proportion });
    return { n, population: effectivePopulation, marginOfError, confLevel, proportion };
  }, [effectivePopulation, marginOfError, confLevel, proportion]);

  const curveData = useMemo(() => {
    return surveyMoECurve({ population: result.population, confLevel: result.confLevel, proportion: result.proportion, nRange: [10, Math.max(result.n * 3, 1000)], steps: 50 });
  }, [result.population, result.confLevel, result.proportion, result.n]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Survey Sample Size Calculator</h1>
        <p className="page-subtitle">Determine how many responses you need for reliable survey results</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Population Size</label>
                <input
                  type="number"
                  className="form-input"
                  value={infinitePop ? '' : population}
                  onChange={e => setPopulation(Math.max(1, Number(e.target.value) || 1))}
                  disabled={infinitePop}
                  min={1}
                  placeholder={infinitePop ? 'Infinite' : ''}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: '#71717a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={infinitePop}
                    onChange={e => setInfinitePop(e.target.checked)}
                  />
                  Infinite population
                </label>
              </div>

              <Slider
                label="Margin of Error"
                sublabel="Precision"
                value={marginOfError}
                onChange={setMarginOfError}
                min={0.01}
                max={0.1}
                step={0.005}
                format={v => `±${(v * 100).toFixed(1)}%`}
              />

              <div className="form-group">
                <label className="form-label">Confidence Level</label>
                <select
                  className="form-select"
                  value={confLevel}
                  onChange={e => setConfLevel(Number(e.target.value))}
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </div>

              <Slider
                label="Expected Proportion"
                sublabel="p"
                value={proportion}
                onChange={setProportion}
                min={0.1}
                max={0.9}
                step={0.05}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                <APAReport
                  testName="survey sample size"
                  params={{ population: effectivePopulation, marginOfError, confLevel, proportion, power: confLevel }}
                  result={{ n: result.n, sampleSize: result.n }}
                />
                <ShareLink
                  page="survey"
                  params={{ pop: infinitePop ? 'inf' : population, moe: marginOfError, conf: confLevel, p: proportion }}
                />
              </div>
            </div>
          </div>

          <div ref={exportRef}>
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Required Sample Size</div>
                  <div className="result-value" style={{ color: '#22c55e' }}>{result.n.toLocaleString()}</div>
                  <div className="result-detail">survey responses needed</div>
                </div>
              </div>

              <div className="result-grid">
                <div className="stat-card">
                  <div className="stat-value">{isFinite(result.population) ? result.population.toLocaleString() : '∞'}</div>
                  <div className="stat-label">Population</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">&plusmn;{(result.marginOfError * 100).toFixed(1)}%</div>
                  <div className="stat-label">Margin of Error</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{(result.confLevel * 100).toFixed(0)}%</div>
                  <div className="stat-label">Confidence Level</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{result.proportion}</div>
                  <div className="stat-label">Expected Proportion</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">Margin of Error vs Sample Size</h2>
                    <p className="card-subtitle">How precision improves as you collect more responses</p>
                  </div>
                  <ExportButton targetRef={exportRef} filename="survey-sample-size" />
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                        <XAxis dataKey="n" label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                        <YAxis label={{ value: 'Margin of Error', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }} tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={v => `${(v * 100).toFixed(1)}%`} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} formatter={(v) => [`±${(v * 100).toFixed(2)}%`, 'Margin of Error']} labelFormatter={(v) => `n = ${v}`} />
                        <ReferenceLine y={result.marginOfError} stroke="#a1a1aa" strokeDasharray="5 5" label={{ value: `Target: ±${(result.marginOfError * 100).toFixed(1)}%`, position: 'right', fontSize: 11, fill: '#a1a1aa' }} />
                        <ReferenceLine x={result.n} stroke="#a1a1aa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="marginOfError" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#22c55e' }} />
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
              formula="n = (z² × p(1-p)) / e² with finite population correction: n_adj = n / (1 + (n-1)/N)"
              assumptions={[
                'Simple random sampling',
                'Accurate population estimate',
              ]}
              limitations={[
                'Does not account for clustering, stratification, or design effects',
              ]}
              references={[
                { author: 'Cochran, W. G.', year: 1977, title: 'Sampling Techniques (3rd ed.). John Wiley & Sons.' },
                { author: 'Krejcie, R. V., & Morgan, D. W.', year: 1970, title: 'Determining sample size for research activities. Educational and Psychological Measurement, 30(3), 607-610.' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
