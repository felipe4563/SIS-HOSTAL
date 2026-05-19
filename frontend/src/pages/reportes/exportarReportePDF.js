import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarReportePDF = (
  reporteGeneral,
  _hab,
  _estados,
  _dias,
  fechaInicio,
  fechaFin
) => {
  const doc  = new jsPDF();
  const W    = doc.internal.pageSize.width;
  const H    = doc.internal.pageSize.height;

  // ── Paleta ────────────────────────────────────────────────────────
  const C = {
    navy:        [15,  23,  42],
    blue:        [37,  99, 235],
    blueLight:   [219,234,254],
    slate:       [71,  85, 105],
    slateLight:  [248,250,252],
    border:      [226,232,240],
    white:       [255,255,255],
    green:       [22, 163,  74],
    greenLight:  [220,252,231],
    yellow:      [202,138,   4],
    yellowLight: [254,243,199],
    red:         [220,  38,  38],
    redLight:    [254,226,226],
    indigo:      [79,  70, 229],
    indigoLight: [224,231,255],
  };

  const STATUS = {
    confirmada: { text: C.green,  fill: C.greenLight  },
    pendiente:  { text: C.yellow, fill: C.yellowLight },
    cancelada:  { text: C.red,    fill: C.redLight    },
    finalizada: { text: C.indigo, fill: C.indigoLight },
  };

  // ── Utilidades ────────────────────────────────────────────────────
  const fmt = (n) => parseFloat(n || 0).toFixed(2);

  const fmtCorta = (f) => {
    if (!f) return '';
    return new Date(f + (f.includes('T') ? '' : 'T12:00:00'))
      .toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const fmtLarga = (f) => {
    if (!f) return '';
    return new Date(f + (f.includes('T') ? '' : 'T12:00:00'))
      .toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // ── Cabecera principal ────────────────────────────────────────────
  const drawHeader = async () => {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 40, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(0, 37, W, 3, 'F');

    const logo = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload  = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/logo1.png';
    });
    if (logo) {
      try { doc.addImage(logo, 'PNG', 13, 6, 26, 26); } catch {}
    }

    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('HOSTAL SURI', W - 14, 16, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('SISTEMA DE GESTIÓN HOTELERA', W - 14, 23, { align: 'right' });
    doc.text('Cochabamba, Bolivia', W - 14, 29, { align: 'right' });

    // Título del documento
    doc.setTextColor(...C.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INFORME EJECUTIVO DE RESERVAS', 14, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.slate);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      14, 59
    );

    return 66;
  };

  // ── Banda de período ──────────────────────────────────────────────
  const drawPeriod = (y) => {
    doc.setFillColor(...C.slateLight);
    doc.rect(14, y, W - 28, 15, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.rect(14, y, W - 28, 15, 'S');
    doc.setFillColor(...C.blue);
    doc.rect(14, y, 3, 15, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate);
    doc.text('PERÍODO DE ANÁLISIS', 21, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.navy);
    doc.text(`${fmtLarga(fechaInicio)}   →   ${fmtLarga(fechaFin)}`, 21, y + 12.5);

    return y + 21;
  };

  // ── Título de sección ─────────────────────────────────────────────
  const drawSection = (title, y) => {
    doc.setFillColor(...C.blue);
    doc.rect(14, y, 3, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.navy);
    doc.text(title, 20, y + 6);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(14, y + 10, W - 14, y + 10);
    return y + 16;
  };

  // ── Tarjeta KPI ───────────────────────────────────────────────────
  const drawKPI = (label, value, sub, x, y, w, accent) => {
    doc.setFillColor(...C.white);
    doc.rect(x, y, w, 26, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.rect(x, y, w, 26, 'S');
    doc.setFillColor(...accent);
    doc.rect(x, y, w, 3.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate);
    doc.text(label.toUpperCase(), x + 4, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.navy);
    doc.text(value.toString(), x + 4, y + 19.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.slate);
    doc.text(sub, x + 4, y + 24);
  };

  // ── Footer ────────────────────────────────────────────────────────
  const drawFooter = (page, total) => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(14, H - 15, W - 14, H - 15);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate);
    doc.text('DOCUMENTO CONFIDENCIAL', 14, H - 8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Página ${page} de ${total}`, W / 2, H - 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Hostal Suri © 2025', W - 14, H - 8, { align: 'right' });
  };

  // ── Cabecera mini (páginas internas) ──────────────────────────────
  const drawMiniHeader = (subtitle) => {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 13, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(0, 11, W, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.white);
    doc.text(`HOSTAL SURI  ·  ${subtitle}`, W / 2, 9, { align: 'center' });
    return 20;
  };

  // ── Generación ────────────────────────────────────────────────────
  const generate = async () => {
    let y = await drawHeader();

    // Período
    y = drawPeriod(y);

    // KPIs
    y = drawSection('INDICADORES CLAVE', y);
    const kW = (W - 30) / 4;
    [
      { label: 'Total Reservas',    value: reporteGeneral.resumen.total_reservas,                        sub: 'unidades registradas',   accent: C.blue    },
      { label: 'Noches Hospedadas', value: reporteGeneral.resumen.total_noches,                          sub: 'días de ocupación',      accent: [16,185,129] },
      { label: 'Ingresos Totales',  value: `Bs. ${fmt(reporteGeneral.resumen.total_ingresos)}`,          sub: 'bolivianos facturados',  accent: [34,197,94]  },
      { label: 'Ticket Promedio',   value: `Bs. ${fmt(reporteGeneral.resumen.ingreso_promedio)}`,        sub: 'por reserva',            accent: [245,158,11] },
    ].forEach((k, i) =>
      drawKPI(k.label, k.value, k.sub, 14 + i * (kW + 2), y, kW, k.accent)
    );
    y += 32;

    // Tabla de reservas
    if (y > 180) { doc.addPage(); y = drawMiniHeader('Detalle de Reservas'); }
    y = drawSection('DETALLE DE RESERVAS', y);

    autoTable(doc, {
      startY: y,
      head: [['#ID', 'Hab.', 'Cliente', 'Entrada', 'Salida', 'Noches', 'Total Bs.', 'Estado']],
      body: reporteGeneral.reservas.map(r => [
        `#${r.id_reserva}`,
        r.numero_habitacion,
        `${r.cliente_nombre} ${r.cliente_apellido}`,
        fmtCorta(r.fecha_entrada),
        fmtCorta(r.fecha_salida),
        (r.noches ?? 0).toString(),
        fmt(r.total),
        (r.estado ?? '').toUpperCase(),
      ]),
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: 3.2,
        lineColor: C.border,
        lineWidth: 0.15,
        textColor: C.navy,
      },
      headStyles: {
        fillColor: C.navy,
        textColor: C.white,
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 3.8,
        lineWidth: 0,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 13, halign: 'center' },
        2: { cellWidth: 45 },
        3: { cellWidth: 19, halign: 'center' },
        4: { cellWidth: 19, halign: 'center' },
        5: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
        6: { cellWidth: 24, halign: 'right',  fontStyle: 'bold' },
        7: { cellWidth: 26, halign: 'center', fontSize: 6.5, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: C.slateLight },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const sc = STATUS[(data.cell.raw ?? '').toLowerCase()];
          if (sc) { data.cell.styles.textColor = sc.text; data.cell.styles.fillColor = sc.fill; }
        }
      },
    });

    // Barra de totales
    const tY = doc.lastAutoTable.finalY;
    doc.setFillColor(...C.navy);
    doc.rect(14, tY, W - 28, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text(`TOTAL REGISTROS: ${reporteGeneral.reservas.length}`, 19, tY + 8);
    doc.text(
      `TOTAL FACTURADO: Bs. ${fmt(reporteGeneral.resumen.total_ingresos)}`,
      W - 19, tY + 8, { align: 'right' }
    );

    // ── Página 2: Análisis ─────────────────────────────────────────
    doc.addPage();
    y = drawMiniHeader('Análisis Complementario');

    // Calcular estadísticas por estado desde las reservas
    const estadosMap = {};
    reporteGeneral.reservas.forEach((r) => {
      const e = r.estado || 'desconocido';
      if (!estadosMap[e]) estadosMap[e] = { cantidad: 0, ingresos: 0, noches: 0 };
      estadosMap[e].cantidad++;
      estadosMap[e].ingresos += parseFloat(r.total || 0);
      estadosMap[e].noches   += r.noches || 0;
    });

    // Tabla distribución por estado
    y = drawSection('DISTRIBUCIÓN POR ESTADO DE RESERVAS', y);

    const stateRows = Object.entries(estadosMap).map(([estado, d]) => [
      estado.toUpperCase(),
      d.cantidad.toString(),
      d.noches.toString(),
      `Bs. ${fmt(d.ingresos)}`,
      `Bs. ${fmt(d.cantidad > 0 ? d.ingresos / d.cantidad : 0)}`,
    ]);

    if (stateRows.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Estado', 'Reservas', 'Noches', 'Ingresos Totales', 'Promedio / Reserva']],
        body: stateRows,
        theme: 'plain',
        styles: {
          fontSize: 8,
          cellPadding: 3.5,
          lineColor: C.border,
          lineWidth: 0.15,
          textColor: C.navy,
        },
        headStyles: {
          fillColor: C.navy,
          textColor: C.white,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 3.8,
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 50, halign: 'right',  fontStyle: 'bold' },
          4: { cellWidth: 45, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
        alternateRowStyles: { fillColor: C.slateLight },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const sc = STATUS[(data.cell.raw ?? '').toLowerCase()];
            if (sc) { data.cell.styles.textColor = sc.text; data.cell.styles.fillColor = sc.fill; }
          }
        },
      });
      y = doc.lastAutoTable.finalY + 16;
    }

    // Gráfico de barras horizontal
    if (Object.keys(estadosMap).length > 0) {
      y = drawSection('GRÁFICO DE RESERVAS POR ESTADO', y);
      const maxCant   = Math.max(...Object.values(estadosMap).map(d => d.cantidad));
      const barMaxW   = W - 78;
      const rowH      = 14;

      Object.entries(estadosMap).forEach(([estado, d], idx) => {
        const rowY  = y + idx * rowH;
        const barW  = maxCant > 0 ? (d.cantidad / maxCant) * barMaxW : 0;
        const sc    = STATUS[estado];
        const color = sc ? sc.text : C.blue;
        const fill  = sc ? sc.fill : C.blueLight;

        // Etiqueta
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.navy);
        doc.text(estado.toUpperCase(), 14, rowY + 8.5);

        // Fondo barra
        doc.setFillColor(...fill);
        doc.rect(50, rowY + 1, barMaxW, 10, 'F');
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.2);
        doc.rect(50, rowY + 1, barMaxW, 10, 'S');

        // Barra
        if (barW > 0) {
          doc.setFillColor(...color);
          doc.rect(50, rowY + 1, barW, 10, 'F');
        }

        // Valor
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        if (barW > 14) {
          doc.setTextColor(...C.white);
          doc.text(d.cantidad.toString(), 50 + barW - 4, rowY + 7.5, { align: 'right' });
        } else {
          doc.setTextColor(...C.navy);
          doc.text(d.cantidad.toString(), 50 + barW + 4, rowY + 7.5);
        }
      });

      y += Object.keys(estadosMap).length * rowH + 16;
    }

    // Observaciones
    if (y < H - 60) {
      y = drawSection('OBSERVACIONES', y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.slate);
      [
        '• Informe generado automáticamente por el sistema de gestión del Hostal Suri.',
        '• Los datos reflejan las reservas creadas en el período especificado.',
        '• Los ingresos corresponden al total acordado por cada reserva.',
        '• Documento de circulación interna restringida.',
      ].forEach((obs, i) => doc.text(obs, 14, y + i * 6.5));
    }

    // Firmas
    const sigY = H - 45;
    [
      { x1: 22,       x2: 78,       label: 'Elaborado por',  sub: 'Sistema Automático' },
      { x1: W - 78,   x2: W - 22,   label: 'Revisado por',   sub: 'Gerencia General'   },
    ].forEach(({ x1, x2, label, sub }) => {
      const cx = (x1 + x2) / 2;
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.5);
      doc.line(x1, sigY, x2, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C.slate);
      doc.text(label, cx, sigY + 5,  { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(sub,   cx, sigY + 10, { align: 'center' });
    });

    // Footers en todas las páginas
    const nPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= nPages; p++) {
      doc.setPage(p);
      drawFooter(p, nPages);
    }

    const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`Informe_Hostal_Suri_${fecha}.pdf`);
  };

  generate();
};
