import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfExportData {
  revenue: number;
  aov: number;
  completedOrders: number;
  occupancyPercent: number;
  eventRevenues: { event_name: string; tickets: number; orders: number; revenue: number }[];
  commissionData: { totalRevenue: number; dulosCommission: number; producerShare: number };
  zoneRevenues: { zone: string; revenue: number }[];
}

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value);
}

export function exportFinancePdf(data: PdfExportData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // === HEADER BAR ===
  doc.setFillColor(26, 26, 46); // #1a1a2e
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Dulos branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(239, 68, 68); // #EF4444
  doc.text('DULOS', margin, 18);
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Reporte Financiero', margin, 27);

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(dateStr, pageWidth - margin, 27, { align: 'right' });

  y = 46;

  // === RED ACCENT LINE ===
  doc.setFillColor(239, 68, 68);
  doc.rect(margin, y, contentWidth, 1, 'F');
  y += 8;

  // === SCORECARD ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Resumen Ejecutivo', margin, y);
  y += 8;

  const metrics = [
    { label: 'Ingresos Totales', value: fmtCurrency(data.revenue) },
    { label: 'Ticket Promedio', value: fmtCurrency(data.aov) },
    { label: 'Órdenes', value: data.completedOrders.toLocaleString() },
    { label: 'Ocupación', value: `${data.occupancyPercent.toFixed(1)}%` },
  ];

  const cardW = contentWidth / 4 - 3;
  metrics.forEach((m, i) => {
    const x = margin + i * (cardW + 4);
    // Card background
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');
    // Border
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'S');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(m.label.toUpperCase(), x + cardW / 2, y + 8, { align: 'center' });
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(m.value, x + cardW / 2, y + 17, { align: 'center' });
  });

  y += 32;

  // === REVENUE BY EVENT TABLE ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Ingresos por Evento', margin, y);
  y += 4;

  const eventRows = data.eventRevenues.map(e => [
    e.event_name,
    e.tickets.toLocaleString(),
    e.orders.toLocaleString(),
    fmtCurrency(e.revenue),
    fmtCurrency(e.revenue * 0.15),
  ]);

  // Total row
  const totalRev = data.eventRevenues.reduce((s, e) => s + e.revenue, 0);
  const totalTix = data.eventRevenues.reduce((s, e) => s + e.tickets, 0);
  const totalOrd = data.eventRevenues.reduce((s, e) => s + e.orders, 0);
  eventRows.push(['TOTAL', totalTix.toLocaleString(), totalOrd.toLocaleString(), fmtCurrency(totalRev), fmtCurrency(totalRev * 0.15)]);

  autoTable(doc, {
    startY: y,
    head: [['Evento', 'Boletos', 'Órdenes', 'Revenue', 'Comisión (15%)']],
    body: eventRows,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    // Style last row (total) differently
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === eventRows.length - 1) {
        hookData.cell.styles.fillColor = [26, 26, 46];
        hookData.cell.styles.textColor = [255, 255, 255];
        hookData.cell.styles.fontStyle = 'bold';
      }
      // Red for commission column
      if (hookData.section === 'body' && hookData.column.index === 4 && hookData.row.index !== eventRows.length - 1) {
        hookData.cell.styles.textColor = [239, 68, 68];
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
    theme: 'grid',
    styles: {
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 10;

  // === ZONE REVENUE ===
  if (data.zoneRevenues.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Revenue por Zona', margin, y);
    y += 4;

    const zoneRows = data.zoneRevenues.map(z => [z.zone, fmtCurrency(z.revenue)]);

    autoTable(doc, {
      startY: y,
      head: [['Zona', 'Revenue']],
      body: zoneRows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      theme: 'grid',
      styles: { lineColor: [230, 230, 230], lineWidth: 0.1 },
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 10;
  }

  // === COMMISSION SUMMARY ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Resumen de Comisiones', margin, y);
  y += 6;

  const commCards = [
    { label: 'INGRESOS BRUTOS', value: fmtCurrency(data.commissionData.totalRevenue), color: [30, 30, 30] },
    { label: 'COMISIÓN DULOS (15%)', value: fmtCurrency(data.commissionData.dulosCommission), color: [239, 68, 68] },
    { label: 'PRODUCTOR (85%)', value: fmtCurrency(data.commissionData.producerShare), color: [16, 185, 129] },
  ];

  const commCardW = contentWidth / 3 - 3;
  commCards.forEach((c, i) => {
    const x = margin + i * (commCardW + 4.5);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(x, y, commCardW, 22, 2, 2, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, y, commCardW, 22, 2, 2, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(c.label, x + commCardW / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.value, x + commCardW / 2, y + 17, { align: 'center' });
  });

  y += 30;

  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(26, 26, 46);
  doc.rect(0, footerY - 4, pageWidth, 20, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado por Dulos Admin Dashboard', margin, footerY + 2);
  doc.text(`${dateStr} — Confidencial`, pageWidth - margin, footerY + 2, { align: 'right' });

  // Red accent line above footer
  doc.setFillColor(239, 68, 68);
  doc.rect(0, footerY - 5, pageWidth, 1, 'F');

  doc.save(`Dulos_Reporte_Financiero_${now.toISOString().split('T')[0]}.pdf`);
}
