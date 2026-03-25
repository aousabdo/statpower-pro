import { useState, useRef, useEffect } from 'react';

export default function Slider({ label, sublabel, value, onChange, min, max, step = 0.01, format }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const display = format ? format(value) : value;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setEditValue(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      // Round to step precision
      const rounded = Math.round(clamped / step) * step;
      onChange(parseFloat(rounded.toFixed(10)));
    }
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div className="form-group">
      <div className="slider-container">
        <div className="slider-header">
          <label className="form-label" style={{ marginBottom: 0 }}>
            {label}
            {sublabel && <span className="form-sublabel">{sublabel}</span>}
          </label>
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              className="slider-value-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              min={min}
              max={max}
              step={step}
            />
          ) : (
            <span className="slider-value" onClick={startEdit} title="Click to type exact value" style={{ cursor: 'text' }}>
              {display}
            </span>
          )}
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
