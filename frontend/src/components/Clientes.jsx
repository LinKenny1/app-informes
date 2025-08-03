import { useState, useEffect } from 'react'
import { API_URL } from '../utils/api'

function Clientes({ onVerCliente }) {
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [editandoCliente, setEditandoCliente] = useState(null)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_industria: 'office',
    notas_generales: ''
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const getIndustryLabel = (tipo) => {
    const labels = {
      'office': 'Oficina',
      'mall': 'Mall',
      'industry': 'Industria'
    }
    return labels[tipo] || tipo
  }

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes/stats`)
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setCargando(false)
    }
  }

  const guardarCliente = async (e) => {
    e.preventDefault()
    try {
      const url = editandoCliente 
        ? `${API_URL}/clientes/${editandoCliente.id}`
        : `${API_URL}/clientes`
      
      const method = editandoCliente ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      })
      
      if (response.ok) {
        await cargarClientes()
        cerrarFormulario()
      } else {
        const error = await response.json()
        alert(error.error || 'Error guardando cliente')
      }
    } catch (error) {
      console.error('Error guardando cliente:', error)
      alert('Error guardando cliente')
    }
  }

  const editarCliente = (cliente) => {
    setEditandoCliente(cliente)
    setNuevoCliente({
      nombre: cliente.nombre,
      contacto: cliente.contacto || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      tipo_industria: cliente.tipo_industria || 'office',
      notas_generales: cliente.notas_generales || ''
    })
    setMostrarFormulario(true)
  }

  const eliminarCliente = async (cliente) => {
    if (!confirm(`¿Estás seguro de eliminar el cliente "${cliente.nombre}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/clientes/${cliente.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await cargarClientes()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando cliente')
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      alert('Error eliminando cliente')
    }
  }

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setEditandoCliente(null)
    setNuevoCliente({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo_industria: 'office',
      notas_generales: ''
    })
  }

  const handleChange = (e) => {
    setNuevoCliente({
      ...nuevoCliente,
      [e.target.name]: e.target.value
    })
  }

  if (cargando) {
    return <div className="loading">Cargando clientes...</div>
  }

  const formatCurrency = (amount) => {
    if (!amount) return ''
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }

  if (cargando) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Cargando clientes...</span>
      </div>
    )
  }

  return (
    <div className="clientes-container">
      <div className="section-header">
        <div>
          <h2>Clientes</h2>
          <p className="text-secondary">Gestiona tu cartera de clientes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editandoCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={guardarCliente}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoCliente.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={nuevoCliente.contacto}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={nuevoCliente.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={nuevoCliente.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={nuevoCliente.direccion}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Industria</label>
                  <select
                    name="tipo_industria"
                    value={nuevoCliente.tipo_industria}
                    onChange={handleChange}
                  >
                    <option value="office">Oficina</option>
                    <option value="mall">Mall</option>
                    <option value="industry">Industria</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notas Generales</label>
                  <textarea
                    name="notas_generales"
                    value={nuevoCliente.notas_generales}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={cerrarFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editandoCliente ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clientes-grid">
        {clientes.length === 0 ? (
          <div className="empty-state">
            <p>No hay clientes registrados</p>
            <button 
              className="btn btn-primary"
              onClick={() => setMostrarFormulario(true)}
            >
              Crear primer cliente
            </button>
          </div>
        ) : (
          clientes.map(cliente => (
            <div key={cliente.id} className="card cliente-card" onClick={() => onVerCliente(cliente)}>
              <div className="card-header">
                <div className="cliente-info-header">
                  <h3>{cliente.nombre}</h3>
                  <div className="cliente-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => editarCliente(cliente)}
                      title="Editar"
                    >
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm text-error" 
                      onClick={() => eliminarCliente(cliente)}
                      title="Eliminar"
                    >
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <span className={`badge badge-${cliente.tipo_industria}`}>
                  {getIndustryLabel(cliente.tipo_industria)}
                </span>
              </div>
              
              <div className="card-body">
                <div className="cliente-stats">
                  <div className="stat-item">
                    <span className="stat-value">{cliente.total_proyectos || 0}</span>
                    <span className="stat-label">Proyecto{cliente.total_proyectos !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Show only the most important contact info */}
                <div className="cliente-contact">
                  {cliente.contacto && (
                    <div className="contact-item">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{cliente.contacto}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="contact-item">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button className="btn btn-outline w-full">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Ver Proyectos
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Clientes