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

## API Endpoints ✅ Implementados

### Clientes
- `GET /api/clientes` - Lista todos los clientes ✅
- `POST /api/clientes` - Crear nuevo cliente ✅

### Proyectos
- `GET /api/proyectos` - Lista todos los proyectos con info del cliente ✅
- `GET /api/proyectos/:id` - Obtener proyecto específico ✅
- `POST /api/proyectos` - Crear nuevo proyecto ✅

### Recursos
- `GET /api/proyectos/:id/recursos` - Lista recursos de un proyecto ✅
- `POST /api/proyectos/:id/recursos` - Agregar recurso (nota de texto) a proyecto ✅
- `POST /api/proyectos/:id/upload` - Subir archivos (fotos/audio) con multer ✅

### Sistema
- `GET /api/health` - Endpoint de salud del servidor ✅
- `GET /uploads/*` - Servir archivos estáticos (fotos/audios) ✅

### CRUD Completo ✅
- `PUT /api/clientes/:id` - Actualizar cliente ✅
- `DELETE /api/clientes/:id` - Eliminar cliente ✅
- `PUT /api/proyectos/:id` - Actualizar proyecto ✅
- `DELETE /api/proyectos/:id` - Eliminar proyecto ✅  
- `DELETE /api/recursos/:id` - Eliminar recurso ✅

## Endpoints Pendientes ⚠️

### Búsqueda y Filtros
- `GET /api/clientes/search?q=...` - Buscar clientes ❌
- `GET /api/proyectos/filter?estado=...` - Filtrar proyectos ❌

### Funcionalidades Avanzadas
- `POST /api/transcripcion` - Transcribir audio ❌
- `GET /api/estadisticas` - Dashboard con métricas ❌

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

## Estado de Implementación

### ✅ Completado
- ✅ Subida de archivos con multer (fotos y audios)
- ✅ Grabación de audio con MediaRecorder API
- ✅ Generación de PDF con jsPDF e imágenes embebidas
- ✅ Interface completa para gestión de clientes y proyectos
- ✅ Visualización de recursos por proyecto
- ✅ Base de datos SQLite con estructura completa
- ✅ **CRUD Completo**: Crear, editar y eliminar clientes, proyectos y recursos
- ✅ **Limpieza de archivos**: Eliminación automática de archivos al borrar recursos
- ✅ **Validaciones**: Prevención de eliminaciones que afecten integridad de datos

### 🔧 Funcionalidades Parciales
- 🔧 **Audio**: Se graba y almacena, pero no hay transcripción automática

### ❌ Pendientes de Alta Prioridad
- ❌ **Transcripción de audio**: Los audios se graban pero no se transcriben automáticamente

### 🚀 Mejoras Futuras
- Transcripción automática con Whisper.cpp o servicios cloud
- Sistema de búsqueda y filtros avanzados  
- Dashboard con estadísticas
- Sistema de usuarios y autenticación
- Backup y sincronización
- App móvil para trabajo de campo