import { type Variants, type Transition } from "motion/react";

/**
 * Apple-style spring and cubic bezier transition configurations
 */
export const appleSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const appleSmooth: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1], // Apple standard smooth curve
};

/**
 * Page level transitions for AnimatePresence
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Fade in with subtle upward motion
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Pure Fade In
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/**
 * Stagger container for list items (tracks, cards, albums)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

/**
 * Individual item inside a staggered list
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Scale on hover and tap micro-interactions
 */
export const scaleHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1, ease: "easeOut" },
  },
};
