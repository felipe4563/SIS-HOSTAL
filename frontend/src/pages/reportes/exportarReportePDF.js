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

  // Colores corporativos formales
  const COLORS = {
    primary: [17, 24, 39],      // gray-900 - Texto principal
    secondary: [55, 65, 81],    // gray-700 - Texto secundario  
    accent: [30, 58, 138],      // blue-900 - Acentos
    light: [243, 244, 246],     // gray-100 - Fondos claros
    border: [209, 213, 219],    // gray-300 - Bordes
    success: [21, 128, 61],     // green-700 - Estados positivos
    warning: [161, 98, 7],      // yellow-700 - Advertencias
    danger: [153, 27, 27]       // red-800 - Estados negativos
  };

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
  // ENCABEZADO FORMAL Y CORPORATIVO
  // ============================
  const agregarEncabezado = async () => {
    // Barra superior azul marino
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Cargar logo
    const logo = await cargarLogo();
    if (logo) {
      try {
        const logoWidth = 40;
        const logoHeight = 28;
        const logoX = 15;
        doc.addImage(logo, 'PNG', logoX, 8, logoWidth, logoHeight);
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
    }
    
    // Información de la empresa (derecha)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HOSTAL SURI', pageWidth - 15, 15, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión Hotelera', pageWidth - 15, 22, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setTextColor(209, 213, 219);
    doc.text('Cochabamba, Bolivia', pageWidth - 15, 28, { align: 'right' });
    doc.text('Tel: +591 4 123 4567', pageWidth - 15, 33, { align: 'right' });
    
    // Línea separadora
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(15, 47, pageWidth - 15, 47);
    
    // Título del documento
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME EJECUTIVO DE RESERVAS', 15, 58);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Documento generado el ${fechaGeneracion}`, 15, 65);
  };

  // ============================
  // FOOTER CORPORATIVO
  // ============================
  const agregarFooter = (numeroPagina, totalPaginas) => {
    // Línea superior
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    
    // Información del footer
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    
    // Izquierda: Confidencialidad
    doc.text('DOCUMENTO CONFIDENCIAL', 15, pageHeight - 12);
    
    // Centro: Paginación
    doc.setFont('helvetica', 'bold');
    doc.text(`Página ${numeroPagina} de ${totalPaginas}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Derecha: Empresa
    doc.setFont('helvetica', 'normal');
    doc.text('Hostal Suri © 2024', pageWidth - 15, pageHeight - 12, { align: 'right' });
    
    // Información de contacto
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text('www.hostalsuri.com | info@hostalsuri.com', pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  // ============================
  // SECCIÓN DE ENCABEZADO
  // ============================
  const agregarSeccion = (titulo, y) => {
    // Línea izquierda
    doc.setFillColor(30, 58, 138);
    doc.rect(15, y, 2, 8, 'F');
    
    // Título
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(titulo, 20, y + 6);
    
    // Línea inferior
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(15, y + 10, pageWidth - 15, y + 10);
    
    return y + 16;
  };

  // ============================
  // CUADRO DE INFORMACIÓN
  // ============================
  const agregarCuadroInfo = (titulo, valor, x, y, ancho) => {
    // Borde
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.rect(x, y, ancho, 16, 'S');
    
    // Título
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(titulo.toUpperCase(), x + 4, y + 6);
    
    // Valor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(valor.toString(), x + 4, y + 13);
  };

  // ============================
  // GENERAR PDF
  // ============================
  const generarPDF = async () => {
    await agregarEncabezado();
    yPos = 73;

    // ===== PERÍODO DEL REPORTE =====
    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPos, pageWidth - 30, 18, 'F');
    
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos, pageWidth - 30, 18, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('PERÍODO DE ANÁLISIS', 20, yPos + 7);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    
    const fechaInicioTexto = new Date(fechaInicio).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    const fechaFinTexto = new Date(fechaFin).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    doc.text(`Desde: ${fechaInicioTexto}`, 20, yPos + 13);
    doc.text(`Hasta: ${fechaFinTexto}`, 110, yPos + 13);
    
    yPos += 26;

    // ===== RESUMEN EJECUTIVO =====
    yPos = agregarSeccion('RESUMEN EJECUTIVO', yPos);
    
    const anchoKPI = (pageWidth - 38) / 4;
    const kpis = [
      { titulo: 'Total Reservas', valor: reporteGeneral.resumen.total_reservas },
      { titulo: 'Total Noches', valor: reporteGeneral.resumen.total_noches },
      { titulo: 'Ingresos Totales', valor: `Bs. ${reporteGeneral.resumen.total_ingresos}` },
      { titulo: 'Ticket Promedio', valor: `Bs. ${reporteGeneral.resumen.ingreso_promedio}` }
    ];

    kpis.forEach((kpi, index) => {
      const x = 15 + (index * (anchoKPI + 2));
      agregarCuadroInfo(kpi.titulo, kpi.valor, x, yPos, anchoKPI);
    });

    yPos += 24;

    // ===== DETALLE DE RESERVAS =====
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    yPos = agregarSeccion('DETALLE DE RESERVAS', yPos);

    const reservasData = reporteGeneral.reservas.map(r => [
      `#${r.id_reserva}`,
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
      head: [['ID', 'Hab.', 'Cliente', 'Entrada', 'Salida', 'Noches', 'Total (Bs.)', 'Estado']],
      body: reservasData,
      theme: 'plain',
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [249, 250, 251],
        textColor: [17, 24, 39],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
        lineColor: [209, 213, 219],
        lineWidth: 0.5
      },
      bodyStyles: {
        textColor: [55, 65, 81]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 42 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 22, halign: 'center', fontSize: 6, fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const estado = data.cell.raw.toLowerCase();
          if (estado === 'confirmada') {
            data.cell.styles.textColor = [21, 128, 61];
            data.cell.styles.fillColor = [220, 252, 231];
          } else if (estado === 'pendiente') {
            data.cell.styles.textColor = [161, 98, 7];
            data.cell.styles.fillColor = [254, 243, 199];
          } else if (estado === 'cancelada') {
            data.cell.styles.textColor = [153, 27, 27];
            data.cell.styles.fillColor = [254, 226, 226];
          } else {
            data.cell.styles.textColor = [30, 58, 138];
            data.cell.styles.fillColor = [219, 234, 254];
          }
        }
      }
    });

    // ===== TOTALES AL PIE =====
    yPos = doc.lastAutoTable.finalY + 8;
    
    doc.setFillColor(17, 24, 39);
    doc.rect(15, yPos, pageWidth - 30, 12, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`TOTAL DE REGISTROS: ${reporteGeneral.reservas.length}`, 20, yPos + 8);
    
    doc.text(`FACTURACIÓN TOTAL: Bs. ${reporteGeneral.resumen.total_ingresos}`, pageWidth - 20, yPos + 8, { align: 'right' });

    // ===== NUEVA PÁGINA: ANÁLISIS =====
    doc.addPage();
    yPos = 20;

    // Nota informativa
    doc.setFillColor(239, 246, 255);
    doc.rect(15, yPos, pageWidth - 30, 14, 'F');
    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos, pageWidth - 30, 14, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('ANÁLISIS COMPLEMENTARIO', 20, yPos + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(55, 65, 81);
    doc.text('Este documento contiene información confidencial de uso interno exclusivo.', 20, yPos + 11);

    yPos += 22;

    // ===== DISTRIBUCIÓN POR ESTADO =====
    yPos = agregarSeccion('DISTRIBUCIÓN POR ESTADO', yPos);

    if (estadisticasPorEstado && estadisticasPorEstado.length > 0) {
      const estadosData = estadisticasPorEstado.map(e => [
        e.estado.toUpperCase(),
        e.cantidad.toString(),
        e.total_noches?.toString() || '0',
        parseFloat(e.ingresos_totales || 0).toFixed(2),
        parseFloat(e.ingreso_promedio || 0).toFixed(2)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Cantidad', 'Noches', 'Ingresos Totales (Bs.)', 'Promedio (Bs.)']],
        body: estadosData,
        theme: 'plain',
        styles: {
          fontSize: 7,
          cellPadding: 2.5,
          lineColor: [229, 231, 235],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [249, 250, 251],
          textColor: [17, 24, 39],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center',
          lineColor: [209, 213, 219],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      });

      yPos = doc.lastAutoTable.finalY + 12;
    }

    // ===== OBSERVACIONES =====
    if (yPos < pageHeight - 50) {
      yPos = agregarSeccion('OBSERVACIONES', yPos);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      
      const observaciones = [
        '• Este informe ha sido generado automáticamente por el sistema de gestión.',
        '• Los datos corresponden únicamente al período especificado.',
        '• Para consultas adicionales, contactar al área de administración.',
        '• Documento de circulación interna restringida.'
      ];
      
      observaciones.forEach((obs, index) => {
        doc.text(obs, 15, yPos + (index * 5));
      });
    }

    // ===== FIRMAS (OPCIONAL) =====
    yPos = pageHeight - 60;
    
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    
    // Firma Izquierda
    doc.line(25, yPos, 80, yPos);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Elaborado por', 52.5, yPos + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Sistema Automático', 52.5, yPos + 9, { align: 'center' });
    
    // Firma Derecha
    doc.line(pageWidth - 80, yPos, pageWidth - 25, yPos);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Revisado por', pageWidth - 52.5, yPos + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Gerencia General', pageWidth - 52.5, yPos + 9, { align: 'center' });

    // ===== AGREGAR FOOTERS A TODAS LAS PÁGINAS =====
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      agregarFooter(i, totalPaginas);
    }

    // ===== GUARDAR PDF =====
    const fechaActual = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `Informe_Ejecutivo_${fechaActual}.pdf`;
    
    doc.save(fileName);
  };

  generarPDF();
};