import { useState, useEffect, useCallback } from 'react'
import PhotoUploader from './PhotoUploader'
import AudioRecorder from './AudioRecorder'
import InformePreview from './InformePreview'
import { API_URL } from '../utils/api'
// import { descargarInformePDF } from '../utils/pdfGenerator' // Used in InformePreview component

function ProyectoDetalle({ proyecto, onVolver, onProyectoActualizado }) {
  const [recursos, setRecursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormNota, setMostrarFormNota] = useState(false)
  const [mostrarPhotoUploader, setMostrarPhotoUploader] = useState(false)
  const [mostrarAudioRecorder, setMostrarAudioRecorder] = useState(false)
  const [mostrarInformePreview, setMostrarInformePreview] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [transcribiendo, setTranscribiendo] = useState({})
  const [editandoProyecto, setEditandoProyecto] = useState(false)
  const [proyectoEditado, setProyectoEditado] = useState({
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion || '',
    ubicacion: proyecto.ubicacion || '',
    tipo_instalacion: proyecto.tipo_instalacion || '',
    fecha_inicio: proyecto.fecha_inicio || '',
    fecha_fin: proyecto.fecha_fin || '',
    fecha_limite: proyecto.fecha_limite || '',
    prioridad: proyecto.prioridad || 'medium',
    estado: proyecto.estado || 'unstarted',
    presupuesto: proyecto.presupuesto || ''
  })

  const cargarRecursos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}/recursos`)
      const data = await response.json()
      setRecursos(data)
    } catch (error) {
      console.error('Error cargando recursos:', error)
    } finally {
      setCargando(false)
    }
  }, [proyecto.id])

  useEffect(() => {
    cargarRecursos()
  }, [cargarRecursos])

  const guardarNotaTexto = async (e) => {
    e.preventDefault()
    if (!nuevaNota.trim()) return

    try {
      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'text_note',
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

  const subirArchivo = async (file, descripcion) => {
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
    const success = await subirArchivo(file, descripcion)
    if (!success) {
      throw new Error('Error uploading photo')
    }
    return success
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

  const transcribirAudio = async (recursoId) => {
    setTranscribiendo(prev => ({ ...prev, [recursoId]: true }))
    
    try {
      const response = await fetch(`${API_URL}/recursos/${recursoId}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Update the recurso with transcription
        setRecursos(prev => prev.map(recurso => 
          recurso.id === recursoId 
            ? { ...recurso, transcripcion: data.transcripcion }
            : recurso
        ))
        alert('Audio transcrito exitosamente')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error transcribiendo audio:', error)
      alert('Error al transcribir el audio')
    } finally {
      setTranscribiendo(prev => ({ ...prev, [recursoId]: false }))
    }
  }

  const generarInforme = () => {
    setMostrarInformePreview(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setProyectoEditado(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const guardarProyecto = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/proyectos/${proyecto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...proyectoEditado,
          cliente_id: proyecto.cliente_id,
          presupuesto: proyectoEditado.presupuesto ? parseFloat(proyectoEditado.presupuesto) : null
        })
      })
      
      if (response.ok) {
        const proyectoActualizado = await response.json()
        setEditandoProyecto(false)
        
        // Update the project data in parent component
        if (onProyectoActualizado) {
          onProyectoActualizado(proyectoActualizado)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Error actualizando proyecto')
      }
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      alert('Error actualizando proyecto')
    }
  }

  const cancelarEdicion = () => {
    setProyectoEditado({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      ubicacion: proyecto.ubicacion || '',
      tipo_instalacion: proyecto.tipo_instalacion || '',
      fecha_inicio: proyecto.fecha_inicio || '',
      fecha_fin: proyecto.fecha_fin || '',
      fecha_limite: proyecto.fecha_limite || '',
      prioridad: proyecto.prioridad || 'medium',
      estado: proyecto.estado || 'unstarted',
      presupuesto: proyecto.presupuesto || ''
    })
    setEditandoProyecto(false)
  }

  const eliminarRecurso = async (recurso) => {
    if (!confirm(`¿Estás seguro de eliminar este ${getTipoLabel(recurso.tipo)}?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/recursos/${recurso.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await cargarRecursos()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando recurso')
      }
    } catch (error) {
      console.error('Error eliminando recurso:', error)
      alert('Error eliminando recurso')
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES')
  }

  const getIconoTipo = (tipo) => {
    const iconos = {
      'photo': '📷',
      'audio': '🎤',
      'text_note': '📝'
    }
    return iconos[tipo] || '📄'
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      'photo': 'foto',
      'audio': 'audio',
      'text_note': 'nota de texto'
    }
    return labels[tipo] || tipo
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
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setEditandoProyecto(true)}
            title="Editar proyecto"
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button 
            className="btn btn-primary"
            onClick={generarInforme}
            title="Generar informe PDF"
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Generar Informe
          </button>
        </div>
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

        {editandoProyecto && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="card">
                <div className="card-header">
                  <h3>Editar Proyecto</h3>
                </div>
                <form onSubmit={guardarProyecto}>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nombre del Proyecto *</label>
                        <input
                          type="text"
                          name="nombre"
                          value={proyectoEditado.nombre}
                          onChange={handleEditChange}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Estado</label>
                        <select
                          name="estado"
                          value={proyectoEditado.estado}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          <option value="unstarted">Sin iniciar</option>
                          <option value="in_progress">En progreso</option>
                          <option value="completed">Completado</option>
                          <option value="delivered">Entregado</option>
                          <option value="invoiced">Facturado</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Prioridad</label>
                        <select
                          name="prioridad"
                          value={proyectoEditado.prioridad}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tipo de Instalación</label>
                        <input
                          type="text"
                          name="tipo_instalacion"
                          value={proyectoEditado.tipo_instalacion}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="ej: CCTV, Control de Acceso"
                        />
                      </div>

                      <div className="form-group form-group-full">
                        <label className="form-label">Descripción</label>
                        <textarea
                          name="descripcion"
                          value={proyectoEditado.descripcion}
                          onChange={handleEditChange}
                          className="form-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Ubicación</label>
                        <input
                          type="text"
                          name="ubicacion"
                          value={proyectoEditado.ubicacion}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Fecha de Inicio</label>
                        <input
                          type="date"
                          name="fecha_inicio"
                          value={proyectoEditado.fecha_inicio}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Fecha de Fin</label>
                        <input
                          type="date"
                          name="fecha_fin"
                          value={proyectoEditado.fecha_fin}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Fecha Límite</label>
                        <input
                          type="date"
                          name="fecha_limite"
                          value={proyectoEditado.fecha_limite}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Presupuesto</label>
                        <input
                          type="number"
                          step="0.01"
                          name="presupuesto"
                          value={proyectoEditado.presupuesto}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
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
                  <div className="recurso-info">
                    <span className="recurso-icono">{getIconoTipo(recurso.tipo)}</span>
                    <span className="recurso-tipo">{getTipoLabel(recurso.tipo)}</span>
                    <span className="recurso-fecha">{formatearFecha(recurso.fecha_creacion)}</span>
                  </div>
                  <button 
                    className="btn btn-sm btn-delete" 
                    onClick={() => eliminarRecurso(recurso)}
                    title="Eliminar recurso"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="recurso-content">
                  {recurso.descripcion && (
                    <p className="recurso-descripcion">{recurso.descripcion}</p>
                  )}
                  
                  {recurso.archivo_path && (
                    <div className="recurso-archivo">
                      {recurso.tipo === 'photo' ? (
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
                          {!recurso.transcripcion && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => transcribirAudio(recurso.id)}
                              disabled={transcribiendo[recurso.id]}
                              style={{ marginTop: '0.5rem' }}
                            >
                              {transcribiendo[recurso.id] ? (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem', animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                  </svg>
                                  Transcribiendo...
                                </>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                    <line x1="12" x2="12" y1="19" y2="22"/>
                                    <line x1="8" x2="16" y1="22" y2="22"/>
                                  </svg>
                                  Transcribir Audio
                                </>
                              )}
                            </button>
                          )}
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