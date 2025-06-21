const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Inicializar base de datos
const db = new Database();

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.id;
    const uploadPath = path.join(__dirname, '../uploads', projectId);
    
    // Crear directorio del proyecto si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes y audios
    const allowedMimes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/webm',
      'audio/ogg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Rutas de clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await db.getClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await db.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de proyectos
app.get('/api/proyectos', async (req, res) => {
  try {
    const proyectos = await db.getProyectos();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proyectos/:id', async (req, res) => {
  try {
    const proyecto = await db.getProyecto(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proyectos', async (req, res) => {
  try {
    const proyecto = await db.createProyecto(req.body);
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de recursos
app.get('/api/proyectos/:id/recursos', async (req, res) => {
  try {
    const recursos = await db.getRecursos(req.params.id);
    res.json(recursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proyectos/:id/recursos', async (req, res) => {
  try {
    const recurso = await db.createRecurso(req.params.id, req.body);
    res.status(201).json(recurso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para subir archivos (fotos y audios)
app.post('/api/proyectos/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const projectId = req.params.id;
    const { descripcion } = req.body;
    
    // Determinar tipo de archivo
    const isImage = req.file.mimetype.startsWith('image/');
    const tipo = isImage ? 'foto' : 'audio';
    
    // Ruta relativa para almacenar en BD
    const archivo_path = `${projectId}/${req.file.filename}`;
    
    // Guardar registro en base de datos
    const recurso = await db.createRecurso(projectId, {
      tipo: tipo,
      archivo_path: archivo_path,
      descripcion: descripcion || ''
    });

    res.status(201).json({
      ...recurso,
      url: `/uploads/${archivo_path}`
    });
  } catch (error) {
    // Limpiar archivo si hubo error en BD
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: error.message });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});