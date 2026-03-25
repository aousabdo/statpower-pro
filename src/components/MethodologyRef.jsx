import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathBlock({ tex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && tex) {
      try {
        katex.render(tex, ref.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        });
      } catch {
        ref.current.textContent = tex;
      }
    }
  }, [tex]);
  return <div ref={ref} style={{ overflowX: 'auto', padding: '4px 0' }} />;
}

function MathInline({ tex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && tex) {
      try {
        katex.render(tex, ref.current, {
          displayMode: false,
          throwOnError: false,
          trust: true,
        });
      } catch {
        ref.current.textContent = tex;
      }
    }
  }, [tex]);
  return <span ref={ref} />;
}

export { MathBlock, MathInline };

export default function MethodologyRef({ formula, formulaNote, references = [], assumptions = [], limitations = [] }) {
  const [expanded, setExpanded] = useState(false);

  const sectionStyle = {
    marginTop: 24,
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)',
    overflow: 'hidden',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    cursor: 'pointer',
    background: 'var(--bg-tertiary)',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    transition: 'background 0.15s',
  };

  const bodyStyle = {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  const subHeadingStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const listStyle = {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
  };

  const formulaBoxStyle = {
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    padding: '16px 20px',
    overflowX: 'auto',
    lineHeight: 1.6,
  };

  const refStyle = {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    paddingLeft: 20,
    textIndent: -20,
    marginBottom: 4,
  };

  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div style={sectionStyle}>
      <button style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <BookOpen size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          About the Math
          {!expanded && formulaNote && (
            <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>
              — {formulaNote}
            </span>
          )}
        </span>
        <Chevron size={16} style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {expanded && (
        <div style={bodyStyle}>
          {/* Formula */}
          {formula && (
            <div>
              <div style={subHeadingStyle}>Formula</div>
              <div style={formulaBoxStyle}>
                <MathBlock tex={formula} />
                {formulaNote && (
                  <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
                    {formulaNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div>
              <div style={subHeadingStyle}>Assumptions</div>
              <ul style={listStyle}>
                {assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations */}
          {limitations.length > 0 && (
            <div>
              <div style={subHeadingStyle}>Limitations</div>
              <ul style={listStyle}>
                {limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}

          {/* References */}
          {references.length > 0 && (
            <div>
              <div style={subHeadingStyle}>References</div>
              <div>
                {references.map((ref, i) => (
                  <div key={i} style={refStyle}>
                    {ref.author} ({ref.year}). <em>{ref.title}</em>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
