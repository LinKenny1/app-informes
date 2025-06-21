import { useState } from 'react'
import Clientes from './components/Clientes'
import Proyectos from './components/Proyectos'
import ProyectoDetalle from './components/ProyectoDetalle'
import './App.css'

function App() {
  const [vistaActual, setVistaActual] = useState('clientes')
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)

  const navegarA = (vista, proyecto = null) => {
    setVistaActual(vista)
    setProyectoSeleccionado(proyecto)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Gestión de Informes</h1>
        <nav className="nav">
          <button 
            className={vistaActual === 'clientes' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navegarA('clientes')}
          >
            👥 Clientes
          </button>
          <button 
            className={vistaActual === 'proyectos' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navegarA('proyectos')}
          >
            📁 Proyectos
          </button>
        </nav>
      </header>

      <main className="app-main">
        {vistaActual === 'clientes' && <Clientes />}
        {vistaActual === 'proyectos' && <Proyectos onVerProyecto={navegarA} />}
        {vistaActual === 'proyecto-detalle' && proyectoSeleccionado && (
          <ProyectoDetalle 
            proyecto={proyectoSeleccionado} 
            onVolver={() => navegarA('proyectos')} 
          />
        )}
      </main>
    </div>
  )
}

export default App
