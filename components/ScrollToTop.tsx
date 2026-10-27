"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/Icons";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-black shadow-xl shadow-amber-950/60 ring-1 ring-amber-300 transition-all hover:bg-amber-400 hover:scale-105 active:scale-95 backdrop-blur-md animate-in fade-in zoom-in-75 duration-200"
    >
      <ArrowUpIcon className="size-5" />
    </button>
  );
}
