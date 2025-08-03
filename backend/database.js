const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'informes.db'));
    this.init();
  }

  init() {
    const createTables = `
      -- Tabla de clientes
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        contacto TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        tipo_industria TEXT CHECK(tipo_industria IN ('mall', 'office', 'industry')),
        notas_generales TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de proyectos
      CREATE TABLE IF NOT EXISTS proyectos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        ubicacion TEXT,
        tipo_instalacion TEXT,
        fecha_inicio DATE,
        fecha_fin DATE,
        estado TEXT DEFAULT 'unstarted' CHECK(estado IN ('unstarted', 'in_progress', 'completed', 'delivered', 'invoiced')),
        fecha_limite DATE,
        prioridad TEXT DEFAULT 'medium' CHECK(prioridad IN ('low', 'medium', 'high', 'urgent')),
        presupuesto DECIMAL(10,2),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      );

      -- Tabla de recursos (fotos, audios, notas)
      CREATE TABLE IF NOT EXISTS recursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('photo', 'audio', 'text_note')),
        archivo_path TEXT,
        descripcion TEXT,
        transcripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
      );

      -- Tabla de recordatorios
      CREATE TABLE IF NOT EXISTS recordatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER,
        cliente_id INTEGER,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        fecha_recordatorio DATETIME NOT NULL,
        tipo TEXT DEFAULT 'general' CHECK(tipo IN ('deadline', 'followup', 'meeting', 'general')),
        estado TEXT DEFAULT 'pending' CHECK(estado IN ('pending', 'completed', 'dismissed')),
        prioridad TEXT DEFAULT 'medium' CHECK(prioridad IN ('low', 'medium', 'high', 'urgent')),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos (id),
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      );
    `;

    this.db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creando tablas:', err);
      } else {
        console.log('Base de datos inicializada correctamente');
      }
    });
  }

  // CRUD Clientes
  getClientes() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM clientes ORDER BY nombre', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  createCliente(cliente) {
    return new Promise((resolve, reject) => {
      const { nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales } = cliente;
      
      this.db.run(
        `INSERT INTO clientes (nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...cliente });
        }
      );
    });
  }

  updateCliente(id, cliente) {
    return new Promise((resolve, reject) => {
      const { nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales } = cliente;
      
      this.db.run(
        `UPDATE clientes SET nombre = ?, contacto = ?, telefono = ?, email = ?, 
         direccion = ?, tipo_industria = ?, notas_generales = ? WHERE id = ?`,
        [nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Cliente no encontrado'));
          else resolve({ id: parseInt(id), ...cliente });
        }
      );
    });
  }

  deleteCliente(id) {
    return new Promise((resolve, reject) => {
      // First check if client has projects
      this.db.get('SELECT COUNT(*) as count FROM proyectos WHERE cliente_id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row.count > 0) {
          reject(new Error('No se puede eliminar el cliente porque tiene proyectos asociados'));
          return;
        }
        
        // Delete client if no projects exist
        this.db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Cliente no encontrado'));
          else resolve({ deleted: true, id: parseInt(id) });
        });
      });
    });
  }

  // CRUD Proyectos
  getProyectos() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, c.nombre as cliente_nombre 
        FROM proyectos p 
        JOIN clientes c ON p.cliente_id = c.id 
        ORDER BY p.fecha_creacion DESC
      `;
      
      this.db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getProyecto(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, c.nombre as cliente_nombre, c.contacto, c.telefono 
        FROM proyectos p 
        JOIN clientes c ON p.cliente_id = c.id 
        WHERE p.id = ?
      `;
      
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createProyecto(proyecto) {
    return new Promise((resolve, reject) => {
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto } = proyecto;
      
      this.db.run(
        `INSERT INTO proyectos (cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad || 'medium', estado || 'unstarted', presupuesto],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...proyecto });
        }
      );
    });
  }

  updateProyecto(id, proyecto) {
    return new Promise((resolve, reject) => {
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto } = proyecto;
      
      this.db.run(
        `UPDATE proyectos SET cliente_id = ?, nombre = ?, descripcion = ?, ubicacion = ?, 
         tipo_instalacion = ?, fecha_inicio = ?, fecha_fin = ?, fecha_limite = ?, prioridad = ?, estado = ?, presupuesto = ? 
         WHERE id = ?`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto, id],
        (err) => {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Proyecto no encontrado'));
          } else {
            // Return the updated project with cliente information
            const sql = `
              SELECT p.*, c.nombre as cliente_nombre, c.contacto, c.telefono 
              FROM proyectos p 
              JOIN clientes c ON p.cliente_id = c.id 
              WHERE p.id = ?
            `;
            
            this.db.get(sql, [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  }

  deleteProyecto(id) {
    return new Promise((resolve, reject) => {
      const db = this.db; // Store reference to avoid scope issues
      
      // Start transaction to delete project and its resources
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Delete all resources first
        db.run('DELETE FROM recursos WHERE proyecto_id = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          // Then delete the project
          db.run('DELETE FROM proyectos WHERE id = ?', [id], function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else if (this.changes === 0) {
              db.run('ROLLBACK');
              reject(new Error('Proyecto no encontrado'));
            } else {
              db.run('COMMIT');
              resolve({ deleted: true, id: parseInt(id) });
            }
          });
        });
      });
    });
  }

  // CRUD Recursos
  getRecursos(proyectoId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM recursos WHERE proyecto_id = ? ORDER BY fecha_creacion DESC',
        [proyectoId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getRecurso(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM recursos WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  createRecurso(proyectoId, recurso) {
    return new Promise((resolve, reject) => {
      const { tipo, archivo_path, descripcion, transcripcion } = recurso;
      
      this.db.run(
        `INSERT INTO recursos (proyecto_id, tipo, archivo_path, descripcion, transcripcion) 
         VALUES (?, ?, ?, ?, ?)`,
        [proyectoId, tipo, archivo_path, descripcion, transcripcion],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, proyecto_id: proyectoId, ...recurso });
        }
      );
    });
  }

  deleteRecurso(id) {
    return new Promise((resolve, reject) => {
      // Get resource info before deleting (for file cleanup)
      this.db.get('SELECT * FROM recursos WHERE id = ?', [id], (err, recurso) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!recurso) {
          reject(new Error('Recurso no encontrado'));
          return;
        }
        
        // Delete from database
        this.db.run('DELETE FROM recursos WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve({ deleted: true, id: parseInt(id), archivo_path: recurso.archivo_path });
        });
      });
    });
  }

  // CRUD Recordatorios
  getRecordatorios(filtros = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT r.*, 
               c.nombre as cliente_nombre,
               p.nombre as proyecto_nombre
        FROM recordatorios r
        LEFT JOIN clientes c ON r.cliente_id = c.id
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (filtros.estado) {
        sql += ' AND r.estado = ?';
        params.push(filtros.estado);
      }

      if (filtros.proyecto_id) {
        sql += ' AND r.proyecto_id = ?';
        params.push(filtros.proyecto_id);
      }

      if (filtros.cliente_id) {
        sql += ' AND r.cliente_id = ?';
        params.push(filtros.cliente_id);
      }

      sql += ' ORDER BY r.fecha_recordatorio ASC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  createRecordatorio(recordatorio) {
    return new Promise((resolve, reject) => {
      const { proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo, prioridad } = recordatorio;
      
      this.db.run(
        `INSERT INTO recordatorios (proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo, prioridad) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo || 'general', prioridad || 'medium'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...recordatorio });
        }
      );
    });
  }

  updateRecordatorio(id, recordatorio) {
    return new Promise((resolve, reject) => {
      const { titulo, descripcion, fecha_recordatorio, tipo, estado, prioridad } = recordatorio;
      
      this.db.run(
        `UPDATE recordatorios SET titulo = ?, descripcion = ?, fecha_recordatorio = ?, 
         tipo = ?, estado = ?, prioridad = ? WHERE id = ?`,
        [titulo, descripcion, fecha_recordatorio, tipo, estado, prioridad, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Recordatorio no encontrado'));
          else resolve({ id: parseInt(id), ...recordatorio });
        }
      );
    });
  }

  deleteRecordatorio(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM recordatorios WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Recordatorio no encontrado'));
        else resolve({ deleted: true, id: parseInt(id) });
      });
    });
  }

  // Método para obtener clientes con conteo de proyectos
  getClientesWithStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.*,
               COUNT(p.id) as total_proyectos,
               COUNT(CASE WHEN p.estado = 'unstarted' THEN 1 END) as proyectos_unstarted,
               COUNT(CASE WHEN p.estado = 'in_progress' THEN 1 END) as proyectos_in_progress,
               COUNT(CASE WHEN p.estado = 'completed' THEN 1 END) as proyectos_completed,
               COUNT(CASE WHEN p.estado = 'delivered' THEN 1 END) as proyectos_delivered,
               COUNT(CASE WHEN p.estado = 'invoiced' THEN 1 END) as proyectos_invoiced,
               COALESCE(SUM(p.presupuesto), 0) as valor_total,
               MAX(p.fecha_creacion) as ultima_actividad
        FROM clientes c
        LEFT JOIN proyectos p ON c.id = p.cliente_id
        GROUP BY c.id
        ORDER BY c.nombre
      `;
      
      this.db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Método para obtener estadísticas del dashboard
  getDashboardStats() {
    return new Promise((resolve, reject) => {
      const queries = {
        totalClientes: 'SELECT COUNT(*) as count FROM clientes',
        totalProyectos: 'SELECT COUNT(*) as count FROM proyectos',
        proyectosPorEstado: `
          SELECT estado, COUNT(*) as count 
          FROM proyectos 
          GROUP BY estado
        `,
        ingresoTotal: 'SELECT COALESCE(SUM(presupuesto), 0) as total FROM proyectos WHERE estado = "invoiced"',
        recordatoriosPendientes: 'SELECT COUNT(*) as count FROM recordatorios WHERE estado = "pending" AND fecha_recordatorio <= datetime("now", "+7 days")'
      };

      const results = {};
      const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
          this.db.all(queries[key], (err, rows) => {
            if (err) reject(err);
            else {
              results[key] = rows;
              resolve();
            }
          });
        });
      });

      Promise.all(promises)
        .then(() => resolve(results))
        .catch(reject);
    });
  }

  // Update transcription for a resource
  updateRecursoTranscripcion(id, transcripcion) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE recursos SET transcripcion = ? WHERE id = ?',
        [transcripcion, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Recurso no encontrado'));
          else resolve({ id: parseInt(id), transcripcion });
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;