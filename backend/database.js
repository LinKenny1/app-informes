const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'informes.db');
    this.db = null;
    this.init();
  }

  async init() {
    try {
      const SQL = await initSqlJs();
      
      // Load existing database or create new one
      let data;
      if (fs.existsSync(this.dbPath)) {
        data = fs.readFileSync(this.dbPath);
      }
      
      this.db = new SQL.Database(data);
      
      const createTables = `
        CREATE TABLE IF NOT EXISTS clientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          contacto TEXT,
          telefono TEXT,
          email TEXT,
          direccion TEXT,
          tipo_industria TEXT CHECK(tipo_industria IN ('mall', 'oficina', 'industria')),
          notas_generales TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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

        CREATE TABLE IF NOT EXISTS recursos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proyecto_id INTEGER NOT NULL,
          tipo TEXT NOT NULL CHECK(tipo IN ('foto', 'audio', 'nota_texto')),
          archivo_path TEXT,
          descripcion TEXT,
          transcripcion TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
        );

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

      this.db.exec(createTables);
      this.saveDatabase();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }
  }

  saveDatabase() {
    if (this.db) {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, data);
    }
  }

  // CRUD Clientes
  getClientes() {
    try {
      const stmt = this.db.prepare('SELECT * FROM clientes ORDER BY nombre');
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createCliente(cliente) {
    try {
      const { nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales } = cliente;
      
      this.db.run(
        `INSERT INTO clientes (nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales]
      );
      
      const result = this.db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0].values[0][0];
      this.saveDatabase();
      return Promise.resolve({ id: lastId, ...cliente });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  updateCliente(id, cliente) {
    try {
      const { nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales } = cliente;
      
      this.db.run(
        `UPDATE clientes SET nombre = ?, contacto = ?, telefono = ?, email = ?, 
         direccion = ?, tipo_industria = ?, notas_generales = ? WHERE id = ?`,
        [nombre, contacto, telefono, email, direccion, tipo_industria, notas_generales, id]
      );
      
      this.saveDatabase();
      return Promise.resolve({ id: parseInt(id), ...cliente });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  deleteCliente(id) {
    try {
      // First check if client has projects
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM proyectos WHERE cliente_id = ?');
      stmt.bind([id]);
      let count = 0;
      if (stmt.step()) {
        count = stmt.getAsObject().count;
      }
      stmt.free();
      
      if (count > 0) {
        return Promise.reject(new Error('No se puede eliminar el cliente porque tiene proyectos asociados'));
      }
      
      // Delete client if no projects exist
      this.db.run('DELETE FROM clientes WHERE id = ?', [id]);
      this.saveDatabase();
      return Promise.resolve({ deleted: true, id: parseInt(id) });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // CRUD Proyectos
  getProyectos() {
    try {
      const sql = `
        SELECT p.*, c.nombre as cliente_nombre 
        FROM proyectos p 
        JOIN clientes c ON p.cliente_id = c.id 
        ORDER BY p.fecha_creacion DESC
      `;
      
      const stmt = this.db.prepare(sql);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getProyecto(id) {
    try {
      const sql = `
        SELECT p.*, c.nombre as cliente_nombre, c.contacto, c.telefono 
        FROM proyectos p 
        JOIN clientes c ON p.cliente_id = c.id 
        WHERE p.id = ?
      `;
      
      const stmt = this.db.prepare(sql);
      stmt.bind([id]);
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return Promise.resolve(row);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createProyecto(proyecto) {
    try {
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto } = proyecto;
      
      this.db.run(
        `INSERT INTO proyectos (cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad || 'medium', estado || 'unstarted', presupuesto]
      );
      
      const result = this.db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0].values[0][0];
      this.saveDatabase();
      return Promise.resolve({ id: lastId, ...proyecto });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  updateProyecto(id, proyecto) {
    try {
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto } = proyecto;
      
      this.db.run(
        `UPDATE proyectos SET cliente_id = ?, nombre = ?, descripcion = ?, ubicacion = ?, 
         tipo_instalacion = ?, fecha_inicio = ?, fecha_fin = ?, fecha_limite = ?, prioridad = ?, estado = ?, presupuesto = ? 
         WHERE id = ?`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, estado, presupuesto, id]
      );
      
      this.saveDatabase();
      return Promise.resolve({ id: parseInt(id), ...proyecto });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  deleteProyecto(id) {
    try {
      // Delete all resources first
      this.db.run('DELETE FROM recursos WHERE proyecto_id = ?', [id]);
      
      // Then delete the project
      this.db.run('DELETE FROM proyectos WHERE id = ?', [id]);
      
      this.saveDatabase();
      return Promise.resolve({ deleted: true, id: parseInt(id) });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // CRUD Recursos
  getRecursos(proyectoId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM recursos WHERE proyecto_id = ? ORDER BY fecha_creacion DESC');
      stmt.bind([proyectoId]);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createRecurso(proyectoId, recurso) {
    try {
      const { tipo, archivo_path, descripcion, transcripcion } = recurso;
      
      this.db.run(
        `INSERT INTO recursos (proyecto_id, tipo, archivo_path, descripcion, transcripcion) 
         VALUES (?, ?, ?, ?, ?)`,
        [proyectoId, tipo, archivo_path, descripcion, transcripcion]
      );
      
      const result = this.db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0].values[0][0];
      this.saveDatabase();
      return Promise.resolve({ id: lastId, proyecto_id: proyectoId, ...recurso });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  deleteRecurso(id) {
    try {
      // Get resource info before deleting (for file cleanup)
      const stmt = this.db.prepare('SELECT * FROM recursos WHERE id = ?');
      stmt.bind([id]);
      let recurso = null;
      if (stmt.step()) {
        recurso = stmt.getAsObject();
      }
      stmt.free();
      
      if (!recurso) {
        return Promise.reject(new Error('Recurso no encontrado'));
      }
      
      // Delete from database
      this.db.run('DELETE FROM recursos WHERE id = ?', [id]);
      this.saveDatabase();
      return Promise.resolve({ deleted: true, id: parseInt(id), archivo_path: recurso.archivo_path });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // CRUD Recordatorios
  getRecordatorios(filtros = {}) {
    try {
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

      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  createRecordatorio(recordatorio) {
    try {
      const { proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo, prioridad } = recordatorio;
      
      this.db.run(
        `INSERT INTO recordatorios (proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo, prioridad) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [proyecto_id, cliente_id, titulo, descripcion, fecha_recordatorio, tipo || 'general', prioridad || 'medium']
      );
      
      const result = this.db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0].values[0][0];
      this.saveDatabase();
      return Promise.resolve({ id: lastId, ...recordatorio });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  updateRecordatorio(id, recordatorio) {
    try {
      const { titulo, descripcion, fecha_recordatorio, tipo, estado, prioridad } = recordatorio;
      
      this.db.run(
        `UPDATE recordatorios SET titulo = ?, descripcion = ?, fecha_recordatorio = ?, 
         tipo = ?, estado = ?, prioridad = ? WHERE id = ?`,
        [titulo, descripcion, fecha_recordatorio, tipo, estado, prioridad, id]
      );
      
      this.saveDatabase();
      return Promise.resolve({ id: parseInt(id), ...recordatorio });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  deleteRecordatorio(id) {
    try {
      this.db.run('DELETE FROM recordatorios WHERE id = ?', [id]);
      this.saveDatabase();
      return Promise.resolve({ deleted: true, id: parseInt(id) });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Método para obtener clientes con conteo de proyectos
  getClientesWithStats() {
    try {
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
      
      const stmt = this.db.prepare(sql);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Método para obtener estadísticas del dashboard
  getDashboardStats() {
    try {
      const results = {};
      
      // Total clientes
      let stmt = this.db.prepare('SELECT COUNT(*) as count FROM clientes');
      if (stmt.step()) {
        results.totalClientes = [stmt.getAsObject()];
      }
      stmt.free();
      
      // Total proyectos
      stmt = this.db.prepare('SELECT COUNT(*) as count FROM proyectos');
      if (stmt.step()) {
        results.totalProyectos = [stmt.getAsObject()];
      }
      stmt.free();
      
      // Proyectos por estado
      stmt = this.db.prepare('SELECT estado, COUNT(*) as count FROM proyectos GROUP BY estado');
      const proyectosPorEstado = [];
      while (stmt.step()) {
        proyectosPorEstado.push(stmt.getAsObject());
      }
      stmt.free();
      results.proyectosPorEstado = proyectosPorEstado;
      
      // Ingreso total
      stmt = this.db.prepare('SELECT COALESCE(SUM(presupuesto), 0) as total FROM proyectos WHERE estado = "invoiced"');
      if (stmt.step()) {
        results.ingresoTotal = [stmt.getAsObject()];
      }
      stmt.free();
      
      // Recordatorios pendientes
      stmt = this.db.prepare('SELECT COUNT(*) as count FROM recordatorios WHERE estado = "pending" AND fecha_recordatorio <= datetime("now", "+7 days")');
      if (stmt.step()) {
        results.recordatoriosPendientes = [stmt.getAsObject()];
      }
      stmt.free();
      
      return Promise.resolve(results);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;