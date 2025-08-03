# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ProjectFlow** is a professional project management web application for managing security system installation projects with comprehensive client-centric workflows, analytics dashboard, and automated report generation. The application features a modern dark theme and mobile-first responsive design.

## Architecture

### Technology Stack
- **Frontend**: React 19 + Vite, Professional Dark Theme CSS, HTTPS-enabled
- **Backend**: Node.js + Express 5, SQLite3 database, HTTPS server
- **File Handling**: Multer for uploads, jsPDF for PDF generation
- **Navigation**: Client-centric SPA with mobile-first design
- **Security**: Self-signed SSL certificates for development, HTTPS required for camera/microphone access

## Development Commands

### Quick Start (HTTPS)
- `./start-https.sh` - Start both frontend and backend servers with HTTPS configuration

### Backend (from `/backend`)
- `npm run dev` - Start HTTPS development server with nodemon (port 3001)
- `npm start` - Start production server

### Frontend (from `/frontend`) 
- `npm run dev` - Start HTTPS Vite development server (port 5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Access URLs
- **Local development**: https://localhost:5173
- **Network access**: https://[DEVICE_IP]:5173 (e.g., https://192.168.1.15:5173)
- **Backend API**: https://localhost:3001/api

### Testing
No test framework is currently configured. If adding tests, check existing patterns first.

## Database Schema (SQLite)

### Enhanced Schema with Professional Features
- **clientes**: Customer information with industry type validation, contact details, and analytics
- **proyectos**: Projects with enhanced status tracking (unstarted, in_progress, completed, delivered, invoiced), priorities, deadlines, and budget management
- **recursos**: Project resources (photos, audio, text notes) with file paths and transcription support
- **recordatorios**: Comprehensive reminder system with types, priorities, and client/project associations

### Project Status Workflow
1. **Unstarted** → 2. **In Progress** → 3. **Completed** → 4. **Delivered** → 5. **Invoiced**

## Application Structure

### Client-Centric Navigation Flow
- **Dashboard**: Analytics overview with metrics and quick actions
- **Clientes**: Client management with stats and professional cards
- **Cliente Detalle**: Individual client view with kanban-style project organization
- **Proyecto Detalle**: Comprehensive project view with resource management
- **Recordatorios**: Full reminder management system

### Mobile-First Design
- Fixed header with centered branding
- Bottom navigation bar with large touch targets (768px and below)
- Progressive information disclosure
- Simplified layouts and reduced cognitive load
- Touch-friendly interface with 44px minimum button sizes

## Component Architecture

### Core Components
- **App.jsx**: Main navigation controller with client-centric routing
- **Dashboard.jsx**: Analytics dashboard with simplified mobile metrics
- **Clientes.jsx**: Client listing with stats integration and professional cards
- **ClienteDetalle.jsx**: Client-focused project management with kanban/list views
- **ProyectoDetalle.jsx**: Comprehensive project view with resource management
- **Recordatorios.jsx**: Complete reminder management with filtering and scheduling

### Specialized Components
- **PhotoUploader.jsx**: Multi-photo upload with camera functionality and drag-drop
- **AudioRecorder.jsx**: Browser-based audio recording using MediaRecorder API
- **InformePreview.jsx**: PDF report preview with enhanced formatting

## Design System

### Professional Dark Theme
- **CSS Custom Properties**: Complete design token system in `theme.css`
- **Color Palette**: Professional dark colors with proper contrast ratios
- **Typography**: Clean, modern font hierarchy with mobile optimization
- **Component System**: Consistent buttons, cards, forms, and interactive elements
- **Mobile Responsive**: Progressive disclosure and touch-optimized layouts

### Key Design Patterns
- Card-based layouts with hover effects
- Professional SVG icons throughout (no emojis)
- Consistent spacing using CSS custom properties
- Mobile-first responsive design principles
- Progressive information disclosure

## API Endpoints

### Enhanced Backend Routes
- **Clients**: `/api/clientes` (CRUD) + `/api/clientes/stats` (analytics)
- **Projects**: `/api/proyectos` (CRUD with enhanced status tracking)
- **Resources**: `/api/proyectos/:id/recursos` (file management)
- **Reminders**: `/api/recordatorios` (full CRUD with filtering)
- **Dashboard**: `/api/dashboard` (comprehensive analytics)
- **File Upload**: `/api/proyectos/:id/upload` (multi-file support)

## Key Features

### Analytics & Business Intelligence
- Client portfolio metrics and project value tracking
- Project status breakdown with visual indicators
- Revenue tracking and invoicing insights
- Reminder management with priority systems
- Dashboard with key performance indicators

### File Management
- **Upload Directory**: `/uploads/{projectId}/`
- **File Types**: Images (jpeg, png, gif, webp) and Audio (mp3, wav, webm, ogg)
- **File Size Limit**: 10MB maximum
- **Cleanup**: Automatic file removal on resource/project deletion
- **Security**: Type validation and unique timestamped filenames

### Mobile Optimization
- **Navigation**: Bottom tab bar on mobile, traditional header on desktop
- **Content**: Progressive disclosure of information based on screen size
- **Touch Targets**: Minimum 44px for all interactive elements
- **Performance**: Optimized loading and simplified layouts

## Important Implementation Details

### Client-Centric Workflow
1. Dashboard provides business overview
2. Clients list shows portfolio with project counts and values
3. Client detail view organizes projects by status (kanban on desktop, list on mobile)
4. Project detail maintains full functionality with resource management
5. Reminders integrate across clients and projects

### Mobile-First Responsive Strategy
- **Desktop**: Full kanban, detailed information, side-by-side layouts
- **Mobile**: Simplified lists, stacked layouts, progressive disclosure
- **Breakpoint**: 768px with complete layout transformation

### Error Handling & Data Integrity
- Cascade deletion protection (clients with projects cannot be deleted)
- Proper HTTP status codes and error messages
- File cleanup on database operation failures
- Transaction management for complex operations

## Recently Implemented ✅

### Major Features (Latest Implementation)
1. ✅ **Client-Centric Navigation**: Complete UX restructure around client workflows
2. ✅ **Professional Dark Theme**: Comprehensive design system with CSS custom properties
3. ✅ **Enhanced Project Status**: 5-level status workflow with kanban organization
4. ✅ **Analytics Dashboard**: Business metrics with client portfolio insights
5. ✅ **Reminder System**: Full featured scheduling with priorities and types
6. ✅ **Mobile-First Design**: Complete responsive redesign with progressive disclosure
7. ✅ **Multi-Photo Upload**: Enhanced photo uploader with camera functionality
8. ✅ **Professional Icons**: Complete replacement of emojis with SVG icons
9. ✅ **HTTPS Implementation**: Complete SSL setup for frontend and backend
10. ✅ **Camera/Microphone Access**: Enhanced mobile device compatibility with proper HTTPS support

### Technical Improvements
1. ✅ **Database Schema**: Enhanced with priorities, deadlines, and reminder management
2. ✅ **API Endpoints**: Comprehensive stats and analytics endpoints
3. ✅ **Component Architecture**: Modern React patterns with proper state management
4. ✅ **CSS Architecture**: Professional design system with mobile-first approach
5. ✅ **File Management**: Improved upload handling and cleanup processes
6. ✅ **HTTPS Infrastructure**: Self-signed SSL certificates and secure server configuration
7. ✅ **Dynamic API Routing**: Automatic API URL detection for localhost vs network access
8. ✅ **Audio Transcription Ready**: Backend infrastructure prepared for audio transcription integration

## Current Status & Limitations

### ⚠️ Known Limitations
1. **Audio Transcription**: Audio files stored but not transcribed (database field exists)
2. **Search/Filtering**: Basic functionality, could be enhanced for large datasets
3. **Real-time Updates**: No WebSocket implementation for live collaboration
4. **Offline Support**: No PWA features or offline functionality

### 🚀 Recommended Enhancements
1. **Audio Transcription**: Integrate Whisper.js or cloud transcription services
2. **Advanced Search**: Implement full-text search across projects and clients
3. **Export Features**: Enhanced PDF generation and data export options
4. **User Management**: Multi-user support with authentication and permissions
5. **Analytics**: Advanced reporting and business intelligence features

## Development Notes

### Code Quality Standards
- No TypeScript (Plain JavaScript + JSX)
- ESLint configured for code quality
- Mobile-first CSS approach
- Comprehensive error handling
- Proper component separation and reusability

### Performance Considerations
- Direct API calls (no state management library needed for current scale)
- Efficient file handling with proper cleanup
- Optimized mobile layouts with progressive disclosure
- Lazy loading patterns for better performance

### Security Measures
- File type validation and size limits
- Proper input sanitization and validation
- Secure file path handling
- CORS configuration for development/production

## Project Evolution History

### Initial State (Before Transformation)
The project started as a basic CRUD application for security system installation projects with:
- Simple client and project management
- Basic file upload (single photos)
- PDF generation with image placeholder issues
- Fun/young design with emojis
- Desktop-only interface
- Separate navigation tabs for clients and projects

### Major Transformation Phases

#### Phase 1: Critical Bug Fixes
- **PDF Image Embedding**: Fixed broken image embedding in PDF reports using proper base64 conversion
- **Backend Crashes**: Fixed scope issues in database.js deleteProyecto method
- **Frontend Errors**: Fixed function declaration order in ProyectoDetalle.jsx
- **Multiple Photo Upload**: Enhanced PhotoUploader component for batch uploads
- **Camera Functionality**: Added MediaRecorder API integration for direct photo capture

#### Phase 2: UX/UI Overhaul (Major Transformation)
- **Client-Centric Architecture**: Complete navigation restructure from project-centric to client-centric workflows
- **Professional Dark Theme**: Full design system overhaul with CSS custom properties
- **Enhanced Project Status**: Expanded from 3 to 5 status levels (unstarted → in_progress → completed → delivered → invoiced)
- **Analytics Dashboard**: Comprehensive business metrics and KPI tracking
- **Reminder System**: Full-featured scheduling with priorities, types, and client/project associations

#### Phase 3: Mobile-First Optimization
- **Navigation Overhaul**: Bottom tab navigation on mobile, fixed header
- **Progressive Disclosure**: Smart information hiding on small screens
- **Touch Optimization**: 44px minimum touch targets, larger buttons
- **Layout Simplification**: Kanban → List view transition, reduced cognitive load
- **Content Prioritization**: Show only essential information on mobile

#### Phase 4: HTTPS Implementation & Camera/Microphone Enhancement
- **HTTPS Infrastructure**: Complete SSL implementation for both frontend and backend
- **Self-Signed Certificates**: Development-ready SSL certificates for localhost and network access
- **Camera API Improvements**: Enhanced fallback logic and error handling for mobile camera access
- **Microphone Access**: Fixed getUserMedia compatibility issues for mobile devices
- **API URL Detection**: Dynamic API URL routing based on access method (localhost vs IP)
- **Development Tooling**: Added start-https.sh script for easy HTTPS development setup

### Technical Architecture Evolution

#### Database Schema Evolution
```sql
-- Original Schema (Basic)
clientes: id, nombre, contacto, telefono, email
proyectos: id, cliente_id, nombre, descripcion, estado
recursos: id, proyecto_id, tipo, archivo_path

-- Enhanced Schema (Current)
clientes: + direccion, tipo_industria, notas_generales, fecha_creacion
proyectos: + ubicacion, fecha_inicio, fecha_fin, fecha_limite, prioridad, presupuesto
recordatorios: NEW TABLE with full reminder management
```

#### Component Architecture Evolution
```
Initial: App → [Clientes | Proyectos] → ProyectoDetalle
Current: App → Dashboard → Clientes → ClienteDetalle → ProyectoDetalle
                     ↓
               Recordatorios (standalone)
```

#### API Endpoints Evolution
```
Original: Basic CRUD endpoints
Added: /api/clientes/stats, /api/dashboard, /api/recordatorios
Enhanced: Multi-file upload, comprehensive filtering
```

### Key Decision Points & Rationale

#### 1. Client-Centric vs Project-Centric Navigation
- **Decision**: Moved to client-centric approach
- **Rationale**: Users think in terms of clients first, then their projects
- **Impact**: Improved workflow efficiency and reduced cognitive load

#### 2. Mobile-First vs Desktop-First
- **Decision**: Complete mobile-first redesign
- **Rationale**: User explicitly stated primary mobile usage
- **Impact**: Bottom navigation, progressive disclosure, simplified layouts

#### 3. Professional vs Fun Theme
- **Decision**: Professional dark theme with no emojis
- **Rationale**: Business application needs professional appearance
- **Impact**: Comprehensive design system with CSS custom properties

#### 4. Kanban vs List for Mobile Projects
- **Decision**: Dual approach - Kanban on desktop, List on mobile
- **Rationale**: Kanban too complex for small screens, list more scannable
- **Impact**: Better mobile UX while preserving desktop functionality

### Conversation Context & User Feedback

#### User's Primary Concerns
1. **Mobile Usage**: "it will be mainly accessed on the phone"
2. **Information Overload**: "it could be better organized, its hard to understand all that's on screen"
3. **Professional Appearance**: Wanted to move away from "fun young look"
4. **Client-Centric Workflow**: Needed better client management approach

#### Implementation Decisions Based on Feedback
1. **Mobile-First Design**: Complete responsive overhaul with bottom navigation
2. **Information Simplification**: Progressive disclosure, hiding non-essential info
3. **Professional Theme**: Dark theme with business-appropriate styling
4. **Workflow Optimization**: Client → Projects hierarchy instead of separate tabs

### Current Project State

#### Fully Implemented & Tested
- ✅ Client-centric navigation flow
- ✅ Professional dark theme design system
- ✅ Mobile-first responsive design
- ✅ Enhanced project status workflow (5 levels)
- ✅ Analytics dashboard with business metrics
- ✅ Comprehensive reminder system
- ✅ Multi-photo upload with camera functionality
- ✅ Professional icon system (replaced all emojis)
- ✅ Progressive information disclosure for mobile

#### Architecture Quality Assurance
- ✅ Database integrity with proper constraints and transactions
- ✅ API endpoint consistency with proper error handling
- ✅ Frontend component consistency and reusability
- ✅ CSS architecture with design system approach
- ✅ Mobile responsiveness across all breakpoints
- ✅ File management with proper cleanup and security

#### Known Issues & Limitations
1. **Audio Transcription**: Database field exists but no implementation (Whisper.js recommended)
2. **Search Functionality**: Basic implementation, could be enhanced for large datasets
3. **Real-time Updates**: No WebSocket implementation for live collaboration
4. **Offline Support**: No PWA features or service worker implementation
5. **User Authentication**: Single-user system, no multi-user support

### Future Enhancement Roadmap

#### Priority 1 (High Impact)
1. **Audio Transcription Integration**: Implement Whisper.js or cloud transcription service
2. **Advanced Search**: Full-text search across projects, clients, and notes
3. **Export Enhancements**: Enhanced PDF reports, CSV exports, data backup
4. **Performance Optimization**: Virtual scrolling for large lists, image lazy loading

#### Priority 2 (Medium Impact)
1. **User Management**: Authentication, roles, permissions system
2. **Real-time Collaboration**: WebSocket integration for live updates
3. **Advanced Analytics**: Custom reports, data visualization, business intelligence
4. **Integration APIs**: Connect with accounting systems, CRM tools

#### Priority 3 (Nice to Have)
1. **Offline Support**: PWA implementation with service workers
2. **Mobile App**: React Native version for native mobile experience
3. **Advanced Project Management**: Gantt charts, resource allocation, time tracking
4. **Customer Portal**: Client-facing project status portal

### Technical Debt & Maintenance Notes

#### Code Quality
- No TypeScript (by design choice for simplicity)
- ESLint configured and clean
- Consistent error handling patterns
- Proper component separation and reusability

#### Performance Considerations
- Direct API calls sufficient for current scale
- File upload optimization needed for very large files
- Database queries optimized with proper indexing
- Mobile layout optimizations implemented

#### Security Considerations
- File type validation and size limits in place
- Input sanitization implemented
- Secure file path handling
- CORS properly configured
- No authentication system (single-user by design)

### Development Environment Setup

#### Prerequisites
- Node.js 18+ for backend compatibility
- Modern browser with ES6+ support
- SQLite3 for database
- 10MB+ disk space for file uploads

#### Quick Start Commands
```bash
# Backend setup
cd backend
npm install
npm run dev  # Starts on port 3001

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev  # Starts on port 5173
```

#### Environment Variables (Optional)
- `PORT`: Backend port (default: 3001)
- `NODE_ENV`: Environment setting
- `UPLOAD_DIR`: Custom upload directory

### Debugging & Troubleshooting

#### Common Issues
1. **CORS Errors**: Check backend server is running on port 3001
2. **File Upload Failures**: Verify uploads directory exists and has write permissions
3. **Database Errors**: Check SQLite file permissions and disk space
4. **Mobile Layout Issues**: Test at exactly 768px breakpoint

#### Development Tools
- Browser DevTools for responsive testing
- Network tab for API debugging
- React DevTools for component debugging
- SQLite browser for database inspection

This comprehensive documentation ensures the project can be continued seamlessly by any developer, with full context of decisions made, current state, and future direction.