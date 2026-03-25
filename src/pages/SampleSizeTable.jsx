import { useState, useRef, useMemo, useEffect } from 'react';
import Slider from '../components/Slider';
import ExportButton from '../components/ExportButton';
import { sampleSizeTable } from '../lib/statistics';

const TEST_TYPES = [
  { value: 'ttest', label: 'T-Test' },
  { value: 'anova', label: 'ANOVA' },
  { value: 'chisq', label: 'Chi-Square' },
  { value: 'correlation', label: 'Correlation' },
  { value: 'regression', label: 'Regression' },
];

const POWER_LEVELS = [0.7, 0.8, 0.85, 0.9, 0.95];

function getEffectSizes(testType) {
  switch (testType) {
    case 'ttest': {
      const sizes = [];
      for (let d = 0.2; d <= 1.2; d = Math.round((d + 0.1) * 100) / 100) sizes.push(d);
      return sizes;
    }
    case 'anova': {
      const sizes = [];
      for (let f = 0.1; f <= 0.6; f = Math.round((f + 0.05) * 100) / 100) sizes.push(f);
      return sizes;
    }
    case 'chisq': {
      const sizes = [];
      for (let w = 0.1; w <= 0.7; w = Math.round((w + 0.1) * 100) / 100) sizes.push(w);
      return sizes;
    }
    case 'correlation': {
      const sizes = [];
      for (let r = 0.1; r <= 0.7; r = Math.round((r + 0.05) * 100) / 100) sizes.push(r);
      return sizes;
    }
    case 'regression': {
      const sizes = [];
      for (let f2 = 0.02; f2 <= 0.35; f2 = Math.round((f2 + 0.03) * 100) / 100) sizes.push(f2);
      return sizes;
    }
    default:
      return [];
  }
}

function getEffectLabel(testType) {
  switch (testType) {
    case 'ttest': return "Cohen's d";
    case 'anova': return "Cohen's f";
    case 'chisq': return "Cohen's w";
    case 'correlation': return 'r';
    case 'regression': return 'f²';
    default: return 'Effect Size';
  }
}

export default function SampleSizeTable() {
  const [testType, setTestType] = useState('ttest');
  const [sigLevel, setSigLevel] = useState(0.05);
  const [groups, setGroups] = useState(3);
  const [predictors, setPredictors] = useState(3);
  const [df, setDf] = useState(1);
  const [result, setResult] = useState(null);
  const exportRef = useRef(null);

  const handleCalculate = () => {
    const effectSizes = getEffectSizes(testType);
    const extraParams = {};
    if (testType === 'anova') extraParams.k = groups;
    if (testType === 'regression') extraParams.u = predictors;
    if (testType === 'chisq') extraParams.df = df;

    const res = sampleSizeTable({
      effectSizes,
      powers: POWER_LEVELS,
      sigLevel,
      testType,
      extraParams,
    });

    setResult({ tableData: res.table, effectSizes, testType, sigLevel });
  };

  useEffect(() => { handleCalculate(); }, []);

  const testLabel = TEST_TYPES.find(t => t.value === testType)?.label;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Sample Size Table Generator</h1>
        <p className="page-subtitle">Generate comprehensive sample size tables for publications and grants</p>
      </div>
      <div className="page-body">
        <div className="two-col-layout">
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

              <Slider label="Significance Level" sublabel="&alpha;" value={sigLevel} onChange={setSigLevel} min={0.01} max={0.1} step={0.01} />

              {testType === 'anova' && (
                <Slider label="Number of Groups" value={groups} onChange={(v) => setGroups(Math.round(v))} min={2} max={10} step={1} format={v => Math.round(v)} />
              )}

              {testType === 'regression' && (
                <Slider label="Number of Predictors" value={predictors} onChange={(v) => setPredictors(Math.round(v))} min={1} max={20} step={1} format={v => Math.round(v)} />
              )}

              {testType === 'chisq' && (
                <Slider label="Degrees of Freedom" value={df} onChange={(v) => setDf(Math.round(v))} min={1} max={10} step={1} format={v => Math.round(v)} />
              )}

              <button className="btn btn-primary btn-block" onClick={handleCalculate}>Generate Table</button>
            </div>
          </div>

          <div ref={exportRef}>
            {result ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="card-title">Sample Size Table</h2>
                      <p className="card-subtitle">{testLabel} &mdash; &alpha; = {result.sigLevel}</p>
                    </div>
                    <ExportButton targetRef={exportRef} filename="sample-size-table" />
                  </div>
                  <div className="card-body" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{getEffectLabel(result.testType)}</th>
                          {POWER_LEVELS.map(p => (
                            <th key={p}>Power = {p}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.tableData.map((row, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{result.effectSizes[i]}</td>
                            {row.map((cell, j) => (
                              <td key={j}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <h3>Configure Your Table</h3>
                  <p>Select a test type and click Generate Table to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
