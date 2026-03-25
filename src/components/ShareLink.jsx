import { useState } from 'react';
import { Link, Check } from 'lucide-react';

const BASE_URL = 'https://statpower.analyticadss.com';

export default function ShareLink({ page, params = {} }) {
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    return `${BASE_URL}/#${page}${query ? '?' + query : ''}`;
  };

  const handleCopy = async () => {
    const url = buildUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: copied ? 'var(--success)' : 'none',
    color: copied ? '#fff' : 'var(--text-secondary)',
    border: copied ? '1px solid var(--success)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    transition: 'all 0.2s',
  };

  const Icon = copied ? Check : Link;

  return (
    <button style={buttonStyle} onClick={handleCopy} title="Copy shareable link">
      <Icon size={14} />
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
