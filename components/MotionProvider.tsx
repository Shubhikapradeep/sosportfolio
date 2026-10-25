"use client";

import { MotionConfig } from "framer-motion";

// Honour the OS "reduce motion" setting for every Framer Motion animation.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
