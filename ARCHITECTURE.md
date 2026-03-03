# Architecture

> High-level overview of the DepMap codebase for new contributors.

## Project Layout

```
depmap/
├── src/                   # Backend (Node.js CLI + Express API)
│   ├── cli.ts             # Commander entry-point: depmap start|analyze|check
│   ├── index.ts           # Public API — analyzeDependencies() pipeline
│   ├── config.ts          # Loads .depmaprc / depmap.config.* config files
│   ├── scanner.ts         # Walks directory tree, applies gitignore + excludes
│   ├── parser.ts          # Uses ts-morph to extract imports from each file
│   ├── graph.ts           # Builds the DependencyGraph + detects circular deps
│   ├── analyzer.ts        # Calculates per-file sizes (formatBytes, analyzeFileSizes)
│   ├── monorepo.ts        # Detects npm/yarn/pnpm workspaces
│   ├── server.ts          # Express dev-server: serves frontend + REST API
│   ├── logger.ts          # Structured leveled logger (debug/info/warn/error)
│   ├── types.ts           # Shared TypeScript interfaces (DependencyGraph, FileNode, …)
│   └── commands/          # CLI sub-commands (start, analyze, check)
├── frontend/              # React + Vite SPA
│   └── src/
│       ├── App.tsx        # Root component — orchestrates hooks + layout
│       ├── main.tsx       # Vite entry — renders <App />
│       ├── api.ts         # Fetch wrappers for /api/graph, /api/simulate-delete
│       ├── constants.ts   # Shared constants (PACKAGE_COLORS)
│       ├── types.ts       # Frontend-specific type definitions
│       ├── hooks/         # Custom React hooks (useGraph, useSelection, useExport, useToast)
│       └── components/    # UI components (GraphCanvas, Inspector, Toolbar, …)
├── tests/                 # Vitest unit tests + fixtures
├── .github/workflows/     # GitHub Actions CI
├── eslint.config.mjs      # ESLint flat config (backend)
├── vitest.config.ts       # Vitest configuration
└── .prettierrc            # Prettier settings
```

## Data Flow

```
CLI args + config
       │
       ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ scanner  │──▶ │  parser  │──▶ │  graph   │──▶ │  server  │
  │          │    │          │    │          │    │  (REST)  │
  │ Walk FS  │    │ ts-morph │    │ Build    │    │          │
  │ Apply    │    │ Extract  │    │ nodes &  │    │ /api/    │
  │ excludes │    │ imports  │    │ edges,   │    │ graph    │
  └──────────┘    └──────────┘    │ detect   │    │ simulate │
                                  │ cycles   │    └────┬─────┘
                                  └──────────┘         │
                                       │               ▼
                                       │         ┌──────────┐
                                       └────────▶│ React UI │
                                  (analyzer)      │ Cytoscape│
                                  file sizes      └──────────┘
```

1. **Scanner** — recursively walks the project directory, respects `.gitignore` and user-configured exclude patterns.
2. **Parser** — reads each discovered file with `ts-morph`, resolves import specifiers to relative paths (handling aliases, index files, extension inference).
3. **Graph** — builds a `DependencyGraph` from parsed imports: nodes (files), edges (dependencies), `importedBy` reverse map, circular dependency detection via DFS.
4. **Analyzer** — computes raw file sizes in parallel (`fs.stat`), attaches `sizeBytes` / `sizeFormatted` to each node.
5. **Server** — Express dev-server that serves the built React frontend and exposes two API endpoints:
   - `GET /api/graph` — returns the full graph JSON
   - `GET /api/simulate-delete/:fileId` — returns orphaned/affected files if a file were removed
6. **React UI** — fetches the graph, renders it as an interactive Cytoscape.js canvas with search, filtering, export, and delete-simulation overlays.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **ts-morph** for parsing | Robust AST-based import resolution; handles aliases, re-exports |
| **Express v5** | Stable, well-known HTTP layer; async route handler support |
| **Cytoscape.js** | Mature graph visualization library with layout algorithms |
| **Tailwind CSS v4** | Utility-first styling, no CSS-module cascade issues |
| **Async I/O throughout** | Non-blocking file reads; enables parallel `Promise.all` patterns |
| **Map index for simulate-delete** | O(1) file lookups instead of O(n) array scans |
| **Structured logger** | Configurable verbosity without scattering `console.log` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/graph` | Full dependency graph (nodes, edges, stats, circular deps) |
| `GET` | `/api/simulate-delete/:fileId` | Simulates deleting a file — returns `directlyAffected`, `transitivelyAffected`, `brokenImports`, `totalAffected` (404 if file not found) |
| `GET` | `/api/export/json` | Downloads the graph as a JSON file attachment |

Both endpoints return JSON. The server binds to `127.0.0.1` only for security.

## Testing

Tests use **Vitest** with fixture projects under `tests/fixtures/`. Run:

```bash
npm test              # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With v8 coverage
```
