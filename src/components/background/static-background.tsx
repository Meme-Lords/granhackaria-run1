/**
 * Static background component
 *
 * Displays decorative SVG elements in the background (no animations),
 * similar to rare-find's StaticBackground. Uses EventosGC orange palette.
 */

import {
  GradientBlob,
  CircleCluster,
  CircleClusterAlt,
  FloatingDots,
  WavePattern,
} from "./geometric-shapes";

export interface StaticBackgroundProps {
  /** When true (default), background is fixed to viewport. When false, fills parent (e.g. hero). */
  readonly fixed?: boolean;
  /** When true, renders fewer elements (e.g. for hero section). */
  readonly reduced?: boolean;
  /** When true, background is hidden on viewports smaller than md (e.g. hero on mobile). */
  readonly hideOnMobile?: boolean;
}

export function StaticBackground({
  fixed = true,
  reduced = false,
  hideOnMobile = false,
}: Readonly<StaticBackgroundProps>) {
  const baseClass =
    fixed
      ? "fixed inset-0 pointer-events-none overflow-hidden z-0"
      : "absolute inset-0 pointer-events-none overflow-hidden z-0";
  const containerClass = hideOnMobile ? `${baseClass} hidden md:block` : baseClass;

  if (reduced) {
    return (
      <div className={containerClass} aria-hidden>
        <GradientBlob
          className="absolute top-1/2 -left-1/2 -translate-y-1/2 hidden md:block"
          opacity={0.3}
        />
        <GradientBlob
          className="absolute top-1/2 left-0 -translate-y-1/2 md:hidden"
          opacity={0.4}
        />
        <GradientBlob
          className="absolute top-1/2 -right-1/3 -translate-y-1/2 hidden md:block"
          opacity={0.25}
        />
        <GradientBlob
          className="absolute top-1/2 right-0 -translate-y-1/2 md:hidden"
          opacity={0.4}
        />
        <FloatingDots
          className="absolute top-1/4 left-1/4 hidden md:block"
          opacity={0.4}
        />
        <FloatingDots
          className="absolute top-1/4 left-4 scale-75 md:hidden"
          opacity={0.4}
        />
        <div className="absolute bottom-0 left-0 right-0 w-full">
          <WavePattern className="w-full h-auto" opacity={0.3} />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} aria-hidden>
      {/* Far background layer – blobs */}
      <GradientBlob
        className="absolute top-0 left-1/4 -translate-y-1/2 scale-75 hidden md:block"
        opacity={0.2}
      />
      {/* Mid background layer – circle clusters */}
      <CircleCluster
        className="absolute top-10 left-1/4 scale-90 hidden md:block"
        opacity={0.28}
      />
      <CircleCluster
        className="absolute bottom-40 left-40 hidden md:block"
        opacity={0.3}
      />
      <CircleCluster
        className="absolute bottom-32 left-4 scale-75 md:hidden"
        opacity={0.3}
      />
      <CircleClusterAlt
        className="absolute top-20 right-20 hidden md:block"
        opacity={0.35}
      />
      <CircleClusterAlt
        className="absolute top-4 right-4 scale-75 md:hidden"
        opacity={0.35}
      />
      {/* Near background layer – dots at edges only */}

      {/* Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <WavePattern className="w-full h-auto" opacity={0.3} />
      </div>
    </div>
  );
}
