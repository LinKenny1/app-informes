# Guía de Desarrollo

## Estructura del Proyecto

```
app-informes/
├── backend/
│   ├── server.js          # Servidor Express principal
│   ├── database.js        # Clase para manejo de SQLite
│   ├── package.json       # Dependencias backend
│   └── informes.db        # Base de datos SQLite (se crea automáticamente)
├── frontend/
│   ├── src/               # Código React
│   ├── package.json       # Dependencias frontend
│   └── vite.config.js     # Configuración Vite
├── uploads/               # Archivos subidos (fotos, audios)
└── docs/                  # Documentación
```

## Base de Datos

### Tabla `clientes`
- `id`: Clave primaria
- `nombre`: Nombre del cliente (requerido)
- `contacto`: Persona de contacto
- `telefono`, `email`: Datos de contacto
- `direccion`: Dirección física
- `tipo_industria`: mall, oficina, industria
- `notas_generales`: Observaciones adicionales

### Tabla `proyectos`
- `id`: Clave primaria
- `cliente_id`: Referencia al cliente
- `nombre`: Nombre del proyecto (requerido)
- `descripcion`: Descripción detallada
- `ubicacion`: Dirección específica del proyecto
- `tipo_instalacion`: Tipo de sistema instalado
- `fecha_inicio`, `fecha_fin`: Fechas del proyecto
- `estado`: en_progreso, completado, facturado
- `presupuesto`: Valor económico

### Tabla `recursos`
- `id`: Clave primaria
- `proyecto_id`: Referencia al proyecto
- `tipo`: foto, audio, nota_texto
- `archivo_path`: Ruta del archivo (para fotos/audios)
- `descripcion`: Descripción del recurso
- `transcripcion`: Texto transcrito (para audios)

## API Endpoints

### Clientes
- `GET /api/clientes` - Lista todos los clientes
- `POST /api/clientes` - Crear nuevo cliente

### Proyectos
- `GET /api/proyectos` - Lista todos los proyectos con info del cliente
- `GET /api/proyectos/:id` - Obtener proyecto específico
- `POST /api/proyectos` - Crear nuevo proyecto

### Recursos
- `GET /api/proyectos/:id/recursos` - Lista recursos de un proyecto
- `POST /api/proyectos/:id/recursos` - Agregar recurso a proyecto

## Comandos de Desarrollo

### Backend
```bash
cd backend
npm run dev     # Inicia servidor con nodemon
npm start       # Inicia servidor en producción
```

### Frontend
```bash
cd frontend
npm run dev     # Inicia servidor de desarrollo
npm run build   # Construye para producción
```

## Principios de Código

1. **Simplicidad**: Código fácil de leer y entender
2. **Comentarios claros**: Explicar el "por qué", no el "qué"
3. **Manejo de errores**: Siempre capturar y manejar errores
4. **Validación**: Validar datos en backend antes de guardar
5. **Consistencia**: Mantener estilo de código uniforme

## Próximas Funcionalidades

- Subida de archivos con multer
- Grabación de audio con MediaRecorder API
- Transcripción con Whisper.cpp
- Generación de PDF con jsPDF