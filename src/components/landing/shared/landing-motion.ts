export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1], delay },
  } as const;
}

export const testimonialCardShadow =
  "0px 0px 0px 1px rgba(14,63,126,0.04), 0px 1px 1px -0.5px rgba(42,51,69,0.04), 0px 3px 3px -1.5px rgba(42,51,70,0.04), 0px 6px 6px -3px rgba(42,51,70,0.04), 0px 12px 12px -6px rgba(14,63,126,0.04), 0px 24px 24px -12px rgba(14,63,126,0.04)";
