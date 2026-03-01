# 🗺️ DepMap — Live Dependency Visualizer

> One command → full visual map of your JavaScript/TypeScript project.

DepMap scans your codebase, builds a dependency graph, detects circular dependencies, and renders an interactive visualization in your browser.

## Quick Start

```bash
# Install globally
npm install -g depmap

# In your project root
depmap start
```

A browser window opens at `http://localhost:3000` with an interactive graph of your entire codebase.

## Commands

### `depmap start [path]`

Scan the project and open an interactive visualization in the browser.

```bash
depmap start                    # Scan current directory
depmap start ./src              # Scan specific folder
depmap start --port 8080        # Custom port
depmap start --exclude "**/*.test.ts" --exclude "**/mocks/**"
```

### `depmap analyze [path]`

Output dependency data as JSON (no server).

```bash
depmap analyze                  # Print JSON to stdout
depmap analyze --output deps.json   # Save to file
```

### `depmap check [path]`

Check for circular dependencies. Exits with code 1 if any are found — perfect for CI/CD.

```bash
depmap check
depmap check ./src --exclude "**/*.test.ts"
```

## Features (MVP)

- **File scanning** — walks your project, respects `.gitignore`
- **Import parsing** — ES6 imports, CommonJS require, dynamic imports, re-exports
- **Interactive graph** — zoom, pan, drag nodes, powered by Cytoscape.js
- **Circular dependency detection** — highlighted in red
- **Click to inspect** — see imports and importedBy for any file
- **File search** — filter graph by filename or path
- **CI-friendly** — `depmap check` exits with code 1 on circular deps

## Supported File Types

`.js` · `.jsx` · `.ts` · `.tsx` · `.mjs` · `.cjs`

## Development

```bash
git clone <repo>
cd depmap
npm install
npm run build
node dist/cli.js start ./src
```

## License

MIT
