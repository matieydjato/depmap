/**
 * useExport — Handles PNG and JSON export actions.
 */

import { useCallback } from 'react';
import type { Core } from 'cytoscape';

interface UseExportReturn {
  /** Export the graph as a PNG image */
  handleExportPNG: () => void;
  /** Export the graph data as JSON (opens API endpoint) */
  handleExportJSON: () => void;
  /** Reset the graph view (fit all elements) */
  handleResetView: () => void;
}

/**
 * Hook that provides export and view-reset actions.
 *
 * @param cyRef - Cytoscape core instance reference
 * @param onSuccess - Callback for success messages
 */
export function useExport(
  cyRef: Core | null,
  onSuccess: (message: string) => void,
): UseExportReturn {
  const handleExportPNG = useCallback(() => {
    if (!cyRef) return;
    const png = cyRef.png({ output: 'blob', bg: '#0d1117', full: true, scale: 2 });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = 'depmap-graph.png';
    link.click();
    URL.revokeObjectURL(link.href);
    onSuccess('PNG exported!');
  }, [cyRef, onSuccess]);

  const handleExportJSON = useCallback(() => {
    window.open('/api/export/json', '_blank');
    onSuccess('JSON exported!');
  }, [onSuccess]);

  const handleResetView = useCallback(() => {
    if (!cyRef) return;
    cyRef.elements().removeClass('dimmed highlighted affected-direct affected-transitive deleted-sim');
    cyRef.animate({ fit: { padding: 40 } } as unknown as cytoscape.AnimationOptions, {
      duration: 400,
    } as unknown as cytoscape.AnimationOptions);
  }, [cyRef]);

  return { handleExportPNG, handleExportJSON, handleResetView };
}
