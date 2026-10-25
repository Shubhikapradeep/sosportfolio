"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  // Motion values update the DOM directly, so mousemove doesn't re-render React.
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 30, mass: 0.1 });
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 30, mass: 0.1 });
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });

  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device has a fine pointer (mouse)
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setHidden(false);
    };

    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mouseX, mouseY]);

  if (isMobile) return null;

  return (
    <>
      {/* The glowing dot */}
      <motion.div
        className="pointer-events-none fixed -left-1.5 -top-1.5 z-[9999] h-3 w-3 rounded-full bg-[#dce7e5] mix-blend-screen shadow-[0_0_10px_rgba(200,255,255,0.8)]"
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: clicked ? 0.8 : 1,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 800, damping: 30, mass: 0.1 }}
      />
      {/* The trailing ring */}
      <motion.div
        className="pointer-events-none fixed -left-5 -top-5 z-[9998] h-10 w-10 rounded-full border border-[#b8ccca]/30 shadow-[0_0_15px_rgba(182,208,207,0.1)]"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: clicked ? 1.2 : 1,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.5 }}
      />
    </>
  );
}
