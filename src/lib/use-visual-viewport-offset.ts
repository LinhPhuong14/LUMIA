"use client";

import { useEffect, useState } from "react";

/** Extra bottom inset when the mobile keyboard shrinks the visual viewport. */
export function useVisualViewportOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const gap = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setOffset(gap);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return offset;
}
