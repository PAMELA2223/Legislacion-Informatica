"use client";

/**
 * Elemento visual del Hero: red de nodos conectados (tecnología) + un
 * escudo abstracto (seguridad/legislación), construido enteramente en SVG.
 * Sin imágenes externas de bancos de imágenes (Sección 29 del pedido).
 */
export function TechLegalGraphic() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full h-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgb(20 184 166)" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="softGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="240" cy="220" r="200" fill="url(#softGlow)" />

      {/* Líneas de conexión (red de nodos) */}
      <g stroke="url(#glow)" strokeWidth="1.2" strokeOpacity="0.5">
        <line x1="240" y1="220" x2="110" y2="120" />
        <line x1="240" y1="220" x2="370" y2="110" />
        <line x1="240" y1="220" x2="90" y2="290" />
        <line x1="240" y1="220" x2="380" y2="300" />
        <line x1="240" y1="220" x2="240" y2="90" />
        <line x1="110" y1="120" x2="240" y2="90" />
        <line x1="370" y1="110" x2="240" y2="90" />
        <line x1="90" y1="290" x2="130" y2="370" />
        <line x1="380" y1="300" x2="340" y2="380" />
      </g>

      {/* Nodos */}
      {[
        { x: 240, y: 220, r: 10 },
        { x: 110, y: 120, r: 5 },
        { x: 370, y: 110, r: 5 },
        { x: 90, y: 290, r: 4 },
        { x: 380, y: 300, r: 4 },
        { x: 240, y: 90, r: 4 },
        { x: 130, y: 370, r: 3 },
        { x: 340, y: 380, r: 3 },
      ].map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={i === 0 ? "rgb(37 99 235)" : "rgb(20 184 166)"}
          className="animate-pulse-slow motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}

      {/* Escudo abstracto central (seguridad + legislación) */}
      <g transform="translate(240 220)">
        <path
          d="M0 -46 L40 -30 V6 C40 34 20 52 0 60 C-20 52 -40 34 -40 6 V-30 Z"
          fill="rgb(15 23 42)"
          className="dark:opacity-90"
          opacity="0.9"
        />
        <path
          d="M0 -46 L40 -30 V6 C40 34 20 52 0 60 C-20 52 -40 34 -40 6 V-30 Z"
          fill="none"
          stroke="url(#glow)"
          strokeWidth="2"
        />
        {/* "balanza" simplificada dentro del escudo, referencia a lo legal */}
        <line x1="0" y1="-18" x2="0" y2="18" stroke="rgb(212 167 44)" strokeWidth="2" />
        <line x1="-20" y1="-10" x2="20" y2="-10" stroke="rgb(212 167 44)" strokeWidth="2" />
        <circle cx="-20" cy="-10" r="6" fill="none" stroke="rgb(212 167 44)" strokeWidth="1.5" />
        <circle cx="20" cy="-10" r="6" fill="none" stroke="rgb(212 167 44)" strokeWidth="1.5" />
      </g>

      {/* Líneas decorativas de "código" en las esquinas */}
      <g stroke="rgb(148 163 184)" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
        <line x1="40" y1="420" x2="80" y2="420" />
        <line x1="90" y1="420" x2="150" y2="420" />
        <line x1="330" y1="40" x2="370" y2="40" />
        <line x1="380" y1="40" x2="420" y2="40" />
      </g>
    </svg>
  );
}
