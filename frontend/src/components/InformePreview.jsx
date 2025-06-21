import { useState } from 'react'
import { generarInformePDF } from '../utils/pdfGenerator'

function InformePreview({ proyecto, recursos, onClose }) {
  const [generando, setGenerando] = useState(false)

  const handleGenerar = async () => {
    setGenerando(true)
    try {
      const doc = await generarInformePDF(proyecto, recursos)
      const fileName = `Informe_${proyecto.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      onClose()
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error generando el informe PDF')
    } finally {
      setGenerando(false)
    }
  }

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'No especificada'
  }

  const contarRecursos = () => {
    const fotos = recursos.filter(r => r.tipo === 'foto').length
    const audios = recursos.filter(r => r.tipo === 'audio').length
    const notas = recursos.filter(r => r.tipo === 'nota_texto').length
    return { fotos, audios, notas }
  }

  const { fotos, audios, notas } = contarRecursos()

  return (
    <div className="informe-preview">
      <div className="preview-header">
        <h3>📄 Vista Previa del Informe</h3>
        <p>Revisa la información que se incluirá en el informe PDF</p>
      </div>

      <div className="preview-content">
        <div className="preview-section">
          <h4>Información del Proyecto</h4>
          <div className="preview-info">
            <p><strong>Proyecto:</strong> {proyecto.nombre}</p>
            <p><strong>Cliente:</strong> {proyecto.cliente_nombre}</p>
            {proyecto.contacto && <p><strong>Contacto:</strong> {proyecto.contacto}</p>}
            {proyecto.telefono && <p><strong>Teléfono:</strong> {proyecto.telefono}</p>}
            {proyecto.ubicacion && <p><strong>Ubicación:</strong> {proyecto.ubicacion}</p>}
            {proyecto.tipo_instalacion && <p><strong>Tipo:</strong> {proyecto.tipo_instalacion}</p>}
            <p><strong>Fecha Inicio:</strong> {formatearFecha(proyecto.fecha_inicio)}</p>
            {proyecto.fecha_fin && <p><strong>Fecha Fin:</strong> {formatearFecha(proyecto.fecha_fin)}</p>}
            <p><strong>Estado:</strong> {
              {
                'en_progreso': 'En Progreso',
                'completado': 'Completado', 
                'facturado': 'Facturado'
              }[proyecto.estado] || proyecto.estado
            }</p>
            {proyecto.presupuesto && <p><strong>Presupuesto:</strong> ${proyecto.presupuesto.toLocaleString()}</p>}
          </div>
          
          {proyecto.descripcion && (
            <div className="preview-descripcion">
              <strong>Descripción:</strong>
              <p>{proyecto.descripcion}</p>
            </div>
          )}
        </div>

        <div className="preview-section">
          <h4>Recursos Incluidos</h4>
          <div className="recursos-resumen">
            <div className="recurso-count">
              <span className="count-number">{notas}</span>
              <span className="count-label">Notas de Texto</span>
            </div>
            <div className="recurso-count">
              <span className="count-number">{fotos}</span>
              <span className="count-label">Fotografías</span>
            </div>
            <div className="recurso-count">
              <span className="count-number">{audios}</span>
              <span className="count-label">Grabaciones</span>
            </div>
          </div>

          {recursos.length === 0 && (
            <div className="no-recursos">
              <p>⚠️ Este proyecto no tiene recursos agregados. El informe solo incluirá la información básica del proyecto.</p>
            </div>
          )}
        </div>

        <div className="preview-section">
          <h4>Contenido del Informe</h4>
          <ul className="contenido-lista">
            <li>✅ Encabezado con información de la empresa</li>
            <li>✅ Datos completos del proyecto y cliente</li>
            {notas > 0 && <li>✅ {notas} nota(s) de trabajo con fechas</li>}
            {fotos > 0 && <li>✅ Registro fotográfico ({fotos} imagen(es))</li>}
            {audios > 0 && <li>✅ {audios} grabación(es) de audio{audios > 0 && recursos.some(r => r.transcripcion) ? ' con transcripciones' : ''}</li>}
            <li>✅ Pie de página con fecha de generación</li>
          </ul>
        </div>
      </div>

      <div className="preview-actions">
        <button className="btn btn-secondary" onClick={onClose} disabled={generando}>
          Cancelar
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleGenerar}
          disabled={generando}
        >
          {generando ? 'Generando...' : '📄 Descargar PDF'}
        </button>
      </div>
    </div>
  )
}

export default InformePreview