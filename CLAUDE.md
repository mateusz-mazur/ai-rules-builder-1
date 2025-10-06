# CLAUDE.md

This file provides guidance to AI Agents when working with code in this repository.

## Common Development Commands

### Development Server
- `npm run dev` - Start development server on port 3000 (local mode)
- `npm run dev:e2e` - Start development server in integration mode for E2E testing

### Building and Deployment
- `npm run build` - Build the Astro application for production
- `npm run preview` - Preview the built application locally

### Code Quality
- `npm run lint` - Lint and fix TypeScript/Astro files
- `npm run lint:check` - Check linting without fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without fixing

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:codegen` - Generate test code with Playwright

### Special Scripts
- `npm run generate-rules` - Generate rules JSON from TypeScript definitions

## Architecture Overview

### Technology Stack
- **Framework**: Astro 5 with React 18.3 integration
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand for client-side state
- **Database**: Supabase (PostgreSQL with real-time features)
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Authentication**: Supabase Auth with email/password and password reset

### Project Structure

#### Core Application (`src/`)
- `pages/` - Astro pages with API routes under `api/`
- `components/` - React components organized by feature
- `data/` - Static data including AI rules definitions in `rules/` subdirectory
- `services/` - Business logic services, notably `RulesBuilderService`
- `store/` - Zustand stores for state management
- `hooks/` - Custom React hooks

#### Key Components Architecture
- **Rules System**: Rules are organized by technology stacks (frontend, backend, database, etc.) and stored in `src/data/rules/`
- **Rules Builder Service**: Core service in `src/services/rules-builder/` that generates markdown content using strategy pattern (single-file vs multi-file output)
- **Collections System**: User can save and manage rule collections via `collectionsStore`
- **Feature Flags**: Environment-based feature toggling system in `src/features/featureFlags.ts`

#### MCP Server (`mcp-server/`)
Standalone Cloudflare Worker implementing Model Context Protocol for programmatic access to AI rules. Provides tools:
- `listAvailableRules` - Get available rule categories
- `getRuleContent` - Fetch specific rule content

### State Management Pattern
The application uses Zustand with multiple specialized stores:
- `techStackStore` - Manages selected libraries and tech stack
- `collectionsStore` - Handles saved rule collections with dirty state tracking
- `authStore` - Authentication state management
- `projectStore` - Project metadata (name, description)

### Environment Configuration
- Uses Astro's environment schema for type-safe environment variables
- Supports three environments: `local`, `integration`, `prod`
- Feature flags control functionality per environment
- Requires `.env.local` with Supabase credentials and Cloudflare Turnstile keys

### Database Integration
- Supabase integration with TypeScript types in `src/db/database.types.ts`
- Collections are stored in Supabase with user association
- Real-time capabilities available but not currently utilized

### Testing Strategy
- Unit tests use Vitest with React Testing Library and JSDOM
- E2E tests use Playwright with Page Object Model pattern
- Test files located in `tests/` for unit tests and `e2e/` for E2E tests
- All tests run in CI/CD pipeline

### Rules Content System
Rules are defined as TypeScript objects and exported from category-specific files in `src/data/rules/`. The system supports:
- Categorization by technology layers (frontend, backend, database, etc.)
- Library-specific rules with placeholder replacement
- Multi-file vs single-file output strategies
- Markdown generation with project context

### Development Workflow
1. Rules contributions go in `src/data/rules/` with corresponding translations in `src/i18n/translations.ts`
2. Use feature flags to control new functionality rollout
3. Collections allow users to save and share rule combinations
4. The MCP server enables programmatic access for AI assistants

## Framework-Specific Guidelines

### Astro
- Use content collections with type safety for blog posts, documentation, etc.
- Leverage Server Endpoints for API routes
- Use POST, GET - uppercase format for endpoint handlers
- Use `export const prerender = false` for API routes
- Use zod for input validation in API routes
- Implement or reuse middleware for request/response modification
- Use image optimization with the Astro Image integration
- Implement hybrid rendering with server-side rendering where needed
- Use Astro.cookies for server-side cookie management
- Leverage import.meta.env for environment variables
- Always check if you're asked to create public or private pages (if public, update `src/middleware/index.ts`) to allow non-auth browsing

### React Development
- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Prefer relying on Tailwind media queries instead of manual style recalculations
- If there's a need to attach React components to Astro pages and make them browser-first (i.e. using window), use client:only directive to make the component exclusively run on the client
- Use Tailwind responsive variants (sm:, md:, lg:, etc.) for adaptive designs - under no circumstances calculate this manually

### Supabase Authentication
- Use `@supabase/ssr` package (NOT auth-helpers)
- Use ONLY `getAll` and `setAll` for cookie management
- NEVER use individual `get`, `set`, or `remove` cookie methods
- Implement proper session management with middleware based on JWT (Supabase Auth)
- Never expose Supabase integration & keys in client-side components
- Validate all user input server-side

### Testing Guidelines

#### Unit Testing (Vitest)
- Leverage the `vi` object for test doubles - Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions, and `vi.stubGlobal()` for global mocks
- Master `vi.mock()` factory patterns - Place mock factory functions at the top level of your test file
- Create setup files for reusable configuration in `tests/setup/`
- Use inline snapshots for readable assertions with `expect(value).toMatchInlineSnapshot()`
- Configure jsdom for DOM testing - Set `environment: 'jsdom'` in your configuration for frontend component tests
- Follow 'Arrange', 'Act', 'Assert' approach to test structure for simplicity and readability

#### E2E Testing (Playwright)
- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests in `e2e/page-objects/`
- Use locators for resilient element selection
- Leverage API testing for backend validation
- Implement visual comparison with `expect(page).toHaveScreenshot()`
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Follow 'Arrange', 'Act', 'Assert' approach to test structure for simplicity and readability

## Contributing Rules

When adding new AI rules to the system:

1. Add rule definitions to appropriate files in `src/data/rules/` (frontend.ts, backend.ts, etc.)
2. Add translations for new rules in `src/i18n/translations.ts` - **this is required** or unit tests will fail
3. Follow the existing rule structure with proper categorization by Layer, Stack, and Library
4. Use placeholder syntax `{{placeholder_text}}` for project-specific values
5. Be specific and actionable - provide clear guidance that can be immediately applied
6. Match the style and structure of existing rules
7. Focus on best practices that represent industry standards
