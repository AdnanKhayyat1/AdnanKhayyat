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
          "glass-header relative flex justify-between items-center text-black",
          open ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto",
        ].join(" ")}
      >
        <div className="flex flex-col items-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none">
            ADNAN<br />KHAYYAT
          </h1>
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
        </div>
      </header>
    </div>
  );
};
