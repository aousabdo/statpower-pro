import { useState, useRef, useMemo } from 'react';
import ExportButton from '../components/ExportButton';
import { convertEffectSize } from '../lib/statistics';

const EFFECT_TYPES = [
  { value: 'd', label: "Cohen's d" },
  { value: 'r', label: 'Correlation r' },
  { value: 'eta2', label: 'Eta-squared η²' },
  { value: 'f', label: "Cohen's f" },
  { value: 'f2', label: 'f²' },
  { value: 'or', label: 'Odds Ratio' },
  { value: 'w', label: "Cohen's w" },
];

export default function EffectSizeConverter() {
  const [inputValue, setInputValue] = useState(0.5);
  const [inputType, setInputType] = useState('d');
  const exportRef = useRef(null);

  const displayResults = useMemo(() => {
    const converted = {};
    for (const t of EFFECT_TYPES) {
      converted[t.value] = convertEffectSize(inputValue, inputType, t.value);
    }
    return EFFECT_TYPES.map(t => ({
      key: t.value,
      label: t.label,
      value: converted[t.value],
      isSelf: t.value === inputType,
    }));
  }, [inputValue, inputType]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Effect Size Converter</h1>
        <p className="page-subtitle">Convert between Cohen's d, r, η², f, f², odds ratio, and w</p>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Input card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h2 className="card-title">Parameters</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Input Type</label>
                  <select
                    className="form-select"
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                  >
                    {EFFECT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                    step={0.01}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results grid */}
          <div ref={exportRef}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <ExportButton targetRef={exportRef} filename="effect-size-converter" />
            </div>
            <div className="result-grid animate-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {displayResults.map(r => (
                <div
                  className="stat-card"
                  key={r.key}
                  style={r.isSelf ? { borderColor: '#2563eb', borderWidth: 2 } : {}}
                >
                  <div className="stat-value" style={r.isSelf ? { color: '#2563eb' } : {}}>
                    {isFinite(r.value) ? r.value : '—'}
                  </div>
                  <div className="stat-label">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
