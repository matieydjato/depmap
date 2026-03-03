import type { DependencyGraph, DeleteSimResult } from "./types";

const BASE = "";

export async function fetchGraph(): Promise<DependencyGraph> {
  const res = await fetch(`${BASE}/api/graph`);
  if (!res.ok) throw new Error("Failed to fetch graph");
  return res.json();
}

export async function fetchDeleteSim(fileId: string): Promise<DeleteSimResult> {
  const res = await fetch(`${BASE}/api/simulate-delete/${encodeURIComponent(fileId)}`);
  if (!res.ok) throw new Error("Failed to simulate delete");
  return res.json();
}

export function getExportJsonUrl(): string {
  return `${BASE}/api/export/json`;
}
