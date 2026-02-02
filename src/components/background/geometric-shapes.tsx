/**
 * Background geometric shapes
 *
 * SVG components for static background decoration, similar to rare-find.
 * Uses EventosGC palette: primary orange (#FF8400) and soft amber variants.
 */

import React from "react";

export interface BackgroundShapeProps {
  className?: string;
  opacity?: number;
}

/**
 * Large gradient blob – far background layer
 */
export const GradientBlob: React.FC<BackgroundShapeProps> = ({
  className = "",
  opacity = 0.3,
}) => (
  <svg
    width="1000"
    height="1000"
    viewBox="0 0 1000 1000"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden
  >
    <defs>
      <linearGradient
        id="eventosgc-blob-gradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#FF8400" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#E67600" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#CC6600" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    <path
      d="M500,167 C667,83 833,250 917,417 C1000,583 917,750 750,833 C583,917 417,833 333,667 C250,500 333,250 500,167 Z"
      fill="url(#eventosgc-blob-gradient)"
    />
  </svg>
);

/**
 * Circle cluster – mid background layer
 */
export const CircleCluster: React.FC<BackgroundShapeProps> = ({
  className = "",
  opacity = 0.35,
}) => (
  <svg
    width="400"
    height="400"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden
  >
    <circle cx="85" cy="120" r="38" fill="#FF8400" fillOpacity="0.45" />
    <circle cx="220" cy="95" r="28" fill="#E67600" fillOpacity="0.4" />
    <circle cx="310" cy="185" r="42" fill="#CC6600" fillOpacity="0.45" />
    <circle cx="140" cy="270" r="22" fill="#FF8400" fillOpacity="0.45" />
    <circle cx="265" cy="315" r="33" fill="#E67600" fillOpacity="0.4" />
    <circle cx="175" cy="340" r="19" fill="#CC6600" fillOpacity="0.45" />
    <circle cx="50" cy="280" r="26" fill="#FF8400" fillOpacity="0.4" />
  </svg>
);

/**
 * Alternative circle cluster – different arrangement
 */
export const CircleClusterAlt: React.FC<BackgroundShapeProps> = ({
  className = "",
  opacity = 0.35,
}) => (
  <svg
    width="400"
    height="400"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden
  >
    <circle cx="50" cy="80" r="35" fill="#E67600" fillOpacity="0.45" />
    <circle cx="180" cy="120" r="40" fill="#CC6600" fillOpacity="0.45" />
    <circle cx="320" cy="180" r="28" fill="#FF8400" fillOpacity="0.45" />
    <circle cx="100" cy="280" r="32" fill="#E67600" fillOpacity="0.4" />
    <circle cx="280" cy="320" r="38" fill="#CC6600" fillOpacity="0.45" />
    <circle cx="200" cy="50" r="22" fill="#FF8400" fillOpacity="0.4" />
  </svg>
);

/**
 * Small floating dots – near background layer
 */
export const FloatingDots: React.FC<BackgroundShapeProps> = ({
  className = "",
  opacity = 0.4,
}) => (
  <svg
    width="300"
    height="300"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden
  >
    <circle cx="50" cy="50" r="4" fill="#FF8400" fillOpacity="0.65" />
    <circle cx="150" cy="80" r="3" fill="#E67600" fillOpacity="0.6" />
    <circle cx="250" cy="120" r="5" fill="#CC6600" fillOpacity="0.65" />
    <circle cx="80" cy="180" r="4" fill="#FF8400" fillOpacity="0.65" />
    <circle cx="200" cy="220" r="3" fill="#E67600" fillOpacity="0.6" />
    <circle cx="120" cy="260" r="4" fill="#CC6600" fillOpacity="0.65" />
  </svg>
);

/**
 * Wave pattern – bottom of viewport
 */
export const WavePattern: React.FC<BackgroundShapeProps> = ({
  className = "",
  opacity = 0.25,
}) => (
  <svg
    width="100%"
    height="200"
    viewBox="0 0 800 200"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden
  >
    <defs>
      <linearGradient
        id="eventosgc-wave-gradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#FF8400" stopOpacity="0.45" />
        <stop offset="50%" stopColor="#E67600" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#CC6600" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <path
      d="M0,100 Q200,50 400,100 T800,100 L800,200 L0,200 Z"
      fill="url(#eventosgc-wave-gradient)"
    />
    <path
      d="M0,150 Q200,120 400,150 T800,150 L800,200 L0,200 Z"
      fill="url(#eventosgc-wave-gradient)"
      fillOpacity="0.6"
    />
  </svg>
);
