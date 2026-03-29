"use client";

import { motion } from "framer-motion";

export default function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[hsl(var(--surface-2))]">
      <motion.div
        className="h-full bg-amber"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
  );
}
