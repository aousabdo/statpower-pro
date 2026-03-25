import { AlertTriangle } from 'lucide-react';

export default function ValidationWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="validation-warnings">
      {warnings.map((w, i) => (
        <div key={i} className="validation-warning">
          <AlertTriangle />
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}
