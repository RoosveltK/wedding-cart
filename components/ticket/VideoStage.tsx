"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function VideoStage({
  videoUrl,
  onDone,
}: {
  videoUrl: string;
  onDone: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // autoplay avec son peut être bloqué selon le navigateur ; l'invité peut
      // relancer via les contrôles natifs.
    });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        onEnded={onDone}
        className="max-h-full max-w-full"
      />

      <button
        onClick={onDone}
        className="absolute right-5 top-5 rounded-full bg-white/15 px-4 py-2 text-xs tracking-widest text-white uppercase backdrop-blur transition hover:bg-white/25"
      >
        Passer
      </button>
    </motion.div>
  );
}
