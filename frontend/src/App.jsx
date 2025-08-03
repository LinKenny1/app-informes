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

  const actualizarProyecto = (proyectoActualizado) => {
    setProyectoSeleccionado(proyectoActualizado)
  }

  const renderNavButton = (view, label, icon, isActive) => (
    <button 
      key={view}
      className={isActive ? 'nav-btn active' : 'nav-btn'}
      onClick={() => navegarA(view)}
    >
      {icon}
      {label}
    </button>
  )

  const navigationItems = [
    {
      view: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      isActive: vistaActual === 'dashboard'
    },
    {
      view: 'clientes',
      label: 'Clientes',
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      isActive: vistaActual === 'clientes' || vistaActual === 'cliente-detalle'
    },
    {
      view: 'recordatorios',
      label: 'Recordatorios',
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      isActive: vistaActual === 'recordatorios'
    }
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <h1>ProjectFlow</h1>
          <span className="header-subtitle">Gestión Profesional de Proyectos</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav">
          {navigationItems.map(item => 
            renderNavButton(item.view, item.label, item.icon, item.isActive)
          )}
        </nav>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="nav nav-mobile">
        {navigationItems.map(item => 
          renderNavButton(item.view, item.label, item.icon, item.isActive)
        )}
      </nav>

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
            onProyectoActualizado={actualizarProyecto}
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
