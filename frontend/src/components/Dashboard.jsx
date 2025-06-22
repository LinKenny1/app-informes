import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recordatorios, setRecordatorios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [statsRes, recordatoriosRes] = await Promise.all([
        fetch(`${API_URL}/dashboard`),
        fetch(`${API_URL}/recordatorios?estado=pending`)
      ])
      
      const statsData = await statsRes.json()
      const recordatoriosData = await recordatoriosRes.json()
      
      setStats(statsData)
      setRecordatorios(recordatoriosData.slice(0, 5)) // Solo los próximos 5
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (estado) => {
    const labels = {
      unstarted: 'Sin iniciar',
      in_progress: 'En progreso',
      completed: 'Completado',
      delivered: 'Entregado',
      invoiced: 'Facturado'
    }
    return labels[estado] || estado
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Cargando dashboard...</span>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-secondary">Resumen de tu negocio</p>
      </div>

      {/* Métricas principales - Simplified for mobile */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{stats?.totalClientes?.[0]?.count || 0}</span>
            <span className="metric-label">Clientes</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{stats?.totalProyectos?.[0]?.count || 0}</span>
            <span className="metric-label">Proyectos</span>
          </div>
        </div>

        <div className="metric-card metric-card-full">
          <div className="metric-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{stats?.recordatoriosPendientes?.[0]?.count || 0}</span>
            <span className="metric-label">Recordatorios Pendientes</span>
          </div>
        </div>
      </div>

      {/* Simplified content for mobile */}
      <div className="dashboard-content">
        {/* Only show reminders if there are any */}
        {recordatorios.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Recordatorios Próximos</h3>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('recordatorios')}
              >
                Ver todos
              </button>
            </div>
            <div className="card-body">
              <div className="recordatorios-list">
                {recordatorios.slice(0, 3).map(recordatorio => (
                  <div key={recordatorio.id} className="recordatorio-item">
                    <div className={`badge badge-${recordatorio.prioridad}`}>
                      {recordatorio.tipo}
                    </div>
                    <div className="recordatorio-content">
                      <h4>{recordatorio.titulo}</h4>
                      <div className="recordatorio-meta">
                        <span className="text-sm text-muted">
                          {formatDate(recordatorio.fecha_recordatorio)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simplified quick actions */}
      <div className="quick-actions">
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn"
            onClick={() => onNavigate('clientes')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Ver Clientes</span>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => onNavigate('recordatorios')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>Recordatorios</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard