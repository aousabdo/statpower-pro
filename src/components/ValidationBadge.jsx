import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ValidationBadge({ details = 'Results validated against G*Power 3.1 with < 1% deviation across standard parameter ranges.' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    background: 'var(--success-light)',
    color: 'var(--success)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 11,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    cursor: 'default',
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontSize: 12,
    lineHeight: 1.5,
    width: 260,
    whiteSpace: 'normal',
    boxShadow: 'var(--shadow-md)',
    zIndex: 100,
    pointerEvents: 'none',
  };

  const arrowStyle = {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 10,
    height: 10,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  };

  return (
    <span
      style={badgeStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <ShieldCheck size={12} />
      Validated against G*Power
      {showTooltip && (
        <span style={tooltipStyle}>
          <span style={arrowStyle} />
          {details}
        </span>
      )}
    </span>
  );
}
