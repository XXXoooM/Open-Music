import { type Variants, type Transition } from "motion/react";

/**
 * Apple-style physics spring configurations (Haptic Touch feel)
 */
export const appleSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

export const appleSmooth: Transition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1], // Apple HIG canonical deceleration curve
};

/**
 * Page level transitions: Scale + Subtle Blur + Vertical Offset
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.992,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    filter: "blur(3px)",
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Stagger Container for List Items (Cards, Albums, Tracks)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

/**
 * Stagger Child Item (Smooth Bottom Rise + Soft Scale)
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Interactive Scale on Hover and Tap
 */
export const scaleHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.035,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  tap: {
    scale: 0.96,
    transition: { duration: 0.1, ease: "easeOut" },
  },
};

export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -5,
    scale: 1.015,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};
