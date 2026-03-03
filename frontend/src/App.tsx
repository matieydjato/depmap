import { useState, useEffect, useCallback } from 'react';
import type { DependencyGraph, FileNode, DeleteSimResult } from './types';
import { fetchGraph, fetchDeleteSim } from './api';
import Header from './components/Header';
import GraphCanvas from './components/GraphCanvas';
import Inspector from './components/Inspector';
import SearchBar from './components/SearchBar';
import Legend from './components/Legend';
import Toast from './components/Toast';
import type { Core } from 'cytoscape';

type SizeMode = 'connections' | 'fileSize';

export default function App() {
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [deleteSim, setDeleteSim] = useState<DeleteSimResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeMode, setSizeMode] = useState<SizeMode>('connections');
  const [packageFilter, setPackageFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [cyRef, setCyRef] = useState<Core | null>(null);

  useEffect(() => {
    fetchGraph()
      .then(setGraph)
      .catch(() => setError('Failed to load dependency data'));
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleNodeSelect = useCallback((fileId: string | null) => {
    if (!fileId || !graph) {
      setSelectedFile(null);
      setDeleteSim(null);
      return;
    }
    const file = graph.files.find(f => f.id === fileId) || null;
    setSelectedFile(file);
    setDeleteSim(null);
  }, [graph]);

  const handleSimulateDelete = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const result = await fetchDeleteSim(selectedFile.id);
      setDeleteSim(result);
    } catch {
      showToast('Failed to simulate deletion', 'error');
    }
  }, [selectedFile, showToast]);

  const handleExportPNG = useCallback(() => {
    if (!cyRef) return;
    const png = cyRef.png({ output: 'blob', bg: '#0d1117', full: true, scale: 2 });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = 'depmap-graph.png';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('PNG exported!', 'success');
  }, [cyRef, showToast]);

  const handleExportJSON = useCallback(() => {
    window.open('/api/export/json', '_blank');
    showToast('JSON exported!', 'success');
  }, [showToast]);

  const handleResetView = useCallback(() => {
    if (!cyRef) return;
    cyRef.elements().removeClass('dimmed highlighted affected-direct affected-transitive deleted-sim');
    cyRef.animate({ fit: { padding: 40 } } as unknown as cytoscape.AnimationOptions, {
      duration: 400,
    } as unknown as cytoscape.AnimationOptions);
  }, [cyRef]);

  const handleToggleSizeMode = useCallback(() => {
    setSizeMode(prev => prev === 'connections' ? 'fileSize' : 'connections');
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
          searchQuery={searchQuery}
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
          onClose={() => { setSelectedFile(null); setDeleteSim(null); }}
          onSimulateDelete={handleSimulateDelete}
          onNodeNavigate={(id) => {
            handleNodeSelect(id);
            if (cyRef) {
              const node = cyRef.getElementById(id);
              if (node.length) {
                cyRef.animate(
                  { center: { eles: node }, zoom: 2 } as unknown as cytoscape.AnimationOptions,
                  { duration: 300 } as unknown as cytoscape.AnimationOptions,
                );
              }
            }
          }}
        />

        <Legend isMonorepo={graph.isMonorepo} />
      </div>

      <Toast toast={toast} />
    </>
  );
}
