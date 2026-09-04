"use client";

/**
 * Ilustración del panel visual de inicio de sesión: balanza de la
 * justicia + escudo con candado + laptop + libro/documento jurídico,
 * construida enteramente en SVG (sin imágenes externas de bancos de
 * imágenes, siguiendo el mismo criterio que TechLegalGraphic).
 *
 * Si en el futuro se prefiere sustituir esta ilustración por una imagen
 * ilustrada a mano, colocar el archivo en:
 *   /public/images/login-illustration.png
 * y renderizarlo aquí con next/image manteniendo el mismo contenedor
 * (relative w-full h-full) para no afectar el layout del panel.
 */
export function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full h-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="login-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(217 70 239)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgb(124 58 237)" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="login-soft-glow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="rgb(124 58 237)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(124 58 237)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="240" cy="220" r="210" fill="url(#login-soft-glow)" />

      {/* líneas de circuito discretas */}
      <g stroke="rgb(148 163 184)" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round">
        <line x1="40" y1="60" x2="100" y2="60" />
        <line x1="100" y1="60" x2="100" y2="90" />
        <circle cx="100" cy="90" r="3" fill="rgb(217 70 239)" fillOpacity="0.6" />
        <line x1="400" y1="70" x2="440" y2="70" />
        <line x1="400" y1="70" x2="400" y2="40" />
        <circle cx="400" cy="40" r="3" fill="rgb(124 58 237)" fillOpacity="0.6" />
        <line x1="50" y1="400" x2="90" y2="400" />
        <circle cx="90" cy="400" r="3" fill="rgb(124 58 237)" fillOpacity="0.6" />
      </g>

      {/* libro / documento jurídico */}
      <g transform="translate(110 300)">
        <rect x="0" y="0" width="120" height="80" rx="4" fill="rgb(13 19 56)" stroke="url(#login-glow)" strokeWidth="1.5" />
        <line x1="14" y1="20" x2="106" y2="20" stroke="rgb(148 163 184)" strokeOpacity="0.5" strokeWidth="2" />
        <line x1="14" y1="34" x2="90" y2="34" stroke="rgb(148 163 184)" strokeOpacity="0.5" strokeWidth="2" />
        <line x1="14" y1="48" x2="96" y2="48" stroke="rgb(148 163 184)" strokeOpacity="0.5" strokeWidth="2" />
        <line x1="14" y1="62" x2="70" y2="62" stroke="rgb(217 70 239)" strokeOpacity="0.6" strokeWidth="2" />
      </g>

      {/* laptop */}
      <g transform="translate(250 290)">
        <rect x="0" y="0" width="130" height="76" rx="6" fill="rgb(13 19 56)" stroke="rgb(148 163 184)" strokeOpacity="0.4" strokeWidth="1.5" />
        <rect x="10" y="10" width="110" height="56" rx="2" fill="rgb(7 11 42)" />
        <path d="M-6 76 H136 L124 92 H6 Z" fill="rgb(13 19 56)" stroke="rgb(148 163 184)" strokeOpacity="0.4" strokeWidth="1.2" />
        <path d="M40 38 L58 24 L40 10" fill="none" stroke="url(#login-glow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 38 L72 24 L90 10" fill="none" stroke="url(#login-glow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* balanza de la justicia */}
      <g transform="translate(240 175)">
        <line x1="0" y1="-70" x2="0" y2="40" stroke="rgb(148 163 184)" strokeOpacity="0.6" strokeWidth="3" />
        <ellipse cx="0" cy="44" rx="30" ry="6" fill="rgb(148 163 184)" fillOpacity="0.25" />
        <line x1="-60" y1="-46" x2="60" y2="-46" stroke="url(#login-glow)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="-70" r="5" fill="url(#login-glow)" />

        {/* plato izquierdo */}
        <line x1="-60" y1="-46" x2="-60" y2="-14" stroke="rgb(148 163 184)" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M-82 -14 Q-60 4 -38 -14" fill="none" stroke="url(#login-glow)" strokeWidth="2.5" strokeLinecap="round" />

        {/* plato derecho */}
        <line x1="60" y1="-46" x2="60" y2="-14" stroke="rgb(148 163 184)" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M38 -14 Q60 4 82 -14" fill="none" stroke="url(#login-glow)" strokeWidth="2.5" strokeLinecap="round" />

        <path d="M-16 -96 L16 -96 L16 -80 L0 -70 L-16 -80 Z" fill="rgb(13 19 56)" stroke="url(#login-glow)" strokeWidth="1.5" />
      </g>

      {/* escudo con candado, en primer plano */}
      <g transform="translate(150 200)">
        <path
          d="M0 -42 L36 -27 V6 C36 32 18 48 0 55 C-18 48 -36 32 -36 6 V-27 Z"
          fill="rgb(7 11 42)"
          fillOpacity="0.95"
        />
        <path
          d="M0 -42 L36 -27 V6 C36 32 18 48 0 55 C-18 48 -36 32 -36 6 V-27 Z"
          fill="none"
          stroke="url(#login-glow)"
          strokeWidth="2"
          className="animate-pulse-slow motion-reduce:animate-none"
        />
        <rect x="-12" y="-4" width="24" height="20" rx="3" fill="none" stroke="rgb(236 72 153)" strokeWidth="2.5" />
        <path d="M-7 -4 V-12 A7 7 0 0 1 7 -12 V-4" fill="none" stroke="rgb(236 72 153)" strokeWidth="2.5" />
        <circle cx="0" cy="6" r="2.5" fill="rgb(236 72 153)" />
      </g>

      {/* nodos decorativos flotantes */}
      {[
        { x: 70, y: 150, r: 3 },
        { x: 410, y: 180, r: 4 },
        { x: 430, y: 260, r: 3 },
        { x: 60, y: 260, r: 3 },
      ].map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="rgb(217 70 239)"
          className="animate-pulse-slow motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </svg>
  );
}
