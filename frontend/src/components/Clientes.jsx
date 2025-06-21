import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_industria: 'oficina',
    notas_generales: ''
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`)
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
      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      })
      
      if (response.ok) {
        await cargarClientes()
        setMostrarFormulario(false)
        setNuevoCliente({
          nombre: '',
          contacto: '',
          telefono: '',
          email: '',
          direccion: '',
          tipo_industria: 'oficina',
          notas_generales: ''
        })
      }
    } catch (error) {
      console.error('Error guardando cliente:', error)
    }
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

  return (
    <div className="clientes-container">
      <div className="section-header">
        <h2>👥 Clientes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          ➕ Nuevo Cliente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nuevo Cliente</h3>
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
                    <option value="oficina">Oficina</option>
                    <option value="mall">Mall</option>
                    <option value="industria">Industria</option>
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
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cliente
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
            <div key={cliente.id} className="cliente-card">
              <div className="cliente-header">
                <h3>{cliente.nombre}</h3>
                <span className={`badge badge-${cliente.tipo_industria}`}>
                  {cliente.tipo_industria}
                </span>
              </div>
              
              <div className="cliente-info">
                {cliente.contacto && <p><strong>Contacto:</strong> {cliente.contacto}</p>}
                {cliente.telefono && <p><strong>Teléfono:</strong> {cliente.telefono}</p>}
                {cliente.email && <p><strong>Email:</strong> {cliente.email}</p>}
                {cliente.direccion && <p><strong>Dirección:</strong> {cliente.direccion}</p>}
                {cliente.notas_generales && <p><strong>Notas:</strong> {cliente.notas_generales}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Clientes