export default function Slider({ label, sublabel, value, onChange, min, max, step = 0.01, format, presets }) {
  const display = format ? format(value) : value;

  return (
    <div className="form-group">
      <div className="slider-container">
        <div className="slider-header">
          <label className="form-label" style={{ marginBottom: 0 }}>
            {label}
            {sublabel && <span className="form-sublabel">{sublabel}</span>}
          </label>
          <span className="slider-value">{display}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        {presets && (
          <div className="preset-chips">
            {presets.map((p) => (
              <button
                key={p.label}
                className={`preset-chip ${Math.abs(value - p.value) < 0.001 ? 'active' : ''}`}
                onClick={() => onChange(p.value)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
