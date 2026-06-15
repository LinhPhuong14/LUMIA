"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const MOBILE_QUERY = "(max-width: 1023px)";

function isFormField(element: EventTarget | null): element is HTMLInputElement | HTMLTextAreaElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

/** Scroll focused fields into view and notify when mobile keyboard is likely open. */
export function useMobileFormFocus(
  containerRef: RefObject<HTMLElement | null>,
  onTypingChange?: (typing: boolean) => void,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const media = window.matchMedia(MOBILE_QUERY);

    const scrollFieldIntoView = (field: HTMLElement) => {
      window.requestAnimationFrame(() => {
        field.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      });
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!media.matches || !isFormField(event.target)) return;
      onTypingChange?.(true);
      scrollFieldIntoView(event.target);
    };

    const onFocusOut = () => {
      window.requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!media.matches) {
          onTypingChange?.(false);
          return;
        }
        if (!isFormField(active) || !container.contains(active)) {
          onTypingChange?.(false);
        }
      });
    };

    const onViewportResize = () => {
      const active = document.activeElement;
      if (media.matches && isFormField(active) && container.contains(active)) {
        scrollFieldIntoView(active);
      }
    };

    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, [containerRef, onTypingChange]);
}
