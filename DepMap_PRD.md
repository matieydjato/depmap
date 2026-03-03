# 🗺️ DepMap — Live Dependency Visualizer
### Product Requirements Document · MVP v1.0

---

| Field | Details |
|-------|---------|
| Document Version | 1.0 — MVP |
| Author | Builder |
| Target Users | JavaScript/TypeScript developers & dev teams |
| Distribution | CLI tool (npm package) |
| Status | Pre-build Planning |

---

## 1. Product Overview

**DepMap** is a CLI + browser-based visualization tool that scans JavaScript/TypeScript projects and renders an interactive dependency graph. Developers run `depmap start` and instantly see how their entire codebase connects — files, imports, circular dependencies, and more.

### Problem We're Solving

| Pain Point | Impact |
|------------|--------|
| Developers can't visualize how files connect | Refactoring becomes risky, new devs onboard slowly |
| Circular dependencies are hard to find | Causes build issues, memory leaks, tight coupling |
| No easy way to see "what breaks if I delete this file" | Fear of touching legacy code |
| Bundle size analysis is disconnected from code structure | Hard to optimize imports |
| Understanding large codebases takes weeks | Lost productivity |

### Our Solution

One command → full visual map of your project:
- See every file and its connections
- Instantly spot circular dependencies
- Simulate deletions before making changes
- Understand bundle impact per module

---

## 2. Target Users

### Primary Users

| User Type | Use Case | Pain Level |
|-----------|----------|------------|
| **Senior/Lead Developers** | Refactoring, architecture decisions | 🔴 High |
| **New Team Members** | Onboarding, understanding codebase | 🔴 High |
| **Frontend Engineers** | Bundle optimization, import cleanup | 🟡 Medium |
| **Tech Leads / Architects** | Code reviews, dependency audits | 🟡 Medium |

### Target Projects

- Mid-to-large JavaScript/TypeScript projects (50+ files)
- Monorepos with multiple packages
- React, Vue, Node.js, Next.js codebases
- Teams struggling with "spaghetti" architecture

---

## 3. MVP Feature Scope

### 🟢 MVP — Must Have (v1.0 Launch)

| # | Feature | Description | Priority | Complexity |
|---|---------|-------------|----------|------------|
| 1 | **CLI Scanner** | `depmap start` scans project, finds all imports/exports | 🔴 Critical | Medium |
| 2 | **Dependency Parser** | Parse JS/TS/JSX/TSX files, resolve import paths | 🔴 Critical | Medium |
| 3 | **Browser Visualization** | Open localhost with interactive graph canvas | 🔴 Critical | Medium |
| 4 | **Node Graph Rendering** | Files as nodes, imports as edges, zoom/pan/drag | 🔴 Critical | Medium |
| 5 | **Circular Dependency Detection** | Highlight circular imports in red | 🔴 Critical | Low |
| 6 | **File Search/Filter** | Search for a file, filter by folder/extension | 🟠 High | Low |
| 7 | **Click to Inspect** | Click node → show file path, imports, imported by | 🟠 High | Low |

### 🟡 Phase 2 — Should Have (v1.1)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 8 | **Delete Simulation** | Click file → show all files that would break | 🟡 Medium |
| 9 | **Bundle Weight Display** | Show estimated size per module (via static analysis) | 🟡 Medium |
| 10 | **Export to Image/JSON** | Save graph as PNG or export dependency data as JSON | 🟡 Medium |
| 11 | **Config File Support** | `.depmaprc` to exclude folders, set aliases | 🟡 Medium |
| 12 | **Monorepo Support** | Handle multiple `package.json` in one project | 🟡 Medium |

### 🔵 Phase 3 — Nice to Have (v2.0)

| # | Feature | Description |
|---|---------|-------------|
| 13 | **Git Heatmap** | Color nodes by commit frequency (hot files = red) |
| 14 | **Live Watch Mode** | Auto-update graph when files change |
| 15 | **Dependency Depth Slider** | Show only 1-level, 2-level, or full tree |
| 16 | **Import Cost Integration** | Show actual bundle size impact (like import-cost) |
| 17 | **VS Code Extension** | Visualize directly in editor |
| 18 | **Team Sharing** | Generate shareable link to hosted graph |

---

## 4. Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Tool                            │
│   depmap start [path] [--port 3000] [--exclude node_modules]│
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    File Scanner                              │
│   • Walks directory tree                                     │
│   • Filters by extension (.js, .ts, .jsx, .tsx)             │
│   • Respects .gitignore and config excludes                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Dependency Parser                           │
│   • Uses @babel/parser or ts-morph                          │
│   • Extracts: import/export/require statements              │
│   • Resolves relative paths, aliases, node_modules          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Graph Builder                              │
│   • Nodes = files                                           │
│   • Edges = import relationships                            │
│   • Detects cycles using DFS/Tarjan's algorithm             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Local Web Server                             │
│   • Express or native HTTP server                           │
│   • Serves static React/Svelte/vanilla frontend             │
│   • WebSocket or API for graph data                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser Visualization                           │
│   • Canvas library: D3.js, Cytoscape.js, or vis-network     │
│   • Force-directed graph layout                             │
│   • Zoom, pan, drag, click interactions                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack (Recommended)

| Component | Technology | Why |
|-----------|------------|-----|
| CLI | Node.js + Commander.js | Standard for npm CLI tools |
| Parser | ts-morph or @babel/parser | Handles TS + JS + JSX |
| Path Resolution | enhanced-resolve (webpack's resolver) | Handles aliases, node_modules |
| Cycle Detection | Custom DFS / Tarjan's algorithm | Simple, efficient |
| Web Server | Express.js or Fastify | Lightweight, fast |
| Frontend | React or Svelte | Fast dev, good tooling |
| Graph Rendering | **Cytoscape.js** or vis-network | Built for this use case |
| Styling | Tailwind CSS | Quick, clean UI |

### Data Model

```typescript
// Core types
interface FileNode {
  id: string;           // Absolute path
  name: string;         // Filename
  path: string;         // Relative path from root
  extension: string;    // .ts, .js, .tsx, etc.
  imports: string[];    // Files this file imports
  importedBy: string[]; // Files that import this file
  isCircular: boolean;  // Part of a circular dependency?
  circularWith: string[]; // Which files form the cycle
}

interface DependencyGraph {
  root: string;
  files: FileNode[];
  edges: Array<{ from: string; to: string }>;
  circularDependencies: Array<string[]>; // Groups of files in cycles
  stats: {
    totalFiles: number;
    totalEdges: number;
    circularCount: number;
  };
}
```

---

## 5. User Experience Flow

### Happy Path

```
1. Developer installs: npm install -g depmap
                              │
2. In project root, runs: depmap start
                              │
3. CLI output:
   ┌─────────────────────────────────────────┐
   │ 🗺️  DepMap scanning...                  │
   │ ✓ Found 247 files                       │
   │ ✓ Parsed 892 imports                    │
   │ ⚠ 3 circular dependencies detected      │
   │                                         │
   │ 🌐 Open http://localhost:3000           │
   └─────────────────────────────────────────┘
                              │
4. Browser opens automatically with graph
                              │
5. User explores:
   - Zooms out to see full project
   - Sees red clusters (circular deps)
   - Clicks a file → sees its connections
   - Searches for a specific component
   - Drags nodes to reorganize view
```

### CLI Commands (MVP)

```bash
# Basic usage — scan current directory
depmap start

# Scan specific folder
depmap start ./src

# Custom port
depmap start --port 8080

# Exclude patterns
depmap start --exclude "**/*.test.ts" --exclude "**/mocks/**"

# Output JSON only (no server)
depmap analyze --output ./deps.json

# Just check for circular deps (CI/CD use)
depmap check --circular
# Exit code 1 if circular deps found
```

---

## 6. MVP Success Criteria

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Scan Speed | <5 seconds for 500-file project | Benchmark tests |
| Accuracy | 100% of imports detected | Compare vs manual count |
| Circular Detection | 100% accuracy | Test against known circular deps |
| Browser Performance | Smooth with 1000 nodes | Manual testing |
| Install → First Use | <2 minutes | User testing |

---

## 7. MVP Build Plan

### Week 1: Core Scanner
- [ ] Day 1-2: CLI setup with Commander.js, project structure
- [ ] Day 3-4: File scanner (walk directory, filter extensions, respect gitignore)
- [ ] Day 5: Import parser using ts-morph (extract all imports)

### Week 2: Graph & Detection
- [ ] Day 6-7: Path resolver (relative, aliases, node_modules)
- [ ] Day 8: Graph builder (nodes + edges data structure)
- [ ] Day 9: Circular dependency detection algorithm
- [ ] Day 10: JSON output, basic stats

### Week 3: Visualization
- [ ] Day 11-12: Web server + static frontend scaffold
- [ ] Day 13-14: Cytoscape.js graph rendering
- [ ] Day 15: Zoom, pan, drag interactions

### Week 4: Polish & Launch
- [ ] Day 16: Click-to-inspect panel
- [ ] Day 17: Search/filter functionality
- [ ] Day 18: Circular deps highlighted in red
- [ ] Day 19: CLI polish, help text, error handling
- [ ] Day 20: README, demo GIF, npm publish
- [ ] Day 21: 🚀 **MVP LAUNCH**

---

## 8. Competitive Analysis

| Tool | Pros | Cons | DepMap Advantage |
|------|------|------|------------------|
| **Madge** | CLI circular detection | No visualization (just text) | Full interactive graph |
| **dependency-cruiser** | Powerful rules, CI integration | Complex config, steep learning curve | Zero-config, instant visual |
| **Webpack Bundle Analyzer** | Great for bundle size | Only post-build, no code relationships | Pre-build, sees actual file structure |
| **Code Maat** | Git analysis, coupling | Language-agnostic (less precise for JS) | JS/TS-native, import-level detail |

### Our Differentiator
> **"One command, zero config, instant visualization"**
> `npx depmap` and you see your entire codebase in 5 seconds.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Parser can't handle all import styles | 🟡 Medium | 🔴 High | Use battle-tested ts-morph; add fallback patterns |
| Large projects crash browser | 🟡 Medium | 🟡 Medium | Virtual rendering, cluster very large graphs |
| Path aliases not resolved | 🟡 Medium | 🟡 Medium | Read tsconfig.json/jsconfig.json for aliases |
| Monorepos not supported | 🟢 Low | 🟡 Medium | Defer to Phase 2; document limitation |

---

## 10. Future Monetization (Optional)

### Open Core Model
| Tier | Price | Features |
|------|-------|----------|
| **Free / Open Source** | $0 | Full CLI + local visualization |
| **Pro** | $10/mo | Export reports, CI integration, Slack alerts |
| **Team** | $50/mo | Shared hosted graphs, team annotations |

### Alternative: Sponsorware
- Release as open-source
- Sponsor tiers for priority features
- GitHub Sponsors integration

---

## 11. Immediate Next Steps

1. **Today:** Create GitHub repo, initialize npm package
2. **Day 1:** Build CLI skeleton with `commander` 
3. **Day 2:** Implement file scanner with glob patterns
4. **Day 3:** Parse first TypeScript file and extract imports
5. **Day 7:** Working circular dependency detection
6. **Day 14:** Browser shows graph for first time
7. **Day 21:** Publish v0.1.0 to npm

---

## Appendix: MVP Feature Checklist

### Must ship for v1.0:
- [ ] `depmap start` command works
- [ ] Scans .js, .ts, .jsx, .tsx files
- [ ] Excludes node_modules by default
- [ ] Parses ES6 imports and CommonJS require
- [ ] Resolves relative paths correctly
- [ ] Builds graph data structure
- [ ] Detects circular dependencies
- [ ] Starts local web server
- [ ] Renders interactive graph in browser
- [ ] Nodes are draggable
- [ ] Zoom in/out works
- [ ] Circular deps shown in red
- [ ] Click node shows details
- [ ] Search by filename works
- [ ] README with clear instructions
- [ ] Published to npm

---

> **Ship fast, iterate faster.** The MVP is about proving the core value: *"See your entire codebase in one picture."*
