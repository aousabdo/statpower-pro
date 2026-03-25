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

    // Add export-mode class for boosted contrast
    root.classList.add('export-mode');
    if (wasDark) {
      root.setAttribute('data-theme', 'light');
    }
    await new Promise((r) => setTimeout(r, 100));

    // Step 1: Capture content
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

    // Step 2: Load the colored logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = import.meta.env.BASE_URL + 'analytica-logo.png';
    await new Promise(resolve => {
      if (logo.complete) resolve();
      else { logo.onload = resolve; logo.onerror = resolve; }
    });

    // Step 3: Compose final canvas — bigger logo, stronger text
    const pad = 80;
    const headerH = 150;
    const footerH = 90;
    const gap = 32;
    const totalW = contentCanvas.width + pad * 2;
    const totalH = headerH + gap + contentCanvas.height + gap + footerH;

    const final = document.createElement('canvas');
    final.width = totalW;
    final.height = totalH;
    const ctx = final.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    // ── Header: LARGE colored logo ──
    const logoH = 80;
    const logoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * logoH : 240;
    ctx.drawImage(logo, pad, (headerH - logoH) / 2, logoW, logoH);

    // Right side: StatPower Pro branding — bigger text
    ctx.textAlign = 'right';
    ctx.fillStyle = '#09090b';
    ctx.font = '700 28px Inter, -apple-system, sans-serif';
    ctx.fillText('StatPower Pro', totalW - pad, headerH / 2 - 8);
    ctx.fillStyle = '#52525b';
    ctx.font = '500 16px Inter, -apple-system, sans-serif';
    ctx.fillText('Research Design Toolkit', totalW - pad, headerH / 2 + 18);

    // Header divider — teal accent line
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pad, headerH - 10);
    ctx.lineTo(totalW - pad, headerH - 10);
    ctx.stroke();

    // ── Content ──
    ctx.drawImage(contentCanvas, pad, headerH + gap);

    // ── Footer ──
    const footerY = headerH + gap + contentCanvas.height + gap;

    // Footer divider
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, footerY);
    ctx.lineTo(totalW - pad, footerY);
    ctx.stroke();

    // Footer: logo on left — bigger
    const footLogoH = 36;
    const footLogoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * footLogoH : 120;
    ctx.drawImage(logo, pad, footerY + 22, footLogoW, footLogoH);

    // Footer text right — darker
    ctx.textAlign = 'right';
    ctx.fillStyle = '#71717a';
    ctx.font = '600 16px Inter, -apple-system, sans-serif';
    ctx.fillText('analyticadss.com', totalW - pad, footerY + 32);
    ctx.font = '400 14px Inter, -apple-system, sans-serif';
    ctx.fillText(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      totalW - pad, footerY + 54
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
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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
