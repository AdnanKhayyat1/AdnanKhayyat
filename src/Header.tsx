import { useEffect, useRef, useState } from "react";
import { ExpandedHeader } from "./ExpandedHeader";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed top-0 left-0 w-full z-40"
    >
      {/* Slide-down panel */}
      <ExpandedHeader open={open} onClose={() => setOpen(false)} id="header-menu" />

      {/* Foreground header content */}
      <header
        className={[
          "relative p-4 md:p-6 flex justify-between items-start pointer-events-auto",
          // When the menu is open, hide the normal header so the expanded panel
          // reads as a clean black box (no overlay).
          open ? "opacity-0 pointer-events-none" : "opacity-100",
          // Closed: original color (black) and normal blending.
          // Open: white text with mix-blend-difference for strong contrast.
          open ? "mix-blend-difference text-white" : "mix-blend-normal text-black",
        ].join(" ")}
      >
        <div className="flex flex-col items-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none">
            ADNAN<br />KHAYYAT
          </h1>
          <div className="mt-2 text-xs md:text-sm font-mono opacity-80">
            EST. 2025<br />
            NO. 74-211
          </div>
        </div>

        <div className="flex flex-col items-end">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="header-menu"
            onClick={() => setOpen((v) => !v)}
            className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4"
          >
            <span>{open ? "CLOSE MENU" : "OPEN MENU"}</span>
            <span className="inline-block transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
              ↗
            </span>
          </button>
          <div className="mt-2 text-right text-xs md:text-sm font-mono opacity-80 hidden md:block"></div>
        </div>
      </header>
    </div>
  );
};
