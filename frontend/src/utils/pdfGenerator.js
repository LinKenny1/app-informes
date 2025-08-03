import jsPDF from 'jspdf'
import { API_URL } from './api'

export const generarInformePDF = async (proyecto, recursos) => {
  const doc = new jsPDF()
  const pageWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin

  // Configurar fuentes
  doc.setFont('helvetica', 'normal')

  // Función auxiliar para cargar imagen como base64 con redimensionado
  const loadImageAsBase64 = (url, maxWidth = 800, maxHeight = 600) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        try {
          const dataURL = canvas.toDataURL('image/jpeg', 0.8)
          resolve({ dataURL, width, height })
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = reject
      img.src = url
    })
  }

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

      for (let index = 0; index < fotos.length; index++) {
        const foto = fotos[index]
        checkNewPage(120) // Más espacio para imagen
        
        const fecha = new Date(foto.fecha_creacion).toLocaleDateString('es-ES')
        addText(`Fotografía ${index + 1} - ${fecha}`, 12, 'bold')
        
        if (foto.descripcion) {
          addText(foto.descripcion, 11, 'normal')
        }
        
        addSpace(5)
        
        try {
          // Construir URL completa de la imagen
          const imageUrl = `${API_URL.replace('/api', '')}/uploads/${foto.archivo_path}`
          const { dataURL, width, height } = await loadImageAsBase64(imageUrl)
          
          // Calcular dimensiones para el PDF (convertir de px a mm)
          const maxWidthMM = contentWidth * 0.8
          const maxHeightMM = 80
          
          // Mantener proporción de la imagen
          let finalWidth = (width * 0.264583) // px to mm conversion
          let finalHeight = (height * 0.264583)
          
          if (finalWidth > maxWidthMM) {
            finalHeight = (finalHeight * maxWidthMM) / finalWidth
            finalWidth = maxWidthMM
          }
          
          if (finalHeight > maxHeightMM) {
            finalWidth = (finalWidth * maxHeightMM) / finalHeight
            finalHeight = maxHeightMM
          }
          
          // Centrar imagen horizontalmente
          const xPosition = margin + (contentWidth - finalWidth) / 2
          
          // Verificar si hay espacio suficiente
          checkNewPage(finalHeight + 20)
          
          // Agregar imagen al PDF
          doc.addImage(dataURL, 'JPEG', xPosition, currentY, finalWidth, finalHeight)
          currentY += finalHeight + 10
          
        } catch (error) {
          console.warn(`No se pudo cargar imagen: ${foto.archivo_path}`, error)
          addText('[IMAGEN: Error al cargar la imagen]', 10, 'italic')
          addSpace(5)
        }
        
        addSpace(10)
      }
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