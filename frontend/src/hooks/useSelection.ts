/**
 * useSelection — Manages node selection and delete simulation state.
 */

import { useState, useCallback } from "react";
import type { DependencyGraph, FileNode, DeleteSimResult } from "../types";
import { fetchDeleteSim } from "../api";

interface UseSelectionReturn {
  /** Currently selected file node */
  selectedFile: FileNode | null;
  /** Result of the last delete simulation */
  deleteSim: DeleteSimResult | null;
  /** Select a node by ID, or null to deselect */
  handleNodeSelect: (fileId: string | null) => void;
  /** Run a delete simulation on the currently selected file */
  handleSimulateDelete: () => Promise<void>;
  /** Clear selection and simulation state */
  clearSelection: () => void;
}

/**
 * Hook that manages file selection and delete simulation.
 *
 * @param graph - The loaded dependency graph
 * @param onError - Callback for error messages
 */
export function useSelection(
  graph: DependencyGraph | null,
  onError: (message: string) => void
): UseSelectionReturn {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [deleteSim, setDeleteSim] = useState<DeleteSimResult | null>(null);

  const handleNodeSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !graph) {
        setSelectedFile(null);
        setDeleteSim(null);
        return;
      }
      const file = graph.files.find((f) => f.id === fileId) || null;
      setSelectedFile(file);
      setDeleteSim(null);
    },
    [graph]
  );

  const handleSimulateDelete = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const result = await fetchDeleteSim(selectedFile.id);
      setDeleteSim(result);
    } catch {
      onError("Failed to simulate deletion");
    }
  }, [selectedFile, onError]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setDeleteSim(null);
  }, []);

  return { selectedFile, deleteSim, handleNodeSelect, handleSimulateDelete, clearSelection };
}
