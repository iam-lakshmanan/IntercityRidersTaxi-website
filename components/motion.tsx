'use client';
import { motion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
export function MotionProvider({ children }: { children: ReactNode }) { return <MotionConfig reducedMotion="user">{children}</MotionConfig>; }
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div className={["reveal", className].filter(Boolean).join(" ")} initial={{ opacity: 0.85, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
