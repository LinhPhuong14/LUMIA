import Link from "next/link";
import type { Route } from "next";

type Scene = "journal" | "audio" | "journey" | "chat" | "reports" | "mood";

function SceneIllustration({ scene }: { scene: Scene }) {
  const common = "mx-auto h-32 w-40 md:h-40 md:w-48";

  if (scene === "journal") {
    return (
      <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
        <rect x="50" y="70" width="60" height="4" rx="2" fill="#f4ead2" />
        <rect x="55" y="50" width="50" height="35" rx="4" fill="#eaf0df" stroke="#d2dcba" />
        <line x1="62" y1="58" x2="95" y2="58" stroke="#7d8f68" strokeWidth="1" opacity="0.5" />
        <line x1="62" y1="65" x2="90" y2="65" stroke="#7d8f68" strokeWidth="1" opacity="0.4" />
        <rect x="75" y="42" width="3" height="12" rx="1" fill="#c9a82e" />
        <circle cx="120" cy="35" r="8" fill="rgba(255,240,180,0.6)" />
      </svg>
    );
  }

  if (scene === "audio") {
    return (
      <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
        <ellipse cx="80" cy="75" rx="40" ry="8" fill="#d2dcba" opacity="0.4" />
        <path d="M55 60 C55 45 65 35 80 35 C95 35 105 45 105 60 L105 75 L55 75Z" fill="#8d9d76" opacity="0.5" />
        <path d="M45 55 C40 50 38 45 40 40" stroke="#7d8f68" strokeWidth="2" />
        <path d="M115 55 C120 50 122 45 120 40" stroke="#7d8f76" strokeWidth="2" />
        <circle cx="65" cy="90" r="4" fill="#7d8f68" opacity="0.3" />
        <circle cx="80" cy="95" r="5" fill="#8d9d76" opacity="0.4" />
        <circle cx="95" cy="90" r="4" fill="#7d8f68" opacity="0.3" />
      </svg>
    );
  }

  if (scene === "journey") {
    return (
      <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
        <path d="M20 90 Q50 70 80 80 T140 75" stroke="#d2dcba" strokeWidth="3" fill="none" />
        <circle cx="130" cy="30" r="12" fill="rgba(255,240,180,0.5)" />
        <path d="M30 85 L35 75 L40 85Z" fill="#7d8f68" opacity="0.4" />
        <path d="M70 78 L75 65 L80 78Z" fill="#8d9d76" opacity="0.5" />
        <path d="M110 76 L115 68 L120 76Z" fill="#7d8f68" opacity="0.4" />
      </svg>
    );
  }

  if (scene === "chat") {
    return (
      <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
        <path d="M35 50 C35 35 50 25 65 30 C70 20 85 18 95 28 C110 22 125 35 120 50 C125 60 115 70 100 68 L90 80 L85 65 C70 68 55 62 48 52Z" fill="#eaf0df" stroke="#d2dcba" />
        <path d="M70 55 C70 45 80 40 90 42 C95 35 108 35 112 45 C118 42 125 50 122 58 C124 64 118 70 110 68 L105 76 L100 66 C92 68 84 64 80 58Z" fill="#d2dcba" opacity="0.7" transform="translate(15, 10)" />
      </svg>
    );
  }

  if (scene === "reports") {
    return (
      <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
        <path d="M60 25 L100 25 L105 95 L55 95Z" fill="#f4ead2" stroke="#d2dcba" />
        <path d="M65 30 L95 30 L98 90 L62 90Z" fill="#fffef8" />
        <line x1="70" y1="40" x2="92" y2="40" stroke="#7d8f68" strokeWidth="1" opacity="0.4" />
        <line x1="70" y1="48" x2="90" y2="48" stroke="#7d8f68" strokeWidth="1" opacity="0.3" />
        <circle cx="80" cy="75" r="8" fill="none" stroke="#8d9d76" strokeWidth="1.5" />
        <path d="M77 75 L79 77 L83 73" stroke="#7d8f68" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 160 120" fill="none" aria-hidden>
      <ellipse cx="60" cy="45" rx="25" ry="12" fill="#eaf0df" opacity="0.6" />
      <ellipse cx="100" cy="50" rx="20" ry="10" fill="#d2dcba" opacity="0.5" />
      <circle cx="120" cy="35" r="10" fill="rgba(255,240,180,0.5)" />
    </svg>
  );
}

export interface EmptyStateProps {
  scene: Scene;
  title: string;
  description: string;
  action?: { label: string; href: Route };
}

export function EmptyState({ scene, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center px-6 py-10 text-center">
      <SceneIllustration scene={scene} />
      <h3 className="mt-6 font-serif text-xl text-matcha-deep">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {action ? (
        <Link href={action.href} className="button-primary mt-6 text-[13px]">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
