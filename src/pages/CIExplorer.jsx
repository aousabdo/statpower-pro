import { useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { ciWidthData } from '../lib/statistics';

export default function CIExplorer() {
  const [mean, setMean] = useState(72);
  const [sd, setSd] = useState(8);
  const [confLevel, setConfLevel] = useState(0.95);
  const [nRange, setNRange] = useState([10, 300]);
  const exportRef = useRef(null);

  const data = useMemo(() => {
    return ciWidthData({ mean, sd, confLevel, nRange });
  }, [mean, sd, confLevel, nRange]);

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Confidence Interval Width Explorer</h1>
        <p className="page-subtitle">See how sample size affects the precision of your estimates</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <Slider label="Mean" sublabel="e.g. heart rate" value={mean} onChange={setMean} min={50} max={100} step={1} format={v => Math.round(v)} />
              <Slider label="Standard Deviation" value={sd} onChange={setSd} min={1} max={20} step={0.5} />
              <Slider label="Confidence Level" value={confLevel} onChange={setConfLevel} min={0.8} max={0.99} step={0.01} format={v => `${(v * 100).toFixed(0)}%`} />
              <Slider label="Max Sample Size" value={nRange[1]} onChange={(v) => setNRange([nRange[0], Math.round(v)])} min={50} max={500} step={10} format={v => Math.round(v)} />
            </div>
          </div>

          <div ref={exportRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Summary stats */}
            <div className="result-grid animate-in">
              <div className="stat-card">
                <div className="stat-value">{firstPoint?.width}</div>
                <div className="stat-label">CI Width at n={firstPoint?.n}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{lastPoint?.width}</div>
                <div className="stat-label">CI Width at n={lastPoint?.n}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{firstPoint && lastPoint ? (((firstPoint.width - lastPoint.width) / firstPoint.width) * 100).toFixed(0) : 0}%</div>
                <div className="stat-label">Width Reduction</div>
              </div>
            </div>

            {/* CI Width chart */}
            <div className="card animate-in">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="card-title">CI Width vs. Sample Size</h2>
                  <p className="card-subtitle">{(confLevel * 100).toFixed(0)}% confidence interval for mean = {mean}, SD = {sd}</p>
                </div>
                <ExportButton targetRef={exportRef} filename="ci-width-explorer" />
              </div>
              <div className="card-body">
                <div className="chart-container-tall" style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                      <XAxis
                        dataKey="n"
                        tick={{ fontSize: 11, fill: '#a1a1aa' }}
                        label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#a1a1aa' }}
                        label={{ value: 'CI Width', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#a1a1aa' } }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                        formatter={(v, name) => [v, name === 'width' ? 'CI Width' : name]}
                        labelFormatter={(v) => `n = ${v}`}
                      />
                      <Line type="monotone" dataKey="width" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                    <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* CI Bounds chart */}
            <div className="card animate-in">
              <div className="card-header">
                <h2 className="card-title">Confidence Interval Bounds</h2>
                <p className="card-subtitle">Upper and lower bounds as sample size increases</p>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                      <XAxis dataKey="n" tick={{ fontSize: 11, fill: '#a1a1aa' }} label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#a1a1aa' } }} />
                      <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }} labelFormatter={(v) => `n = ${v}`} />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="#dbeafe" fillOpacity={0.5} name="Upper Bound" />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#dbeafe" fillOpacity={0.5} name="Lower Bound" />
                      <Line type="monotone" dataKey="upper" stroke="#2563eb" strokeWidth={1.5} dot={false} name="Upper" />
                      <Line type="monotone" dataKey="lower" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="Lower" />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.12, pointerEvents: 'none' }}>
                    <img src={import.meta.env.BASE_URL + 'analytica-logo.png'} alt="" style={{ height: 22 }} />
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
