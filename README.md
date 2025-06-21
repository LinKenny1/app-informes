# App de Gestión de Informes

Una aplicación web simple para gestionar proyectos de instalación de sistemas de seguridad y generar informes automáticamente.

## Descripción

Esta aplicación ayuda a empresas de redes y seguridad a:
- Gestionar clientes e información de contacto
- Organizar proyectos/trabajos por cliente
- Almacenar recursos (fotos, notas de voz, notas de texto)
- Generar informes en PDF automáticamente

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

## Funcionalidades Futuras

- Transcripción automática de notas de voz
- Plantillas de informes personalizables
- Backup y sincronización
- Búsqueda avanzada