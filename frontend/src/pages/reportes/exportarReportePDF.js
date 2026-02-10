import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarReportePDF = (
  reporteGeneral,
  habitacionesMasReservadas,
  estadisticasPorEstado,
  diasMasReservas,
  fechaInicio,
  fechaFin
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // ============================
  // CARGAR LOGO
  // ============================
  const cargarLogo = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/logo1.png';
    });
  };

  // ============================
  // ENCABEZADO SIN FONDO Y CENTRADO
  // ============================
  const agregarEncabezado = async () => {
    // Cargar logo
    const logo = await cargarLogo();
    if (logo) {
      try {
        // Logo centrado (ajusta el tamaño según necesites)
        const logoWidth = 50;
        const logoHeight = 35;
        const logoX = (pageWidth - logoWidth) / 2; // Centrar horizontalmente
        doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
    }
    
    // Subtítulo 1 - Centrado
    doc.setTextColor(55, 65, 81); // gray-700
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestion Hotelera', pageWidth / 2, 52, { align: 'center' });
    
    // Línea decorativa dorada - Centrada
    const lineWidth = 80;
    const lineX = (pageWidth - lineWidth) / 2;
    doc.setDrawColor(251, 191, 36); // amber-400
    doc.setLineWidth(0.8);
    doc.line(lineX, 57, lineX + lineWidth, 57);
    
    // Subtítulo 2 - Centrado
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('REPORTE DE RESERVAS Y ANALISIS', pageWidth / 2, 65, { align: 'center' });
  };

  // ============================
  // FOOTER
  // ============================
  const agregarFooter = (numeroPagina, totalPaginas) => {
    // Línea decorativa superior
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
    
    // Fondo claro
    doc.setFillColor(249, 250, 251);
    doc.rect(0, pageHeight - 24, pageWidth, 24, 'F');
    
    // Información del footer
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Izquierda: Fecha de generación
    doc.text(`Generado: ${fechaGeneracion}`, 14, pageHeight - 15);
    
    // Centro: Nombre de la empresa
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Hostal Suri', pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Derecha: Paginación
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Pagina ${numeroPagina} de ${totalPaginas}`, pageWidth - 14, pageHeight - 15, { align: 'right' });
    
    // Información adicional
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text('www.hostalsuri.com | info@hostalsuri.com | Tel: +591 4 123 4567', pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  // ============================
  // TÍTULOS DE SECCIÓN
  // ============================
  const agregarTituloSeccion = (titulo, y, color = [37, 99, 235]) => {
    // Barra de color a la izquierda
    doc.setFillColor(...color);
    doc.rect(10, y, 4, 14, 'F');
    
    // Fondo de la sección
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 24, 14, 2, 2, 'F');
    
    // Borde sutil
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, pageWidth - 24, 14, 2, 2, 'S');
    
    // Texto del título
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(titulo, 20, y + 9);
    
    return y + 20;
  };

  // ============================
  // CAJAS DE INFORMACIÓN
  // ============================
  const agregarCajaInfo = (titulo, valor, x, y, ancho, color) => {
    // Fondo
    doc.setFillColor(...color.light);
    doc.roundedRect(x, y, ancho, 22, 3, 3, 'F');
    
    // Borde
    doc.setDrawColor(...color.main);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, ancho, 22, 3, 3, 'S');
    
    // Título
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color.text);
    doc.text(titulo, x + 8, y + 10);
    
    // Valor
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color.main);
    doc.text(valor.toString(), x + 8, y + 18);
  };

  // ============================
  // GENERAR PDF
  // ============================
  const generarPDF = async () => {
    await agregarEncabezado();
    yPos = 75; // 👈 Ajustado para dar espacio al nuevo encabezado

    // Cuadro de información del período
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(10, yPos, pageWidth - 20, 24, 3, 3, 'F');
    
    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.5);
    doc.roundedRect(10, yPos, pageWidth - 20, 24, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('PERIODO DEL REPORTE', 16, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(`Desde:`, 16, yPos + 16);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(fechaInicio).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }), 32, yPos + 16);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Hasta:`, 100, yPos + 16);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(fechaFin).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }), 116, yPos + 16);
    
    yPos += 32;

    // TARJETAS DE RESUMEN
    yPos = agregarTituloSeccion('RESUMEN EJECUTIVO', yPos, [37, 99, 235]);
    
    const cajas = [
      { 
        titulo: 'Total Reservas', 
        valor: reporteGeneral.resumen.total_reservas,
        color: { main: [37, 99, 235], light: [219, 234, 254], text: [30, 64, 175] }
      },
      { 
        titulo: 'Total Noches', 
        valor: reporteGeneral.resumen.total_noches,
        color: { main: [139, 92, 246], light: [233, 213, 255], text: [107, 33, 168] }
      },
      { 
        titulo: 'Ingresos Totales', 
        valor: `Bs. ${reporteGeneral.resumen.total_ingresos}`,
        color: { main: [22, 163, 74], light: [220, 252, 231], text: [21, 128, 61] }
      },
      { 
        titulo: 'Ingreso Promedio', 
        valor: `Bs. ${reporteGeneral.resumen.ingreso_promedio}`,
        color: { main: [245, 158, 11], light: [254, 243, 199], text: [217, 119, 6] }
      }
    ];

    const anchoCaja = (pageWidth - 32) / 2;
    cajas.forEach((caja, index) => {
      const x = 10 + (index % 2) * (anchoCaja + 4);
      const y = yPos + Math.floor(index / 2) * 26;
      agregarCajaInfo(caja.titulo, caja.valor, x, y, anchoCaja, caja.color);
    });

    yPos += 58;

    // TABLA DE DETALLE DE RESERVAS
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    yPos = agregarTituloSeccion('DETALLE DE RESERVAS', yPos, [37, 99, 235]);

    const reservasData = reporteGeneral.reservas.map(r => [
      r.numero_habitacion,
      `${r.cliente_nombre} ${r.cliente_apellido}`,
      new Date(r.fecha_entrada).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      new Date(r.fecha_salida).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      r.noches.toString(),
      parseFloat(r.total).toFixed(2),
      r.estado.toUpperCase()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Hab.', 'Cliente', 'Entrada', 'Salida', 'Noches', 'Total (Bs.)', 'Estado']],
      body: reservasData,
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 8, 
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 45 },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 24, halign: 'center' },
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 7 }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const estado = data.cell.raw.toLowerCase();
          if (estado === 'confirmada') {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [34, 197, 94];
          } else if (estado === 'pendiente') {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [251, 191, 36];
          } else if (estado === 'cancelada') {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [239, 68, 68];
          } else {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [59, 130, 246];
          }
        }
      }
    });

    // PÁGINA 2: ESTADÍSTICAS
    doc.addPage();
    yPos = 20;

    // HABITACIONES MÁS RESERVADAS
    yPos = agregarTituloSeccion('TOP 10 HABITACIONES MAS RESERVADAS', yPos, [139, 92, 246]);

    const habitacionesData = habitacionesMasReservadas.slice(0, 10).map(h => [
      h.numero,
      h.tipo,
      h.piso?.toString() || '-',
      h.total_reservas.toString(),
      h.total_noches?.toString() || '0',
      parseFloat(h.ingresos_generados).toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Tipo de Habitacion', 'Piso', 'Reservas', 'Noches', 'Ingresos (Bs.)']],
      body: habitacionesData,
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 92, 246], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold', fillColor: [243, 232, 255] },
        1: { cellWidth: 50 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [139, 92, 246] },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [250, 250, 251] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ESTADÍSTICAS POR ESTADO
    yPos = agregarTituloSeccion('DISTRIBUCION POR ESTADO', yPos, [16, 185, 129]);

    const estadosData = estadisticasPorEstado.map(e => [
      e.estado.toUpperCase(),
      e.cantidad.toString(),
      e.total_noches?.toString() || '0',
      parseFloat(e.ingresos_totales).toFixed(2),
      parseFloat(e.ingreso_promedio).toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Estado', 'Cantidad', 'Noches', 'Ingresos Totales (Bs.)', 'Promedio (Bs.)']],
      body: estadosData,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center', fontStyle: 'bold', fillColor: [220, 252, 231] },
        1: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // DÍAS CON MÁS RESERVAS
    if (yPos > 180) {
      doc.addPage();
      yPos = 20;
    }

    yPos = agregarTituloSeccion('TOP 10 DIAS CON MAYOR OCUPACION', yPos, [245, 158, 11]);

    const diasData = diasMasReservas.slice(0, 10).map(d => [
      new Date(d.fecha).toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short',
        year: '2-digit'
      }),
      d.total_reservas.toString(),
      d.habitaciones_ocupadas.toString(),
      parseFloat(d.ingresos_del_dia).toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Reservas', 'Habitaciones Ocupadas', 'Ingresos (Bs.)']],
      body: diasData,
      theme: 'grid',
      headStyles: { 
        fillColor: [245, 158, 11], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 65, fontStyle: 'bold', fillColor: [254, 243, 199] },
        1: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [245, 158, 11] },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // AGREGAR FOOTERS
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      agregarFooter(i, totalPaginas);
    }

    // GUARDAR PDF
    const fechaInicioFormato = fechaInicio.replace(/-/g, '');
    const fechaFinFormato = fechaFin.replace(/-/g, '');
    const fileName = `Reporte_Hostal_Suri_${fechaInicioFormato}_${fechaFinFormato}.pdf`;
    
    doc.save(fileName);
  };

  generarPDF();
};