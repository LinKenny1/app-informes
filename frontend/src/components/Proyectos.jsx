import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

function Proyectos({ onVerProyecto }) {
  const [proyectos, setProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [nuevoProyecto, setNuevoProyecto] = useState({
    cliente_id: '',
    nombre: '',
    descripcion: '',
    ubicacion: '',
    tipo_instalacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [proyectosRes, clientesRes] = await Promise.all([
        fetch(`${API_URL}/proyectos`),
        fetch(`${API_URL}/clientes`)
      ])
      
      const proyectosData = await proyectosRes.json()
      const clientesData = await clientesRes.json()
      
      setProyectos(proyectosData)
      setClientes(clientesData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setCargando(false)
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
        await cargarDatos()
        setMostrarFormulario(false)
        setNuevoProyecto({
          cliente_id: '',
          nombre: '',
          descripcion: '',
          ubicacion: '',
          tipo_instalacion: '',
          fecha_inicio: '',
          fecha_fin: '',
          presupuesto: ''
        })
      }
    } catch (error) {
      console.error('Error guardando proyecto:', error)
    }
  }

  const handleChange = (e) => {
    setNuevoProyecto({
      ...nuevoProyecto,
      [e.target.name]: e.target.value
    })
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      'en_progreso': { text: 'En Progreso', class: 'warning' },
      'completado': { text: 'Completado', class: 'success' },
      'facturado': { text: 'Facturado', class: 'info' }
    }
    return badges[estado] || { text: estado, class: 'default' }
  }

  if (cargando) {
    return <div className="loading">Cargando proyectos...</div>
  }

  return (
    <div className="proyectos-container">
      <div className="section-header">
        <h2>📁 Proyectos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(true)}
          disabled={clientes.length === 0}
        >
          ➕ Nuevo Proyecto
        </button>
      </div>

      {clientes.length === 0 && (
        <div className="alert alert-warning">
          <p>⚠️ Necesitas crear al menos un cliente antes de poder crear proyectos.</p>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nuevo Proyecto</h3>
            <form onSubmit={guardarProyecto}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    name="cliente_id"
                    value={nuevoProyecto.cliente_id}
                    onChange={handleChange}
                    required
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
                  <label>Nombre del Proyecto *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoProyecto.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={nuevoProyecto.descripcion}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={nuevoProyecto.ubicacion}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Instalación</label>
                  <input
                    type="text"
                    name="tipo_instalacion"
                    value={nuevoProyecto.tipo_instalacion}
                    onChange={handleChange}
                    placeholder="ej: CCTV, Control de Acceso"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={nuevoProyecto.fecha_inicio}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={nuevoProyecto.fecha_fin}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Presupuesto</label>
                  <input
                    type="number"
                    step="0.01"
                    name="presupuesto"
                    value={nuevoProyecto.presupuesto}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="proyectos-grid">
        {proyectos.length === 0 ? (
          <div className="empty-state">
            <p>No hay proyectos registrados</p>
            {clientes.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => setMostrarFormulario(true)}
              >
                Crear primer proyecto
              </button>
            )}
          </div>
        ) : (
          proyectos.map(proyecto => {
            const estadoBadge = getEstadoBadge(proyecto.estado)
            return (
              <div key={proyecto.id} className="proyecto-card">
                <div className="proyecto-header">
                  <h3>{proyecto.nombre}</h3>
                  <span className={`badge badge-${estadoBadge.class}`}>
                    {estadoBadge.text}
                  </span>
                </div>
                
                <div className="proyecto-info">
                  <p><strong>Cliente:</strong> {proyecto.cliente_nombre}</p>
                  {proyecto.ubicacion && <p><strong>Ubicación:</strong> {proyecto.ubicacion}</p>}
                  {proyecto.tipo_instalacion && <p><strong>Tipo:</strong> {proyecto.tipo_instalacion}</p>}
                  {proyecto.fecha_inicio && (
                    <p><strong>Inicio:</strong> {formatearFecha(proyecto.fecha_inicio)}</p>
                  )}
                  {proyecto.presupuesto && (
                    <p><strong>Presupuesto:</strong> ${proyecto.presupuesto.toLocaleString()}</p>
                  )}
                  {proyecto.descripcion && (
                    <p className="descripcion">{proyecto.descripcion}</p>
                  )}
                </div>

                <div className="proyecto-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => onVerProyecto('proyecto-detalle', proyecto)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Proyectos