"use client";

import { motion, useReducedMotion } from "framer-motion";
export default function InvestorTemplate({
  children
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : {
    opacity: .6,
    y: 5
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: .25,
    ease: "easeOut"
  }}>
    {children}
  </motion.div>;
}
