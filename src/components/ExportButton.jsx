import { Download, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExportButton({ targetRef, filename = 'statpower-results' }) {

  const captureWithBranding = async () => {
    if (!targetRef.current) return null;
    const el = targetRef.current;

    // ── Force light mode during capture so dark-mode text is readable on white ──
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const wasDark = currentTheme === 'dark';

    if (wasDark) {
      root.setAttribute('data-theme', 'light');
      await new Promise((r) => setTimeout(r, 80)); // let browser repaint
    }

    // Step 1: Capture content with proper light-mode contrast
    const contentCanvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    // Restore theme immediately after capture
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

    // Step 3: Compose final canvas with branded header + content + footer
    const pad = 64;
    const headerH = 120;
    const footerH = 70;
    const gap = 24;
    const dividerPad = 8;
    const totalW = contentCanvas.width + pad * 2;
    const totalH = headerH + gap + contentCanvas.height + gap + footerH;

    const final = document.createElement('canvas');
    final.width = totalW;
    final.height = totalH;
    const ctx = final.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    // ── Header: large colored logo ──
    const logoH = 56;
    const logoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * logoH : 180;
    ctx.drawImage(logo, pad, (headerH - logoH) / 2, logoW, logoH);

    // Right side: StatPower Pro branding
    ctx.textAlign = 'right';
    ctx.fillStyle = '#18181b';
    ctx.font = '700 22px Inter, -apple-system, sans-serif';
    ctx.fillText('StatPower Pro', totalW - pad, headerH / 2 - 6);
    ctx.fillStyle = '#71717a';
    ctx.font = '500 14px Inter, -apple-system, sans-serif';
    ctx.fillText('Research Design Toolkit', totalW - pad, headerH / 2 + 16);

    // Header divider — teal accent line
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad, headerH - dividerPad);
    ctx.lineTo(totalW - pad, headerH - dividerPad);
    ctx.stroke();

    // ── Content ──
    ctx.drawImage(contentCanvas, pad, headerH + gap);

    // ── Footer ──
    const footerY = headerH + gap + contentCanvas.height + gap;

    // Footer divider
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, footerY);
    ctx.lineTo(totalW - pad, footerY);
    ctx.stroke();

    // Footer: small logo left + text
    const footLogoH = 24;
    const footLogoW = logo.naturalWidth ? (logo.naturalWidth / logo.naturalHeight) * footLogoH : 80;
    ctx.drawImage(logo, pad, footerY + 18, footLogoW, footLogoH);

    // Footer text right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 15px Inter, -apple-system, sans-serif';
    ctx.fillText('analyticadss.com', totalW - pad, footerY + 24);
    ctx.font = '400 13px Inter, -apple-system, sans-serif';
    ctx.fillText(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      totalW - pad, footerY + 44
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
