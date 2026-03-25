import { useEffect } from 'react';

export default function KeyboardShortcuts({ onExport, onNavigate }) {
  useEffect(() => {
    const handler = (e) => {
      // Cmd/Ctrl + E = Export PDF
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        if (onExport) onExport();
      }
      // Cmd/Ctrl + K = Search/navigate (could open a command palette later)
      // ? = Show keyboard shortcuts help
      if (e.key === '?' && !e.target.closest('input, select, textarea')) {
        e.preventDefault();
        // Could show a help modal
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExport, onNavigate]);

  return null; // This is a headless component
}
