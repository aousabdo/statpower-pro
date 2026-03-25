import { useState } from 'react';
import { Quote } from 'lucide-react';

export default function CiteButton() {
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();

  const apa = `Analytica Data Science Solutions. (${year}). StatPower Pro: Statistical power analysis toolkit [Web application]. https://statpower.analyticadss.com`;

  const bibtex = `@misc{statpowerpro${year},
  title = {StatPower Pro: Statistical Power Analysis Toolkit},
  author = {{Analytica Data Science Solutions}},
  year = {${year}},
  url = {https://statpower.analyticadss.com},
  note = {Web application}
}`;

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 8px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontFamily: 'var(--font-sans)',
        }}
        title="Cite this tool"
      >
        <Quote size={14} />
        Cite
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      }} />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px', zIndex: 1001,
        width: 520, maxWidth: '90vw', boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Cite StatPower Pro</h3>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>APA Format</label>
            <button onClick={() => copyText(apa)} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Copy</button>
          </div>
          <div style={{
            fontSize: 12.5, lineHeight: 1.6, padding: '12px 14px',
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
          }}>{apa}</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>BibTeX</label>
            <button onClick={() => copyText(bibtex)} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Copy</button>
          </div>
          <pre style={{
            fontSize: 11.5, lineHeight: 1.5, padding: '12px 14px',
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap', margin: 0, overflow: 'auto',
          }}>{bibtex}</pre>
        </div>

        <button onClick={() => setOpen(false)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Close</button>
      </div>
    </>
  );
}
