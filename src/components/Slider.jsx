export default function Slider({ label, sublabel, value, onChange, min, max, step = 0.01, format }) {
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
      </div>
    </div>
  );
}
