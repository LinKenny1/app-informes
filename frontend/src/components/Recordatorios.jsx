import { useState, useEffect } from 'react'
import { API_URL } from '../utils/api'

function Recordatorios() {
  const [recordatorios, setRecordatorios] = useState([])
  const [clientes, setClientes] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoRecordatorio, setEditandoRecordatorio] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('pending')
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState({
    titulo: '',
    descripcion: '',
    fecha_recordatorio: '',
    tipo: 'general',
    prioridad: 'medium',
    proyecto_id: '',
    cliente_id: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [filtroEstado])

  const cargarDatos = async () => {
    try {
      const [recordatoriosRes, clientesRes, proyectosRes] = await Promise.all([
        fetch(`${API_URL}/recordatorios?estado=${filtroEstado}`),
        fetch(`${API_URL}/clientes`),
        fetch(`${API_URL}/proyectos`)
      ])
      
      const recordatoriosData = await recordatoriosRes.json()
      const clientesData = await clientesRes.json()
      const proyectosData = await proyectosRes.json()
      
      setRecordatorios(recordatoriosData)
      setClientes(clientesData)
      setProyectos(proyectosData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const guardarRecordatorio = async (e) => {
    e.preventDefault()
    try {
      const url = editandoRecordatorio 
        ? `${API_URL}/recordatorios/${editandoRecordatorio.id}`
        : `${API_URL}/recordatorios`
      
      const method = editandoRecordatorio ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoRecordatorio,
          proyecto_id: nuevoRecordatorio.proyecto_id || null,
          cliente_id: nuevoRecordatorio.cliente_id || null
        })
      })
      
      if (response.ok) {
        await cargarDatos()
        cerrarForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Error guardando recordatorio')
      }
    } catch (error) {
      console.error('Error guardando recordatorio:', error)
      alert('Error guardando recordatorio')
    }
  }

  const editarRecordatorio = (recordatorio) => {
    setEditandoRecordatorio(recordatorio)
    setNuevoRecordatorio({
      titulo: recordatorio.titulo,
      descripcion: recordatorio.descripcion || '',
      fecha_recordatorio: recordatorio.fecha_recordatorio.slice(0, 16), // Para datetime-local
      tipo: recordatorio.tipo,
      prioridad: recordatorio.prioridad,
      proyecto_id: recordatorio.proyecto_id || '',
      cliente_id: recordatorio.cliente_id || ''
    })
    setMostrarForm(true)
  }

  const eliminarRecordatorio = async (recordatorio) => {
    if (!confirm(`¿Estás seguro de eliminar el recordatorio "${recordatorio.titulo}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/recordatorios/${recordatorio.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await cargarDatos()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando recordatorio')
      }
    } catch (error) {
      console.error('Error eliminando recordatorio:', error)
      alert('Error eliminando recordatorio')
    }
  }

  const marcarCompletado = async (recordatorio) => {
    try {
      const response = await fetch(`${API_URL}/recordatorios/${recordatorio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recordatorio,
          estado: 'completed'
        })
      })

      if (response.ok) {
        await cargarDatos()
      }
    } catch (error) {
      console.error('Error actualizando recordatorio:', error)
    }
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setEditandoRecordatorio(null)
    setNuevoRecordatorio({
      titulo: '',
      descripcion: '',
      fecha_recordatorio: '',
      tipo: 'general',
      prioridad: 'medium',
      proyecto_id: '',
      cliente_id: ''
    })
  }

  const handleChange = (e) => {
    setNuevoRecordatorio({
      ...nuevoRecordatorio,
      [e.target.name]: e.target.value
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let timeInfo = ''
    if (diffDays < 0) {
      timeInfo = `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`
    } else if (diffDays === 0) {
      timeInfo = 'Hoy'
    } else if (diffDays === 1) {
      timeInfo = 'Mañana'
    } else if (diffDays <= 7) {
      timeInfo = `En ${diffDays} días`
    }
    
    return {
      formatted: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      relative: timeInfo,
      isOverdue: diffDays < 0,
      isToday: diffDays === 0,
      isSoon: diffDays <= 3 && diffDays >= 0
    }
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      deadline: 'Fecha límite',
      followup: 'Seguimiento',
      meeting: 'Reunión',
      general: 'General'
    }
    return tipos[tipo] || tipo
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Cargando recordatorios...</span>
      </div>
    )
  }

  return (
    <div className="recordatorios-container">
      <div className="section-header">
        <div>
          <h2>Recordatorios</h2>
          <p className="text-secondary">Gestiona tus recordatorios y fechas importantes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setMostrarForm(true)}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Recordatorio
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros">
          <button 
            className={filtroEstado === 'pending' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setFiltroEstado('pending')}
          >
            Pendientes
          </button>
          <button 
            className={filtroEstado === 'completed' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setFiltroEstado('completed')}
          >
            Completados
          </button>
          <button 
            className={filtroEstado === '' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setFiltroEstado('')}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista de recordatorios */}
      <div className="recordatorios-content">
        {recordatorios.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <h3>No hay recordatorios</h3>
            <p>Crea tu primer recordatorio para no olvidar fechas importantes</p>
            <button 
              className="btn btn-primary"
              onClick={() => setMostrarForm(true)}
            >
              Crear Recordatorio
            </button>
          </div>
        ) : (
          <div className="recordatorios-grid">
            {recordatorios.map(recordatorio => {
              const dateInfo = formatDate(recordatorio.fecha_recordatorio)
              return (
                <div 
                  key={recordatorio.id} 
                  className={`recordatorio-card ${dateInfo.isOverdue ? 'overdue' : ''} ${dateInfo.isToday ? 'today' : ''} ${dateInfo.isSoon ? 'soon' : ''}`}
                >
                  <div className="recordatorio-header">
                    <div className="recordatorio-meta">
                      <span className={`badge badge-${recordatorio.tipo}`}>
                        {getTipoLabel(recordatorio.tipo)}
                      </span>
                      <span className={`badge badge-${recordatorio.prioridad}`}>
                        {recordatorio.prioridad}
                      </span>
                    </div>
                    <div className="recordatorio-actions">
                      {filtroEstado === 'pending' && (
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => marcarCompletado(recordatorio)}
                          title="Marcar como completado"
                        >
                          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </button>
                      )}
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => editarRecordatorio(recordatorio)}
                        title="Editar"
                      >
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => eliminarRecordatorio(recordatorio)}
                        title="Eliminar"
                      >
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="recordatorio-content">
                    <h3>{recordatorio.titulo}</h3>
                    {recordatorio.descripcion && (
                      <p className="recordatorio-descripcion">{recordatorio.descripcion}</p>
                    )}
                    
                    <div className="recordatorio-fecha">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span>{dateInfo.formatted}</span>
                      {dateInfo.relative && (
                        <span className={`fecha-relative ${dateInfo.isOverdue ? 'overdue' : ''}`}>
                          • {dateInfo.relative}
                        </span>
                      )}
                    </div>

                    {(recordatorio.proyecto_nombre || recordatorio.cliente_nombre) && (
                      <div className="recordatorio-context">
                        {recordatorio.proyecto_nombre && (
                          <span className="context-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            {recordatorio.proyecto_nombre}
                          </span>
                        )}
                        {recordatorio.cliente_nombre && (
                          <span className="context-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {recordatorio.cliente_nombre}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal para crear/editar recordatorio */}
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>{editandoRecordatorio ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</h3>
              </div>
              
              <form onSubmit={guardarRecordatorio}>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group form-group-full">
                      <label className="form-label">Título *</label>
                      <input
                        type="text"
                        name="titulo"
                        value={nuevoRecordatorio.titulo}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={nuevoRecordatorio.descripcion}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha y Hora *</label>
                      <input
                        type="datetime-local"
                        name="fecha_recordatorio"
                        value={nuevoRecordatorio.fecha_recordatorio}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tipo</label>
                      <select
                        name="tipo"
                        value={nuevoRecordatorio.tipo}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="general">General</option>
                        <option value="deadline">Fecha límite</option>
                        <option value="followup">Seguimiento</option>
                        <option value="meeting">Reunión</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Prioridad</label>
                      <select
                        name="prioridad"
                        value={nuevoRecordatorio.prioridad}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cliente (opcional)</label>
                      <select
                        name="cliente_id"
                        value={nuevoRecordatorio.cliente_id}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Proyecto (opcional)</label>
                      <select
                        name="proyecto_id"
                        value={nuevoRecordatorio.proyecto_id}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Seleccionar proyecto</option>
                        {proyectos.map(proyecto => (
                          <option key={proyecto.id} value={proyecto.id}>
                            {proyecto.nombre} - {proyecto.cliente_nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={cerrarForm}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editandoRecordatorio ? 'Actualizar' : 'Crear'} Recordatorio
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recordatorios