import { useState, useCallback } from "react";
import Header from "./components/Header";
import GraphCanvas from "./components/GraphCanvas";
import Inspector from "./components/Inspector";
import SearchBar from "./components/SearchBar";
import Legend from "./components/Legend";
import ZoomControls from "./components/ZoomControls";
import StatusBar from "./components/StatusBar";
import Toast from "./components/Toast";
import { useGraph } from "./hooks/useGraph";
import { useSelection } from "./hooks/useSelection";
import { useExport } from "./hooks/useExport";
import { useToast } from "./hooks/useToast";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { Core } from "cytoscape";

type SizeMode = "connections" | "fileSize";

export default function App() {
  const { graph, error } = useGraph();
  const { toast, showToast } = useToast();
  const { selectedFile, deleteSim, handleNodeSelect, handleSimulateDelete, clearSelection } =
    useSelection(graph, (msg) => showToast(msg, "error"));
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 200);
  const [sizeMode, setSizeMode] = useState<SizeMode>("connections");
  const [packageFilter, setPackageFilter] = useState("");
  const [cyRef, setCyRef] = useState<Core | null>(null);

  const { handleExportPNG, handleExportJSON, handleResetView } = useExport(cyRef, (msg) =>
    showToast(msg, "success")
  );

  const handleToggleSizeMode = useCallback(() => {
    setSizeMode((prev) => (prev === "connections" ? "fileSize" : "connections"));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--color-accent-red)] text-lg">
        {error}
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--color-text-secondary)] text-base">
        Loading dependency graph...
      </div>
    );
  }

  return (
    <>
      <Header
        stats={graph.stats}
        isMonorepo={graph.isMonorepo}
        packages={graph.packages}
        sizeMode={sizeMode}
        packageFilter={packageFilter}
        onToggleSizeMode={handleToggleSizeMode}
        onPackageFilter={setPackageFilter}
        onExportJSON={handleExportJSON}
        onExportPNG={handleExportPNG}
        onResetView={handleResetView}
      />

      <div className="relative flex-1">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <GraphCanvas
          graph={graph}
          sizeMode={sizeMode}
          searchQuery={debouncedSearch}
          packageFilter={packageFilter}
          selectedFileId={selectedFile?.id || null}
          deleteSim={deleteSim}
          onNodeSelect={handleNodeSelect}
          onCyInit={setCyRef}
        />

        <Inspector
          file={selectedFile}
          graph={graph}
          deleteSim={deleteSim}
          onClose={clearSelection}
          onSimulateDelete={handleSimulateDelete}
          onNodeNavigate={(id) => {
            handleNodeSelect(id);
            if (cyRef) {
              const node = cyRef.getElementById(id);
              if (node.length) {
                cyRef.animate(
                  { center: { eles: node }, zoom: 2 } as unknown as cytoscape.AnimationOptions,
                  { duration: 300 } as unknown as cytoscape.AnimationOptions
                );
              }
            }
          }}
        />

        <Legend isMonorepo={graph.isMonorepo} />
        <ZoomControls cy={cyRef} />
      </div>

      <StatusBar />
      <Toast toast={toast} />
    </>
  );
}
