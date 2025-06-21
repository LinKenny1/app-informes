import { useState, useEffect } from 'react'
import PhotoUploader from './PhotoUploader'
import AudioRecorder from './AudioRecorder'
import InformePreview from './InformePreview'
import { descargarInformePDF } from '../utils/pdfGenerator'

const API_URL = 'http://localhost:3001/api'

function ProyectoDetalle({ proyecto, onVolver }) {
  const [recursos, setRecursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormNota, setMostrarFormNota] = useState(false)
  const [mostrarPhotoUploader, setMostrarPhotoUploader] = useState(false)
  const [mostrarAudioRecorder, setMostrarAudioRecorder] = useState(false)
  const [mostrarInformePreview, setMostrarInformePreview] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')

  useEffect(() => {
    cargarRecursos()
  }, [proyecto.id])

  const cargarRecursos = async () => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}/recursos`)
      const data = await response.json()
      setRecursos(data)
    } catch (error) {
      console.error('Error cargando recursos:', error)
    } finally {
      setCargando(false)
    }
  }

  const guardarNotaTexto = async (e) => {
    e.preventDefault()
    if (!nuevaNota.trim()) return

    try {
      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'nota_texto',
          descripcion: nuevaNota
        })
      })
      
      if (response.ok) {
        await cargarRecursos()
        setNuevaNota('')
        setMostrarFormNota(false)
      }
    } catch (error) {
      console.error('Error guardando nota:', error)
    }
  }

  const subirArchivo = async (file, descripcion, tipo = null) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('descripcion', descripcion)

      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await cargarRecursos()
        return true
      } else {
        const error = await response.json()
        console.error('Error subiendo archivo:', error)
        alert('Error subiendo archivo: ' + error.error)
        return false
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      alert('Error subiendo archivo')
      return false
    }
  }

  const handleSavePhoto = async (file, descripcion) => {
    const success = await subirArchivo(file, descripcion, 'foto')
    if (success) {
      setMostrarPhotoUploader(false)
    }
  }

  const handleSaveAudio = async (audioBlob, descripcion) => {
    // Convertir blob a archivo
    const audioFile = new File([audioBlob], `nota_voz_${Date.now()}.webm`, {
      type: 'audio/webm'
    })
    
    const success = await subirArchivo(audioFile, descripcion, 'audio')
    if (success) {
      setMostrarAudioRecorder(false)
    }
  }

  const generarInforme = () => {
    setMostrarInformePreview(true)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES')
  }

  const getIconoTipo = (tipo) => {
    const iconos = {
      'foto': '📷',
      'audio': '🎤',
      'nota_texto': '📝'
    }
    return iconos[tipo] || '📄'
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      'en_progreso': { text: 'En Progreso', class: 'warning' },
      'completado': { text: 'Completado', class: 'success' },
      'facturado': { text: 'Facturado', class: 'info' }
    }
    return badges[estado] || { text: estado, class: 'default' }
  }

  const estadoBadge = getEstadoBadge(proyecto.estado)

  return (
    <div className="proyecto-detalle">
      <div className="detalle-header">
        <button className="btn btn-back" onClick={onVolver}>
          ← Volver a Proyectos
        </button>
        <div className="proyecto-title">
          <h1>{proyecto.nombre}</h1>
          <span className={`badge badge-${estadoBadge.class}`}>
            {estadoBadge.text}
          </span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={generarInforme}
          title="Generar informe PDF"
        >
          📄 Generar Informe
        </button>
      </div>

      <div className="proyecto-info-card">
        <div className="info-grid">
          <div className="info-item">
            <label>Cliente</label>
            <span>{proyecto.cliente_nombre}</span>
          </div>
          {proyecto.contacto && (
            <div className="info-item">
              <label>Contacto</label>
              <span>{proyecto.contacto}</span>
            </div>
          )}
          {proyecto.telefono && (
            <div className="info-item">
              <label>Teléfono</label>
              <span>{proyecto.telefono}</span>
            </div>
          )}
          {proyecto.ubicacion && (
            <div className="info-item">
              <label>Ubicación</label>
              <span>{proyecto.ubicacion}</span>
            </div>
          )}
          {proyecto.tipo_instalacion && (
            <div className="info-item">
              <label>Tipo de Instalación</label>
              <span>{proyecto.tipo_instalacion}</span>
            </div>
          )}
          {proyecto.fecha_inicio && (
            <div className="info-item">
              <label>Fecha de Inicio</label>
              <span>{new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES')}</span>
            </div>
          )}
          {proyecto.fecha_fin && (
            <div className="info-item">
              <label>Fecha de Fin</label>
              <span>{new Date(proyecto.fecha_fin).toLocaleDateString('es-ES')}</span>
            </div>
          )}
          {proyecto.presupuesto && (
            <div className="info-item">
              <label>Presupuesto</label>
              <span>${proyecto.presupuesto.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {proyecto.descripcion && (
          <div className="descripcion-completa">
            <label>Descripción</label>
            <p>{proyecto.descripcion}</p>
          </div>
        )}
      </div>

      <div className="recursos-section">
        <div className="section-header">
          <h2>📁 Recursos del Proyecto</h2>
          <div className="recursos-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setMostrarFormNota(true)}
            >
              📝 Agregar Nota
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setMostrarPhotoUploader(true)}
            >
              📷 Subir Foto
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setMostrarAudioRecorder(true)}
            >
              🎤 Grabar Audio
            </button>
          </div>
        </div>

        {mostrarFormNota && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>📝 Nueva Nota de Texto</h3>
              <form onSubmit={guardarNotaTexto}>
                <div className="form-group">
                  <label>Nota</label>
                  <textarea
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Escribe tu nota aquí..."
                    rows="4"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarFormNota(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Nota
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarPhotoUploader && (
          <div className="modal-overlay">
            <div className="modal">
              <PhotoUploader
                onSave={handleSavePhoto}
                onCancel={() => setMostrarPhotoUploader(false)}
              />
            </div>
          </div>
        )}

        {mostrarAudioRecorder && (
          <div className="modal-overlay">
            <div className="modal">
              <AudioRecorder
                onSave={handleSaveAudio}
                onCancel={() => setMostrarAudioRecorder(false)}
              />
            </div>
          </div>
        )}

        {mostrarInformePreview && (
          <div className="modal-overlay">
            <div className="modal modal-wide">
              <InformePreview
                proyecto={proyecto}
                recursos={recursos}
                onClose={() => setMostrarInformePreview(false)}
              />
            </div>
          </div>
        )}

        {cargando ? (
          <div className="loading">Cargando recursos...</div>
        ) : recursos.length === 0 ? (
          <div className="empty-state">
            <p>No hay recursos agregados a este proyecto</p>
            <p>Usa los botones de arriba para agregar fotos, notas de voz o notas de texto.</p>
          </div>
        ) : (
          <div className="recursos-grid">
            {recursos.map(recurso => (
              <div key={recurso.id} className="recurso-card">
                <div className="recurso-header">
                  <span className="recurso-icono">{getIconoTipo(recurso.tipo)}</span>
                  <span className="recurso-tipo">{recurso.tipo.replace('_', ' ')}</span>
                  <span className="recurso-fecha">{formatearFecha(recurso.fecha_creacion)}</span>
                </div>
                
                <div className="recurso-content">
                  {recurso.descripcion && (
                    <p className="recurso-descripcion">{recurso.descripcion}</p>
                  )}
                  
                  {recurso.archivo_path && (
                    <div className="recurso-archivo">
                      {recurso.tipo === 'foto' ? (
                        <div className="recurso-imagen">
                          <img 
                            src={`${API_URL.replace('/api', '')}/uploads/${recurso.archivo_path}`}
                            alt={recurso.descripcion || 'Imagen del proyecto'}
                            className="recurso-img"
                          />
                        </div>
                      ) : recurso.tipo === 'audio' ? (
                        <div className="recurso-audio">
                          <audio 
                            controls 
                            src={`${API_URL.replace('/api', '')}/uploads/${recurso.archivo_path}`}
                          >
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        </div>
                      ) : (
                        <span>📎 {recurso.archivo_path}</span>
                      )}
                    </div>
                  )}
                  
                  {recurso.transcripcion && (
                    <div className="recurso-transcripcion">
                      <label>Transcripción:</label>
                      <p>{recurso.transcripcion}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProyectoDetalle