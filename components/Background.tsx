"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function Background() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 3000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -300]);
  const y3 = useTransform(scrollY, [0, 3000], [0, -450]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#04121a]">
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        <motion.div
          animate={{ x: ["-1.5%", "1.5%", "-1.5%"], y: ["-2%", "2%", "-2%"], scale: [1.06, 1.09, 1.06] }}
          transition={{ duration: 22.6, ease: "easeInOut", repeat: Infinity }}
          className="ocean-layer absolute -inset-[8%]"
        />
      </motion.div>
      
      <motion.div style={{ y: y2 }} className="absolute inset-0">
        <motion.div
          animate={{ x: ["2%", "-2%", "2%"], y: ["3%", "-3%", "3%"], scale: [1.12, 1.16, 1.12], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 31.3, ease: "easeInOut", repeat: Infinity }}
          className="ocean-layer ocean-reflection absolute -inset-[12%]"
        />
      </motion.div>
      
      <motion.div style={{ y: y3 }} className="hidden md:block absolute inset-0">
        <motion.div
          animate={{ x: ["-5%", "5%", "-5%"], y: ["-1%", "2%", "-1%"], opacity: [0.12, 0.26, 0.12] }}
          transition={{ duration: 19.3, ease: "easeInOut", repeat: Infinity }}
          className="ocean-layer ocean-shimmer absolute -inset-[14%]"
        />
      </motion.div>

      <motion.div
        animate={{ x: ["-4%", "4%", "-4%"], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 16.6, ease: "easeInOut", repeat: Infinity }}
        className="absolute inset-x-[-10%] top-[-5%] h-[46%] bg-[radial-gradient(ellipse_at_center,rgba(200,218,216,.42),transparent_66%)] blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(110,141,148,.2)_0%,rgba(10,32,42,.35)_48%,rgba(0,8,14,.65)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,8,14,.55)_100%)]" />
      <div className="absolute inset-0 bg-[#0a2733]/25 mix-blend-color" />
      <div className="grain absolute inset-0 opacity-[.07] hidden md:block" />
    </div>
  );
}
