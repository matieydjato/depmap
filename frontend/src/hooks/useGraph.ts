/**
 * useGraph — Fetches and manages the dependency graph data.
 */

import { useState, useEffect } from "react";
import type { DependencyGraph } from "../types";
import { fetchGraph } from "../api";

interface UseGraphReturn {
  /** The loaded dependency graph, or null while loading */
  graph: DependencyGraph | null;
  /** Error message if the fetch failed */
  error: string | null;
}

/**
 * Hook that fetches the dependency graph from the API on mount.
 */
export function useGraph(): UseGraphReturn {
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraph()
      .then(setGraph)
      .catch(() => setError("Failed to load dependency data"));
  }, []);

  return { graph, error };
}
