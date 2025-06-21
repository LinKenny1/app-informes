# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application for managing security system installation projects and generating automated reports. It consists of a Node.js/Express backend with SQLite database and a React frontend built with Vite.

## Development Commands

### Backend (from `/backend`)
- `npm run dev` - Start development server with nodemon (port 3001)
- `npm start` - Start production server

### Frontend (from `/frontend`) 
- `npm run dev` - Start Vite development server (port 5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Testing
No test framework is currently configured. If adding tests, check existing patterns first.

## Architecture

### Database Schema (SQLite)
- **clientes**: Customer information with industry type validation ('mall', 'oficina', 'industria')
- **proyectos**: Projects linked to clients with status tracking ('en_progreso', 'completado', 'facturado')  
- **recursos**: Project resources (photos, audio, text notes) with file paths and transcription support

### Backend Structure
- `server.js`: Express server with CORS, file upload (multer), and REST API endpoints
- `database.js`: SQLite database class with async/await methods for all CRUD operations
- File uploads stored in `/uploads/{projectId}/` with unique timestamped filenames
- API endpoints follow pattern `/api/{resource}` with proper error handling

### Frontend Structure
- Single-page app with simple state-based navigation in `App.jsx`
- Main views: Clientes, Proyectos, ProyectoDetalle
- Component hierarchy: App → Views → Specialized components (PhotoUploader, AudioRecorder, etc.)
- PDF generation using jsPDF in `utils/pdfGenerator.js`
- API calls use fetch with hardcoded `http://localhost:3001/api` base URL

## Key Patterns

### File Upload Flow
1. Multer processes files to `/uploads/{projectId}/`
2. Database stores relative path `{projectId}/{filename}`
3. Static serving at `/uploads` endpoint provides access
4. Cleanup on database errors

### Error Handling
- Backend: Try-catch with proper HTTP status codes
- Frontend: Console logging, basic user feedback
- Database: Promise-based with proper rejection handling

### Data Flow
- React state management without external libraries
- Direct API calls from components
- Real-time resource loading after uploads

## Important Notes

- No TypeScript - uses plain JavaScript with JSX
- No state management library - relies on React useState
- File size limit: 10MB for uploads
- Supported file types: images (jpeg, png, gif, webp) and audio (mp3, wav, webm, ogg)
- Database auto-creates on first run
- Simple CSS without framework