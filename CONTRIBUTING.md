# Contributing to DepMap

Thanks for your interest in contributing! This guide will get you up and running.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- Git

## Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-org>/depmap.git
cd depmap

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Build the backend
npm run build:backend

# Start in dev mode (pick one)
npm run dev              # Backend TypeScript watcher
npm run dev:frontend     # Vite dev server for the UI
```

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build backend + frontend |
| `npm run build:backend` | Compile TypeScript to `dist/` |
| `npm run build:frontend` | Build React app via Vite |
| `npm run dev` | Watch-mode backend compilation |
| `npm run dev:frontend` | Vite dev server with HMR |
| `npm test` | Run all Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Tests with v8 coverage report |
| `npm run lint` | Lint backend + frontend |
| `npm run lint:fix` | Lint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting (CI-friendly) |

## Development Workflow

1. **Create a branch** off `main` for your work.
2. **Write tests first** (or alongside) — tests live in `tests/` and use fixtures under `tests/fixtures/`.
3. **Run lint + tests** before committing:
   ```bash
   npm run lint
   npm test
   ```
4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `refactor:` — code restructure without behavior change
   - `test:` — adding/updating tests
   - `docs:` — documentation only
   - `ci:` — CI/CD changes
   - `chore:` — tooling, dependency bumps
5. **Open a PR** against `main`. CI will run lint, tests, and build automatically.

## Code Style

- **TypeScript strict mode** — no `any` unless unavoidable (suppress with eslint-disable + justification).
- **Async I/O** — use `fs/promises`, never sync `fs` calls.
- **Structured logging** — use the `logger` singleton from `src/logger.ts`, not `console.log`.
- **Prettier** formats all `.ts` / `.tsx` files. Config lives in `.prettierrc`.
- **ESLint** catches common issues. Configs: `eslint.config.mjs` (backend) and `frontend/eslint.config.js`.

## Adding a New Backend Module

1. Create `src/<module>.ts` with exported async functions.
2. Add types to `src/types.ts` if they're shared.
3. Write tests in `tests/<module>.test.ts` with fixture data.
4. Wire into the pipeline in `src/index.ts` if needed.

## Adding a Frontend Component

1. Create `frontend/src/components/<Component>.tsx`.
2. Use Tailwind CSS utility classes for styling.
3. Extract reusable logic into hooks under `frontend/src/hooks/`.
4. Shared constants go in `frontend/src/constants.ts`.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a high-level overview of the codebase, data flow, and design decisions.
