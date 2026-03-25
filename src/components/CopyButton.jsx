import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ getText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const text = getText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
