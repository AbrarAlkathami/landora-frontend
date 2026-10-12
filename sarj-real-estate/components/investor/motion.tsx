"use client";

import { useLanguage } from "@/components/shared/language";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const {
    t
  } = useLanguage();
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : {
    opacity: 0,
    y: 18
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    margin: "40px"
  }} transition={{
    duration: .55,
    delay,
    ease: "easeOut"
  }}>
    {t(children)}
  </motion.div>;
}
