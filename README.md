# App de Gestión de Informes

Una aplicación web completa para gestionar proyectos de instalación de sistemas de seguridad y generar informes automáticamente.

## Estado Actual ✅

La aplicación está **completamente funcional** con las siguientes características implementadas:

### Funcionalidades Principales
- ✅ **Gestión Completa de Clientes**: Crear, editar, eliminar y visualizar clientes con información de contacto completa
- ✅ **Gestión Completa de Proyectos**: Crear, editar, eliminar proyectos vinculados a clientes con seguimiento de estado
- ✅ **Gestión de Recursos**: Subir fotos, grabar audio, crear notas de texto y eliminar recursos
- ✅ **Generación de PDF**: Informes automáticos con imágenes embebidas y todos los datos del proyecto
- ✅ **Interfaz Intuitiva**: Navegación simple con funciones completas de CRUD

### Recursos Soportados
- 📸 **Fotos**: Subida con drag-and-drop, vista previa y descripción
- 🎤 **Audio**: Grabación directa desde navegador con reproducción
- 📝 **Notas de Texto**: Creación y almacenamiento de observaciones

## Arquitectura

```
app-informes/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express + SQLite
├── uploads/           # Archivos subidos (fotos, audios)
├── docs/              # Documentación técnica
└── README.md
```

## Stack Tecnológico

- **Frontend:** React 18 + Vite + CSS simple
- **Backend:** Node.js + Express + SQLite3
- **Base de datos:** SQLite (archivo local)
- **Archivos:** Sistema de archivos local
- **PDF:** jsPDF para generación de reportes

## Instalación

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Estructura de Datos

### Clientes
- Información básica (nombre, contacto, tipo de industria)
- Múltiples proyectos asociados

### Proyectos
- Vinculados a un cliente
- Estados: En progreso, Completado, Facturado
- Múltiples recursos asociados

### Recursos
- Fotos con descripción
- Notas de voz (con transcripción futura)
- Notas de texto
- Organizados por proyecto

## Desarrollo

El proyecto está diseñado para ser:
- **Simple:** Código fácil de entender y mantener
- **Funcional:** Enfocado en resolver el problema específico
- **Escalable:** Preparado para futuras mejoras (transcripción, etc.)

## Limitaciones Conocidas ⚠️

- **Sin Transcripción**: Los audios se almacenan pero no se transcriben automáticamente

## Funcionalidades Futuras 🚀

### Próximas Mejoras
- 🎯 **Transcripción de Audio**: Conversión automática de voz a texto
- 🔍 **Búsqueda y Filtros**: Localización rápida de información
- 📊 **Dashboard**: Estadísticas y resumen de proyectos
- 🔄 **Actualización de Estado**: Cambio rápido de estados de proyectos
- 📝 **Plantillas de Notas**: Plantillas predefinidas para notas comunes

### Futuras Expansiones
- 🔐 **Sistema de Usuarios**: Autenticación y roles
- 📱 **App Móvil**: Versión nativa para trabajo de campo
- ☁️ **Backup en la Nube**: Sincronización y respaldo automático
- 🎨 **Plantillas Personalizables**: Informes con branding empresarial