# Replit.md - BSV iPhone Miner

## Overview

This is a mobile-first BSV (Bitcoin SV) mining simulation application designed specifically for iPhone and mobile devices. Built with a modern TypeScript stack, the application provides a comprehensive mining dashboard optimized for touch interfaces with real-time statistics, WebSocket connectivity, and a responsive mobile-first user interface. It simulates cryptocurrency mining operations with features like hashrate monitoring, pool connections, worker management, and earnings tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme optimized for mining aesthetics
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for live mining updates
- **Development**: Hot module replacement via Vite middleware integration

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for runtime type validation
- **Session Storage**: PostgreSQL-based session storage

## Key Components

### Mining Dashboard Components
- **MiningStats**: Real-time hashrate, shares, and earnings display
- **PoolStatus**: Connection status and worker management
- **MiningControls**: Start/stop mining with intensity controls
- **HashrateChart**: Historical performance visualization
- **RecentActivity**: Live activity feed with WebSocket updates
- **WithdrawalModal**: BSV withdrawal interface

### Real-time Features
- **WebSocket Integration**: Live mining statistics updates
- **Mining Worker**: Browser-based SHA-256 mining simulation
- **Activity Streaming**: Real-time mining event notifications

### UI/UX Design
- **Mobile-First Design**: iPhone-optimized layout prioritizing touch interaction
- **Dark Theme**: Mining-focused color scheme with BSV yellow logo and accents
- **Responsive Cards**: Compact stat cards with appropriate mobile sizing
- **Simplified Navigation**: Hidden sidebar on mobile with essential info in header
- **Touch-Friendly Controls**: Large buttons and touch targets for mobile devices
- **Loading States**: Skeleton screens and loading indicators
- **Toast Notifications**: User feedback for mining operations

## Data Flow

### Mining Operation Flow
1. User initiates mining through MiningControls component
2. Backend validates pool settings and starts mining simulation
3. WebSocket connection established for real-time updates
4. Mining statistics updated every 5 seconds via API polling
5. Activity events broadcast to all connected clients
6. Hashrate and earnings calculations performed server-side

### Database Schema
- **Users**: Authentication and user management
- **MiningStats**: Real-time mining performance metrics
- **MiningActivity**: Historical mining events and logs
- **PoolSettings**: Mining pool configuration per user

### API Structure
- **GET /api/mining/stats/:userId**: Fetch current mining statistics
- **POST /api/mining/stats/:userId**: Update mining statistics
- **GET /api/mining/activity/:userId**: Fetch recent mining activity
- **POST /api/mining/start/:userId**: Start mining operations
- **POST /api/mining/stop/:userId**: Stop mining operations
- **WebSocket /ws**: Real-time mining updates and notifications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **ws**: WebSocket server implementation

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database schema management and migrations

### Mining Simulation
- **Custom SHA-256 Implementation**: Browser-based mining simulation
- **WebAssembly Ready**: Architecture supports WASM optimization
- **Crypto API Integration**: Uses SubtleCrypto for hash calculations

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Migrations**: Drizzle Kit handles schema updates
4. **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Development**: Vite dev server with HMR and Express API
- **Production**: Express serves built React app and API endpoints
- **Database**: Neon serverless PostgreSQL with connection pooling

### Performance Optimizations
- **Query Caching**: TanStack Query with stale-while-revalidate strategy
- **WebSocket Efficiency**: Selective broadcasting of mining updates
- **Bundle Splitting**: Vite automatic code splitting for optimal loading
- **CSS Optimization**: Tailwind purging and PostCSS processing

### Security Considerations
- **Session Management**: PostgreSQL-based session storage
- **Input Validation**: Zod schemas for all API endpoints
- **CORS Configuration**: Controlled cross-origin resource sharing
- **WebSocket Authentication**: User-based connection validation

The application is designed to be easily deployable on platforms like Replit, with automatic dependency installation and database provisioning through environment variables.