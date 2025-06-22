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
          estado TEXT DEFAULT 'en_progreso' CHECK(estado IN ('en_progreso', 'completado', 'facturado')),
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
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto } = proyecto;
      
      this.db.run(
        `INSERT INTO proyectos (cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto]
      );
      
      const result = this.db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0].values[0][0];
      this.saveDatabase();
      return Promise.resolve({ id: lastId, ...proyecto });
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

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;