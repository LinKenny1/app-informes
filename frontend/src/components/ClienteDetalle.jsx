import { useState, useEffect } from 'react'
import { API_URL } from '../utils/api'

function ClienteDetalle({ cliente, onVolver, onVerProyecto }) {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormProyecto, setMostrarFormProyecto] = useState(false)
  const [nuevoProyecto, setNuevoProyecto] = useState({
    cliente_id: cliente.id,
    nombre: '',
    descripcion: '',
    ubicacion: '',
    tipo_instalacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_limite: '',
    prioridad: 'medium',
    estado: 'unstarted',
    presupuesto: ''
  })
  const [editandoProyecto, setEditandoProyecto] = useState(null)
  const [editingStatus, setEditingStatus] = useState(null)

  useEffect(() => {
    cargarProyectos()
  }, [cliente.id])

  const getIndustryLabel = (tipo) => {
    const labels = {
      'office': 'Oficina',
      'mall': 'Mall',
      'industry': 'Industria'
    }
    return labels[tipo] || tipo
  }

  const cargarProyectos = async () => {
    try {
      const response = await fetch(`${API_URL}/proyectos`)
      const data = await response.json()
      const proyectosCliente = data.filter(p => p.cliente_id === cliente.id)
      setProyectos(proyectosCliente)
    } catch (error) {
      console.error('Error cargando proyectos:', error)
    } finally {
      setLoading(false)
    }
  }

  const guardarProyecto = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoProyecto,
          cliente_id: parseInt(nuevoProyecto.cliente_id),
          presupuesto: nuevoProyecto.presupuesto ? parseFloat(nuevoProyecto.presupuesto) : null
        })
      })
      
      if (response.ok) {
        await cargarProyectos()
        setMostrarFormProyecto(false)
        setNuevoProyecto({
          cliente_id: cliente.id,
          nombre: '',
          descripcion: '',
          ubicacion: '',
          tipo_instalacion: '',
          fecha_inicio: '',
          fecha_fin: '',
          fecha_limite: '',
          prioridad: 'medium',
          estado: 'unstarted',
          presupuesto: ''
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error guardando proyecto')
      }
    } catch (error) {
      console.error('Error guardando proyecto:', error)
      alert('Error guardando proyecto')
    }
  }

  const handleChange = (e) => {
    setNuevoProyecto({
      ...nuevoProyecto,
      [e.target.name]: e.target.value
    })
  }

  const getStatusInfo = (estado) => {
    const statusMap = {
      unstarted: { label: 'Sin iniciar', class: 'unstarted' },
      in_progress: { label: 'En progreso', class: 'in-progress' },
      completed: { label: 'Completado', class: 'completed' },
      delivered: { label: 'Entregado', class: 'delivered' },
      invoiced: { label: 'Facturado', class: 'invoiced' }
    }
    return statusMap[estado] || { label: estado, class: 'default' }
  }

  const getPriorityInfo = (prioridad) => {
    const priorityMap = {
      low: { label: 'Baja', class: 'low' },
      medium: { label: 'Media', class: 'medium' },
      high: { label: 'Alta', class: 'high' },
      urgent: { label: 'Urgente', class: 'urgent' }
    }
    return priorityMap[prioridad] || { label: prioridad, class: 'medium' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount) => {
    if (!amount) return ''
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const cambiarEstadoProyecto = async (proyectoId, nuevoEstado) => {
    try {
      const proyecto = proyectos.find(p => p.id === proyectoId)
      if (!proyecto) {
        alert('Proyecto no encontrado')
        return
      }
      
      const response = await fetch(`${API_URL}/proyectos/${proyectoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...proyecto,
          estado: nuevoEstado 
        })
      })
      
      if (response.ok) {
        await cargarProyectos()
        setEditingStatus(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Error actualizando estado')
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error actualizando estado')
    }
  }

  const editarProyecto = async (proyectoId, datosEditados) => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${proyectoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datosEditados,
          cliente_id: cliente.id,
          presupuesto: datosEditados.presupuesto ? parseFloat(datosEditados.presupuesto) : null
        })
      })
      
      if (response.ok) {
        await cargarProyectos()
        setEditandoProyecto(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Error actualizando proyecto')
      }
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      alert('Error actualizando proyecto')
    }
  }

  // Agrupar proyectos por estado
  const proyectosPorEstado = {
    unstarted: proyectos.filter(p => p.estado === 'unstarted'),
    in_progress: proyectos.filter(p => p.estado === 'in_progress'),
    completed: proyectos.filter(p => p.estado === 'completed'),
    delivered: proyectos.filter(p => p.estado === 'delivered'),
    invoiced: proyectos.filter(p => p.estado === 'invoiced')
  }

  return (
    <div className="cliente-detalle">
      {/* Header del cliente */}
      <div className="detalle-header">
        <button className="btn btn-ghost" onClick={onVolver}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Volver a Clientes
        </button>
        
        <div className="cliente-header-info">
          <h1>{cliente.nombre}</h1>
          <div className="cliente-meta">
            <span className={`badge badge-${cliente.tipo_industria}`}>
              {getIndustryLabel(cliente.tipo_industria)}
            </span>
            {cliente.total_proyectos && (
              <span className="text-secondary">
                {cliente.total_proyectos} proyecto{cliente.total_proyectos !== 1 ? 's' : ''}
              </span>
            )}
            {cliente.valor_total > 0 && (
              <span className="text-secondary">
                • {formatCurrency(cliente.valor_total)}
              </span>
            )}
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setMostrarFormProyecto(true)}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Información del cliente - Collapsible on mobile */}
      <div className="cliente-info-section">
        <div className="card">
          <div className="card-header">
            <h3>Información de Contacto</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              {cliente.contacto && (
                <div className="info-item">
                  <label>Contacto</label>
                  <span>{cliente.contacto}</span>
                </div>
              )}
              {cliente.telefono && (
                <div className="info-item">
                  <label>Teléfono</label>
                  <span>{cliente.telefono}</span>
                </div>
              )}
              {cliente.email && (
                <div className="info-item">
                  <label>Email</label>
                  <span>{cliente.email}</span>
                </div>
              )}
              {cliente.direccion && (
                <div className="info-item">
                  <label>Dirección</label>
                  <span>{cliente.direccion}</span>
                </div>
              )}
              {cliente.notas_generales && (
                <div className="info-item info-item-full cliente-info-desktop">
                  <label>Notas</label>
                  <span>{cliente.notas_generales}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proyectos - Simplified for mobile */}
      <div className="proyectos-section">
        <h2>Proyectos ({proyectos.length})</h2>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Cargando proyectos...</span>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="empty-state">
            <p>Este cliente no tiene proyectos aún</p>
            <button 
              className="btn btn-primary"
              onClick={() => setMostrarFormProyecto(true)}
            >
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: Grouped by status view */}
            <div className="proyectos-mobile-list">
              {Object.entries(proyectosPorEstado).map(([estado, proyectosEstado]) => {
                const statusInfo = getStatusInfo(estado)
                if (proyectosEstado.length === 0) return null
                
                return (
                  <div key={estado} className="mobile-status-group">
                    <div className="mobile-status-header">
                      <div className={`status-dot status-dot-${estado}`}></div>
                      <h3>{statusInfo.label}</h3>
                      <span className="count">{proyectosEstado.length}</span>
                    </div>
                    
                    <div className="mobile-status-projects">
                      {proyectosEstado.map(proyecto => {
                        const priorityInfo = getPriorityInfo(proyecto.prioridad)
                        return (
                          <div key={proyecto.id} className="proyecto-card-mobile">
                            <div className="proyecto-mobile-header">
                              <h4 onClick={() => onVerProyecto(proyecto)}>{proyecto.nombre}</h4>
                              <div className="proyecto-actions">
                                <button 
                                  className="btn-icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingStatus(editingStatus === proyecto.id ? null : proyecto.id)
                                  }}
                                  title="Cambiar estado"
                                >
                                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button 
                                  className="btn-icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditandoProyecto(proyecto)
                                  }}
                                  title="Editar proyecto"
                                >
                                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <div className="proyecto-mobile-content">
                              <div className="proyecto-badges">
                                <div className={`badge badge-${priorityInfo.class}`}>
                                  {priorityInfo.label}
                                </div>
                              </div>
                              
                              {proyecto.descripcion && (
                                <p className="proyecto-mobile-descripcion">{proyecto.descripcion}</p>
                              )}
                              
                              {proyecto.fecha_limite && (
                                <div className="proyecto-mobile-meta">
                                  <span className="text-sm text-muted">
                                    Fecha límite: {formatDate(proyecto.fecha_limite)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {editingStatus === proyecto.id && (
                              <div className="status-quick-edit">
                                <h5>Cambiar estado:</h5>
                                <div className="status-options">
                                  {['unstarted', 'in_progress', 'completed', 'delivered', 'invoiced'].map(estado => {
                                    const statusInfo = getStatusInfo(estado)
                                    return (
                                      <button
                                        key={estado}
                                        className={`btn btn-sm ${proyecto.estado === estado ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => cambiarEstadoProyecto(proyecto.id, estado)}
                                      >
                                        {statusInfo.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: Kanban view */}
            <div className="proyectos-kanban">
              {Object.entries(proyectosPorEstado).map(([estado, proyectosEstado]) => {
                const statusInfo = getStatusInfo(estado)
                return (
                  <div key={estado} className="kanban-column">
                    <div className="kanban-header">
                      <div className={`status-dot status-dot-${estado}`}></div>
                      <h3>{statusInfo.label}</h3>
                      <span className="count">{proyectosEstado.length}</span>
                    </div>
                    
                    <div className="kanban-items">
                      {proyectosEstado.map(proyecto => {
                        const priorityInfo = getPriorityInfo(proyecto.prioridad)
                        return (
                          <div key={proyecto.id} className="proyecto-card">
                            <div className="proyecto-card-header">
                              <h4 onClick={() => onVerProyecto(proyecto)}>{proyecto.nombre}</h4>
                              <div className="proyecto-card-actions">
                                <div className={`badge badge-${priorityInfo.class}`}>
                                  {priorityInfo.label}
                                </div>
                                <button 
                                  className="btn-icon btn-icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingStatus(editingStatus === proyecto.id ? null : proyecto.id)
                                  }}
                                  title="Cambiar estado"
                                >
                                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button 
                                  className="btn-icon btn-icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditandoProyecto(proyecto)
                                  }}
                                  title="Editar proyecto"
                                >
                                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {proyecto.descripcion && (
                              <p className="proyecto-descripcion" onClick={() => onVerProyecto(proyecto)}>{proyecto.descripcion}</p>
                            )}
                            
                            <div className="proyecto-meta" onClick={() => onVerProyecto(proyecto)}>
                              {proyecto.fecha_limite && (
                                <span className="text-sm text-muted">
                                  Límite: {formatDate(proyecto.fecha_limite)}
                                </span>
                              )}
                              {proyecto.presupuesto && (
                                <span className="text-sm text-primary">
                                  {formatCurrency(proyecto.presupuesto)}
                                </span>
                              )}
                            </div>
                            
                            {editingStatus === proyecto.id && (
                              <div className="status-quick-edit">
                                <h5>Cambiar estado:</h5>
                                <div className="status-options">
                                  {['unstarted', 'in_progress', 'completed', 'delivered', 'invoiced'].map(estado => {
                                    const statusInfo = getStatusInfo(estado)
                                    return (
                                      <button
                                        key={estado}
                                        className={`btn btn-sm ${proyecto.estado === estado ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => cambiarEstadoProyecto(proyecto.id, estado)}
                                      >
                                        {statusInfo.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal para editar proyecto */}
      {editandoProyecto && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>Editar Proyecto: {editandoProyecto.nombre}</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const datos = {
                  nombre: formData.get('nombre'),
                  descripcion: formData.get('descripcion'),
                  ubicacion: formData.get('ubicacion'),
                  tipo_instalacion: formData.get('tipo_instalacion'),
                  fecha_inicio: formData.get('fecha_inicio'),
                  fecha_fin: formData.get('fecha_fin'),
                  fecha_limite: formData.get('fecha_limite'),
                  prioridad: formData.get('prioridad'),
                  estado: formData.get('estado'),
                  presupuesto: formData.get('presupuesto')
                }
                editarProyecto(editandoProyecto.id, datos)
              }}>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre del Proyecto *</label>
                      <input
                        type="text"
                        name="nombre"
                        defaultValue={editandoProyecto.nombre}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <select
                        name="estado"
                        defaultValue={editandoProyecto.estado}
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
                        defaultValue={editandoProyecto.prioridad}
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
                        defaultValue={editandoProyecto.tipo_instalacion || ''}
                        className="form-input"
                        placeholder="ej: CCTV, Control de Acceso"
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Descripción</label>
                      <textarea
                        name="descripcion"
                        defaultValue={editandoProyecto.descripcion || ''}
                        className="form-textarea"
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ubicación</label>
                      <input
                        type="text"
                        name="ubicacion"
                        defaultValue={editandoProyecto.ubicacion || ''}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha de Inicio</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        defaultValue={editandoProyecto.fecha_inicio || ''}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha de Fin</label>
                      <input
                        type="date"
                        name="fecha_fin"
                        defaultValue={editandoProyecto.fecha_fin || ''}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha Límite</label>
                      <input
                        type="date"
                        name="fecha_limite"
                        defaultValue={editandoProyecto.fecha_limite || ''}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Presupuesto</label>
                      <input
                        type="number"
                        step="0.01"
                        name="presupuesto"
                        defaultValue={editandoProyecto.presupuesto || ''}
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
                      onClick={() => setEditandoProyecto(null)}
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

      {/* Modal para nuevo proyecto */}
      {mostrarFormProyecto && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>Nuevo Proyecto para {cliente.nombre}</h3>
              </div>
              <form onSubmit={guardarProyecto}>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre del Proyecto *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={nuevoProyecto.nombre}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tipo de Instalación</label>
                      <input
                        type="text"
                        name="tipo_instalacion"
                        value={nuevoProyecto.tipo_instalacion}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="ej: CCTV, Control de Acceso"
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={nuevoProyecto.descripcion}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ubicación</label>
                      <input
                        type="text"
                        name="ubicacion"
                        value={nuevoProyecto.ubicacion}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Prioridad</label>
                      <select
                        name="prioridad"
                        value={nuevoProyecto.prioridad}
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
                      <label className="form-label">Fecha de Inicio</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={nuevoProyecto.fecha_inicio}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha Límite</label>
                      <input
                        type="date"
                        name="fecha_limite"
                        value={nuevoProyecto.fecha_limite}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Presupuesto</label>
                      <input
                        type="number"
                        step="0.01"
                        name="presupuesto"
                        value={nuevoProyecto.presupuesto}
                        onChange={handleChange}
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
                      onClick={() => setMostrarFormProyecto(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Crear Proyecto
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

export default ClienteDetalle