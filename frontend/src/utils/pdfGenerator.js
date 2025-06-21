import jsPDF from 'jspdf'

export const generarInformePDF = async (proyecto, recursos) => {
  const doc = new jsPDF()
  const pageWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin

  // Configurar fuentes
  doc.setFont('helvetica', 'normal')

  // Función auxiliar para agregar texto con salto de línea automático
  const addText = (text, fontSize = 12, style = 'normal', maxWidth = contentWidth) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)
    
    const lines = doc.splitTextToSize(text, maxWidth)
    const lineHeight = fontSize * 0.4
    
    // Verificar si necesitamos nueva página
    if (currentY + (lines.length * lineHeight) > pageHeight - margin) {
      doc.addPage()
      currentY = margin
    }
    
    doc.text(lines, margin, currentY)
    currentY += lines.length * lineHeight + 5
  }

  // Función auxiliar para agregar espacio
  const addSpace = (space = 10) => {
    currentY += space
  }

  // Función auxiliar para nueva página si es necesario
  const checkNewPage = (requiredSpace = 50) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      doc.addPage()
      currentY = margin
    }
  }

  // ENCABEZADO
  addText('INFORME TÉCNICO', 20, 'bold')
  addText('Sistema de Seguridad y Vigilancia Electrónica', 14, 'normal')
  addSpace(15)

  // INFORMACIÓN DEL PROYECTO
  addText('INFORMACIÓN DEL PROYECTO', 16, 'bold')
  addSpace(5)
  
  addText(`Proyecto: ${proyecto.nombre}`, 12, 'bold')
  addText(`Cliente: ${proyecto.cliente_nombre}`, 12, 'normal')
  
  if (proyecto.contacto) {
    addText(`Contacto: ${proyecto.contacto}`, 12, 'normal')
  }
  
  if (proyecto.telefono) {
    addText(`Teléfono: ${proyecto.telefono}`, 12, 'normal')
  }
  
  if (proyecto.ubicacion) {
    addText(`Ubicación: ${proyecto.ubicacion}`, 12, 'normal')
  }
  
  if (proyecto.tipo_instalacion) {
    addText(`Tipo de Instalación: ${proyecto.tipo_instalacion}`, 12, 'normal')
  }
  
  if (proyecto.fecha_inicio) {
    const fechaInicio = new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES')
    addText(`Fecha de Inicio: ${fechaInicio}`, 12, 'normal')
  }
  
  if (proyecto.fecha_fin) {
    const fechaFin = new Date(proyecto.fecha_fin).toLocaleDateString('es-ES')
    addText(`Fecha de Finalización: ${fechaFin}`, 12, 'normal')
  }

  const estado = {
    'en_progreso': 'En Progreso',
    'completado': 'Completado',
    'facturado': 'Facturado'
  }[proyecto.estado] || proyecto.estado

  addText(`Estado: ${estado}`, 12, 'normal')
  
  if (proyecto.presupuesto) {
    addText(`Presupuesto: $${proyecto.presupuesto.toLocaleString()}`, 12, 'normal')
  }

  if (proyecto.descripcion) {
    addSpace(10)
    addText('Descripción:', 12, 'bold')
    addText(proyecto.descripcion, 11, 'normal')
  }

  addSpace(20)

  // RECURSOS DEL PROYECTO
  if (recursos && recursos.length > 0) {
    addText('RECURSOS Y DOCUMENTACIÓN', 16, 'bold')
    addSpace(10)

    // Separar recursos por tipo
    const fotos = recursos.filter(r => r.tipo === 'foto')
    const audios = recursos.filter(r => r.tipo === 'audio')
    const notas = recursos.filter(r => r.tipo === 'nota_texto')

    // NOTAS DE TEXTO
    if (notas.length > 0) {
      addText('Notas de Trabajo:', 14, 'bold')
      addSpace(5)

      notas.forEach((nota, index) => {
        const fecha = new Date(nota.fecha_creacion).toLocaleDateString('es-ES')
        addText(`${index + 1}. ${fecha}`, 11, 'bold')
        addText(nota.descripcion, 11, 'normal')
        addSpace(8)
      })
      
      addSpace(10)
    }

    // FOTOGRAFÍAS
    if (fotos.length > 0) {
      checkNewPage(100)
      addText('Registro Fotográfico:', 14, 'bold')
      addSpace(10)

      fotos.forEach((foto, index) => {
        checkNewPage(80)
        
        const fecha = new Date(foto.fecha_creacion).toLocaleDateString('es-ES')
        addText(`Fotografía ${index + 1} - ${fecha}`, 12, 'bold')
        
        if (foto.descripcion) {
          addText(foto.descripcion, 11, 'normal')
        }
        
        // Espacio para la imagen (placeholder)
        addText('[IMAGEN: Se incluirá en versión final del informe]', 10, 'italic')
        addSpace(15)
      })
    }

    // GRABACIONES DE AUDIO
    if (audios.length > 0) {
      checkNewPage(60)
      addText('Notas de Voz:', 14, 'bold')
      addSpace(5)

      audios.forEach((audio, index) => {
        const fecha = new Date(audio.fecha_creacion).toLocaleDateString('es-ES')
        addText(`Grabación ${index + 1} - ${fecha}`, 12, 'bold')
        
        if (audio.descripcion) {
          addText(audio.descripcion, 11, 'normal')
        }
        
        if (audio.transcripcion) {
          addText('Transcripción:', 11, 'bold')
          addText(audio.transcripcion, 10, 'normal')
        } else {
          addText('Nota: Grabación de audio disponible en archivos digitales', 10, 'italic')
        }
        
        addSpace(10)
      })
    }
  }

  // PIE DE PÁGINA
  const totalPages = doc.internal.getNumberOfPages()
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    
    // Fecha de generación
    const fechaGeneracion = new Date().toLocaleDateString('es-ES')
    doc.text(`Generado el: ${fechaGeneracion}`, margin, pageHeight - 10)
    
    // Número de página
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 10)
  }

  return doc
}

export const descargarInformePDF = async (proyecto, recursos) => {
  try {
    const doc = await generarInformePDF(proyecto, recursos)
    const fileName = `Informe_${proyecto.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    return true
  } catch (error) {
    console.error('Error generando PDF:', error)
    return false
  }
}