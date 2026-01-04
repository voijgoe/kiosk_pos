# Kiosk POS System

## Overview

A modern Point of Sale (POS) system designed for kiosk and restaurant environments. The application allows staff to manage menu items, process customer orders with multiple payment methods (Cash, Card, UPI), view sales reports, and configure shop settings. Built as a full-stack TypeScript application with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with CSS custom properties for theming (dark mode kiosk-optimized)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and interactions
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: REST API with type-safe route definitions in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod for runtime validation, integrated with Drizzle via `drizzle-zod`
- **Storage Pattern**: Repository pattern via `IStorage` interface in `server/storage.ts`

### Data Storage
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` defines all tables (menuItems, orders, orderItems, settings)
- **Migrations**: Drizzle Kit for schema push (`npm run db:push`)

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Route components (Home, POS, MenuManagement, Reports, Settings)
│       ├── components/  # Reusable UI components
│       └── hooks/    # Custom hooks including use-kiosk.ts for API calls
├── server/           # Express backend
│   ├── routes.ts     # API endpoint handlers
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
└── shared/           # Shared types and schemas
    ├── schema.ts     # Drizzle table definitions
    └── routes.ts     # API route type definitions
```

### Key Design Decisions

1. **Shared Types**: The `shared/` directory contains schema definitions used by both frontend and backend, ensuring type safety across the stack.

2. **Type-Safe API Routes**: Route definitions in `shared/routes.ts` include method, path, input schemas, and response schemas, enabling consistent API contracts.

3. **Dark Mode Kiosk UI**: The theme uses high-contrast colors with vibrant orange/red primary colors designed for appetite stimulation and easy visibility in retail environments.

4. **Custom Fonts**: Uses Outfit (display), Inter (body), and JetBrains Mono (monospace) for a modern, readable interface.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, requires `DATABASE_URL` environment variable

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **date-fns**: Date formatting for receipts and reports
- **zod**: Schema validation
- **connect-pg-simple**: PostgreSQL session store (available but sessions not currently implemented)

### UI Component Dependencies
- **@radix-ui/***: Accessible UI primitives (dialog, dropdown, tabs, etc.)
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge / clsx**: CSS class utilities

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **tsx**: TypeScript execution for development server
- **esbuild**: Production bundling for server code