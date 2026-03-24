import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExportButton({ targetRef, filename = 'statpower-results' }) {
  const handleExport = async () => {
    if (!targetRef.current) return;

    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={handleExport}>
      <Download size={14} />
      Export PDF
    </button>
  );
}
