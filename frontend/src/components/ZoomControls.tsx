import type { Core } from "cytoscape";

interface ZoomControlsProps {
  cy: Core | null;
}

function ZoomButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      className="flex items-center justify-center w-9 h-9 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {children}
    </button>
  );
}

export default function ZoomControls({ cy }: ZoomControlsProps) {
  const handleZoomIn = () => {
    if (!cy) return;
    cy.animate(
      {
        zoom: {
          level: cy.zoom() * 1.3,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        },
      } as unknown as cytoscape.AnimationOptions,
      { duration: 200 } as unknown as cytoscape.AnimationOptions
    );
  };

  const handleZoomOut = () => {
    if (!cy) return;
    cy.animate(
      {
        zoom: {
          level: cy.zoom() / 1.3,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        },
      } as unknown as cytoscape.AnimationOptions,
      { duration: 200 } as unknown as cytoscape.AnimationOptions
    );
  };

  const handleFit = () => {
    if (!cy) return;
    cy.animate(
      { fit: { eles: cy.elements(), padding: 50 } } as unknown as cytoscape.AnimationOptions,
      { duration: 300 } as unknown as cytoscape.AnimationOptions
    );
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col rounded-lg overflow-hidden shadow-lg">
      <ZoomButton onClick={handleZoomIn} ariaLabel="Zoom in">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
        </svg>
      </ZoomButton>
      <ZoomButton onClick={handleZoomOut} ariaLabel="Zoom out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 8a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 014 8z" />
        </svg>
      </ZoomButton>
      <ZoomButton onClick={handleFit} ariaLabel="Fit graph to view">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2v4h1V3h3V2H2zm9 0v1h3v3h1V2h-4zM3 11H2v4h4v-1H3v-3zm10 0v3h-3v1h4v-4h-1z" />
        </svg>
      </ZoomButton>
    </div>
  );
}
