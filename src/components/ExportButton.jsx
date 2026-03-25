import { Download, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExportButton({ targetRef, filename = 'statpower-results' }) {

  const captureWithBranding = async () => {
    if (!targetRef.current) return null;
    const el = targetRef.current;

    // ── Force light mode + boost contrast during capture ──
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const wasDark = currentTheme === 'dark';

    root.classList.add('export-mode');
    if (wasDark) {
      root.setAttribute('data-theme', 'light');
    }
    await new Promise((r) => setTimeout(r, 100));

    // Capture at 2x — all canvas coordinates below are in 2x pixel space
    const contentCanvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    // Restore immediately
    root.classList.remove('export-mode');
    if (wasDark) {
      root.setAttribute('data-theme', currentTheme);
    }

    // Load logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = import.meta.env.BASE_URL + 'analytica-logo.png';
    await new Promise(resolve => {
      if (logo.complete) resolve();
      else { logo.onload = resolve; logo.onerror = resolve; }
    });

    // ── All values below are in 2x pixel space (matching scale:2) ──
    const pad = 120;
    const headerH = 240;
    const footerH = 160;
    const gap = 48;
    const totalW = contentCanvas.width + pad * 2;
    const totalH = headerH + gap + contentCanvas.height + gap + footerH;

    const final = document.createElement('canvas');
    final.width = totalW;
    final.height = totalH;
    const ctx = final.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    // ── Header logo — prominent ──
    const logoH = 140;
    const logoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * logoH : 420;
    ctx.drawImage(logo, pad, (headerH - logoH) / 2, logoW, logoH);

    // Right side branding
    ctx.textAlign = 'right';
    ctx.fillStyle = '#09090b';
    ctx.font = '700 48px Inter, -apple-system, sans-serif';
    ctx.fillText('StatPower Pro', totalW - pad, headerH / 2 - 10);
    ctx.fillStyle = '#52525b';
    ctx.font = '500 28px Inter, -apple-system, sans-serif';
    ctx.fillText('Research Design Toolkit', totalW - pad, headerH / 2 + 30);

    // Teal divider
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pad, headerH - 16);
    ctx.lineTo(totalW - pad, headerH - 16);
    ctx.stroke();

    // ── Content ──
    ctx.drawImage(contentCanvas, pad, headerH + gap);

    // ── Footer ──
    const footerY = headerH + gap + contentCanvas.height + gap;

    // Divider
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, footerY);
    ctx.lineTo(totalW - pad, footerY);
    ctx.stroke();

    // Footer logo — clearly visible
    const footLogoH = 60;
    const footLogoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * footLogoH : 200;
    ctx.drawImage(logo, pad, footerY + 40, footLogoW, footLogoH);

    // Footer text
    ctx.textAlign = 'right';
    ctx.fillStyle = '#52525b';
    ctx.font = '600 28px Inter, -apple-system, sans-serif';
    ctx.fillText('analyticadss.com', totalW - pad, footerY + 56);
    ctx.fillStyle = '#71717a';
    ctx.font = '400 24px Inter, -apple-system, sans-serif';
    ctx.fillText(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      totalW - pad, footerY + 92
    );

    return final;
  };

  const handleExportPDF = async () => {
    const canvas = await captureWithBranding();
    if (!canvas) return;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${filename}.pdf`);
  };

  const handleCopyImage = async () => {
    const canvas = await captureWithBranding();
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn-secondary btn-sm" onClick={handleCopyImage} title="Copy to clipboard">
        <Copy size={14} />
        Copy
      </button>
      <button className="btn btn-secondary btn-sm" onClick={handleExportPDF} title="Download PDF">
        <Download size={14} />
        Export PDF
      </button>
    </div>
  );
}
