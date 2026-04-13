# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack web application template with:
- **Frontend**: Nuxt 4 (Vue 3) with shadcn-vue UI components and Tailwind CSS v4
- **Backend**: AdonisJS 6 API server with PostgreSQL database
- **Infrastructure**: Docker Compose orchestration

## Development Commands

### Backend (AdonisJS)

```bash
cd backend

# Development server with hot reload
npm run dev

# Run tests (Japa test runner)
npm test

# Run specific test suite
node ace test -- --files=tests/unit/**
node ace test -- --files=tests/functional/**

# Build for production
npm run build

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Type checking
npm run typecheck

# Database migrations
node ace migration:run
node ace migration:rollback
node ace migration:fresh

# Generate migration
node ace make:migration <name>

# Generate model
node ace make:model <name>

# Generate controller
node ace make:controller <name>

# Generate middleware
node ace make:middleware <name>
```

### Frontend (Nuxt)

```bash
cd frontend

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate

# Add shadcn-vue components
npx shadcn-vue@latest add <component-name>
```

### Docker Compose

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Architecture

### Backend (AdonisJS)

**Framework**: AdonisJS 6 with TypeScript

**Key Features**:
- PostgreSQL database via Lucid ORM
- Session-based authentication (@adonisjs/auth)
- CORS support
- VineJS validation
- Cookie session storage

**Directory Structure**:
- `app/models/` - Lucid ORM models
- `app/controllers/` - HTTP controllers
- `app/middleware/` - HTTP middleware
- `app/exceptions/` - Exception handlers
- `app/validators/` - VineJS validators
- `database/migrations/` - Database migrations
- `start/routes.ts` - Route definitions
- `start/kernel.ts` - Middleware registration
- `config/` - Configuration files
- `tests/` - Test suites (unit and functional)

**Import Aliases** (defined in package.json):
- `#controllers/*` → `./app/controllers/*.js`
- `#models/*` → `./app/models/*.js`
- `#middleware/*` → `./app/middleware/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#services/*` → `./app/services/*.js`
- `#config/*` → `./config/*.js`
- `#database/*` → `./database/*.js`
- `#start/*` → `./start/*.js`
- `#tests/*` → `./tests/*.js`

**Middleware Stack**:
- Server middleware (runs on all requests):
  - `container_bindings_middleware` - Request container bindings
  - `force_json_response_middleware` - Forces JSON responses for all requests
  - `@adonisjs/cors/cors_middleware` - CORS handling

- Router middleware (runs on routes):
  - `@adonisjs/core/bodyparser_middleware` - Request body parsing
  - `@adonisjs/session/session_middleware` - Session handling
  - `@adonisjs/auth/initialize_auth_middleware` - Auth initialization

- Named middleware (apply to specific routes):
  - `auth` - Requires authenticated user
  - `guest` - Requires unauthenticated user
  - `silent_auth` - Optional authentication

**Testing**:
- Framework: Japa
- Two test suites:
  - `unit` - Unit tests (2s timeout) in `tests/unit/**/*.spec.ts`
  - `functional` - API tests (30s timeout) in `tests/functional/**/*.spec.ts`
- API client and assertion plugins included

**Hot Module Replacement**:
- Controllers and middleware have HMR enabled (hot-hook)
- Changes auto-reload without server restart

### Frontend (Nuxt)

**Framework**: Nuxt 4 (Vue 3)

**UI System**:
- shadcn-vue components with "new-york" style
- No component prefix (use components directly)
- Components in `app/components/ui/`
- Tailwind CSS v4 with OKLCH color space
- Dark mode support via `.dark` class
- Icons: Lucide and Unicons via @nuxt/icon

**Directory Structure**:
- `app/app.vue` - Root component
- `app/pages/` - File-based routing
- `app/layouts/` - Layout components
- `app/components/ui/` - shadcn-vue UI components
- `app/lib/utils.ts` - Utility functions (cn() helper)
- `app/assets/css/main.css` - Global styles and theme variables
- `app/plugins/` - Nuxt plugins
- `app/middleware/` - Route middleware

**Path Aliases**:
- `@/components` - Components directory
- `@/lib` - Utilities
- `@/components/ui` - UI components
- `@/composables` - Vue composables

**API Integration**:
- Routes starting with `/api/v1/**` proxy to backend
- Backend URL from `.env` file: `API_URL` (default: http://localhost:3333)
- Uses dotenv to load environment variables

**Nuxt Modules**:
- `@nuxt/eslint` - ESLint integration
- `@nuxt/ui` - Nuxt UI utilities
- `shadcn-nuxt` - shadcn-vue for Nuxt
- `@nuxt/icon` - Iconify icon system

### Database

**System**: PostgreSQL 15 (Alpine)

**Connection**:
- Default connection: `postgres`
- Migrations in `backend/database/migrations/`
- Natural sort for migration order

**Environment Variables** (backend):
- `DB_HOST` - Database host (default: 127.0.0.1, docker: postgres)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: root)
- `DB_DATABASE` - Database name (default: app)

### Docker Setup

Three services:
1. **postgres** - PostgreSQL 15 database on port 5432
2. **backend** - AdonisJS API on port 3333
3. **frontend** - Nuxt app on port 3000

**Important**: Backend waits for postgres health check before starting.

## Environment Configuration

### Backend `.env`

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=<generate with: node ace generate:key>
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=app

SESSION_DRIVER=cookie
```

### Frontend `.env`

```env
API_URL=http://localhost:3333
```

For Docker, set `API_URL=http://backend:3333` to use service name.

## Code Style

### Backend
- Uses `@adonisjs/prettier-config` for formatting
- ESLint config: `@adonisjs/eslint-config`
- TypeScript strict mode

### Frontend
- Nuxt ESLint module
- Tailwind CSS v4 conventions
- Use `cn()` utility for conditional classes

## Key Patterns

### Backend Routing
Routes defined in `start/routes.ts`:
```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => ({ hello: 'world' }))

// With middleware
router.post('/login', 'AuthController.login').use(middleware.guest())
```

### Frontend API Calls
Use `$fetch` or `useFetch` composable with `/api/v1` prefix:
```ts
// Will proxy to backend
const data = await $fetch('/api/v1/users')
```

### UI Components
Use shadcn-vue components without prefix:
```vue
<template>
  <Button variant="outline">Click me</Button>
</template>
```

### Force JSON Responses
The backend automatically forces all responses to JSON format via `force_json_response_middleware`. This ensures validation errors, auth errors, and framework responses return JSON instead of HTML.

## Authentication System

### Backend Authentication

**Session Guard Configuration** (`config/auth.ts`):
- Uses `sessionGuard` with `sessionUserProvider`
- User model: `User` with AuthFinder mixin
- Password hashing: scrypt (via `@adonisjs/core/services/hash`)
- Remember me tokens: disabled by default

**User Model** (`app/models/user.ts`):
- Includes `withAuthFinder` mixin for credential verification
- Fields: `id`, `fullName`, `email`, `password`, `createdAt`, `updatedAt`
- Password field: serialized as null (never sent to client)
- UID field: `email`

**Auth Routes** (`/api/v1/auth`):
- `POST /register` - Create new user account (guest only)
- `POST /login` - Login with email/password (guest only)
- `POST /logout` - Logout current user (auth required)
- `GET /me` - Get current user info (auth required)

**Validators** (`app/validators/auth.ts`):
- `registerValidator` - Validates email uniqueness, password min 8 chars
- `loginValidator` - Validates email and password format

**Auth Controller** (`app/controllers/auth_controller.ts`):
- All methods return JSON responses with user object
- User object includes: `id`, `email`, `fullName` (never includes password)
- Uses `User.verifyCredentials()` for login
- Uses `auth.use('web').login(user)` to create session

### Frontend Authentication

**State Management** (`app/stores/auth.ts`):
- Pinia store with user state
- Actions: `login`, `register`, `logout`, `fetchUser`
- Getters: `currentUser`
- State: `user`, `isAuthenticated`, `isLoading`

**Composable** (`app/composables/useAuth.ts`):
- Wrapper around auth store
- Provides: `user`, `isAuthenticated`, `isLoading`
- Methods: `login()`, `register()`, `logout()`, `fetchUser()`, `requireAuth()`, `requireGuest()`
- Auto-redirects on logout

**Middleware**:
- `auth` - Requires authenticated user, redirects to `/login`
- `guest` - Requires unauthenticated user, redirects to `/`

**Pages**:
- `/login` - Login form (guest middleware)
- `/register` - Registration form (guest middleware)
- `/` - Home page with conditional rendering

### Authentication Flow

1. **Registration**:
   - User submits form → Frontend validates → POST `/api/v1/auth/register`
   - Backend validates with VineJS → Creates user → Auto-login → Returns user object
   - Frontend stores user in Pinia → Redirects to home

2. **Login**:
   - User submits form → Frontend validates → POST `/api/v1/auth/login`
   - Backend verifies credentials → Creates session → Returns user object
   - Frontend stores user in Pinia → Redirects to home

3. **Logout**:
   - User clicks logout → POST `/api/v1/auth/logout`
   - Backend destroys session → Frontend clears Pinia state → Redirects to login

4. **Session Persistence**:
   - On page load, frontend calls `fetchUser()` if not authenticated
   - GET `/api/v1/auth/me` returns user if session exists
   - If session expired, user redirected to login

### Using Authentication in Pages

```vue
<script setup lang="ts">
// Require authentication
definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()
</script>

<template>
  <div>
    <p>Welcome {{ user?.email }}</p>
    <button @click="logout">Logout</button>
  </div>
</template>
```

### Using Authentication in API Routes

```ts
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

// Protected route
router
  .get('/dashboard', async ({ auth }) => {
    const user = auth.getUserOrFail()
    return { user }
  })
  .use(middleware.auth())

// Guest route
router
  .post('/login', [AuthController, 'login'])
  .use(middleware.guest())
```

## Page Transitions

The application uses Nuxt's built-in page transition system for smooth navigation between pages.

### Available Transitions

Four transition styles are pre-configured in `app.vue`:

1. **page** (default) - Horizontal slide with fade
   - Enter: slides in from right, fades in
   - Leave: slides out to left, fades out
   - Duration: 300ms

2. **slide** - Vertical slide with fade
   - Enter: slides in from bottom, fades in
   - Leave: slides out to top, fades out
   - Duration: 300ms with cubic-bezier easing

3. **fade** - Simple opacity transition
   - Duration: 200ms
   - Best for modal-like pages (login, register)

4. **scale** - Scale with fade
   - Enter: scales from 95% to 100%
   - Leave: scales from 100% to 105%
   - Duration: 300ms with cubic-bezier easing

### Using Transitions

Define transitions per-page using `definePageMeta()`:

```vue
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'page',      // Transition name (page, slide, fade, scale)
    mode: 'out-in'     // Wait for old page to leave before entering new page
  }
})
</script>
```

### Examples

```vue
// Index page - horizontal slide
definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})

// Login/Register - fade
definePageMeta({
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
})

// Dashboard - default page transition
definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
```

### Loading Indicators

The app includes two loading indicators:

1. **NuxtLoadingIndicator** - Blue progress bar at top of page
   - Appears automatically during page transitions
   - Color: `#3b82f6` (blue-500)

2. **LoadingScreen** - Full-page loader
   - Shows during initial app hydration
   - Displays "Initializing..." message
   - Fades out when app is ready

### Transition Mode

The `mode: 'out-in'` ensures:
- Old page completes exit animation
- Then new page enters
- Prevents content overlap during transition
- Creates smoother visual experience

## Important Notes

- Backend uses session-based auth with cookies, not JWT
- Sessions are stored in cookies (SESSION_DRIVER=cookie)
- All backend responses are JSON (forced by middleware)
- Frontend proxies `/api/v1/**` to backend API
- User passwords are hashed with scrypt and never sent to client
- CORS is configured to allow credentials (required for session cookies)
- Use AdonisJS ace commands (not npm scripts) for most backend tasks
- shadcn-vue components can be added on-demand with the CLI
- Icons use Iconify collections (lucide, uil) via @nuxt/icon
