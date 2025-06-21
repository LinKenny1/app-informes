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
        tipo_industria TEXT CHECK(tipo_industria IN ('mall', 'oficina', 'industria')),
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
        estado TEXT DEFAULT 'en_progreso' CHECK(estado IN ('en_progreso', 'completado', 'facturado')),
        presupuesto DECIMAL(10,2),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      );

      -- Tabla de recursos (fotos, audios, notas)
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
      const { cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto } = proyecto;
      
      this.db.run(
        `INSERT INTO proyectos (cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente_id, nombre, descripcion, ubicacion, tipo_instalacion, fecha_inicio, fecha_fin, presupuesto],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...proyecto });
        }
      );
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

  close() {
    this.db.close();
  }
}

module.exports = Database;