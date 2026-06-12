import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-md)" },
  hover: {
    y: -3,
    boxShadow: "var(--shadow-lg)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const buttonTap = { scale: 0.97, transition: { duration: 0.08 } };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const tabContent: Variants = {
  hidden: { opacity: 0, x: 6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -6, transition: { duration: 0.2 } },
};

export const milestoneVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};
