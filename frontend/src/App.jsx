import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Clientes from './components/Clientes'
import ClienteDetalle from './components/ClienteDetalle'
import ProyectoDetalle from './components/ProyectoDetalle'
import Recordatorios from './components/Recordatorios'
import './theme.css'
import './App.css'

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)

  const navegarA = (vista, data = null) => {
    setVistaActual(vista)
    
    if (vista === 'cliente-detalle') {
      setClienteSeleccionado(data)
      setProyectoSeleccionado(null)
    } else if (vista === 'proyecto-detalle') {
      setProyectoSeleccionado(data)
    } else {
      setClienteSeleccionado(null)
      setProyectoSeleccionado(null)
    }
  }

  const handleVerProyecto = (proyecto) => {
    navegarA('proyecto-detalle', proyecto)
  }

  const volverAClientes = () => {
    navegarA('clientes')
  }

  const volverAClienteDetalle = () => {
    if (clienteSeleccionado) {
      navegarA('cliente-detalle', clienteSeleccionado)
    } else {
      navegarA('clientes')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <h1>ProjectFlow</h1>
          <span className="header-subtitle">Gestión Profesional de Proyectos</span>
        </div>
        
        <nav className="nav">
          <button 
            className={vistaActual === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navegarA('dashboard')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </button>
          
          <button 
            className={vistaActual === 'clientes' || vistaActual === 'cliente-detalle' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navegarA('clientes')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Clientes
          </button>
          
          <button 
            className={vistaActual === 'recordatorios' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navegarA('recordatorios')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Recordatorios
          </button>
        </nav>
      </header>

      <main className="app-main">
        {vistaActual === 'dashboard' && (
          <Dashboard onNavigate={navegarA} />
        )}
        
        {vistaActual === 'clientes' && (
          <Clientes onVerCliente={(cliente) => navegarA('cliente-detalle', cliente)} />
        )}
        
        {vistaActual === 'cliente-detalle' && clienteSeleccionado && (
          <ClienteDetalle 
            cliente={clienteSeleccionado}
            onVolver={volverAClientes}
            onVerProyecto={handleVerProyecto}
          />
        )}
        
        {vistaActual === 'proyecto-detalle' && proyectoSeleccionado && (
          <ProyectoDetalle 
            proyecto={proyectoSeleccionado} 
            onVolver={volverAClienteDetalle}
          />
        )}
        
        {vistaActual === 'recordatorios' && (
          <Recordatorios />
        )}
      </main>
    </div>
  )
}

export default App
