import { useEffect, useRef, useState } from "react";

const SLOP_MS = 1200;
const FLICKER_MS = 180;
const DISSOLVE_MS = 450;

const CHARS = "/\\|_-=+#X*<>%@!?;:.";
const CELL = 16;

export function SlopIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"slop" | "ascii" | "gone">("slop");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ascii"), SLOP_MS);
    return () => window.clearTimeout(t);
  }, []);

  // The slop page "crashes" into ASCII noise, flickers, then dissolves
  // cell-by-cell to reveal the real site behind the canvas.
  useEffect(() => {
    if (phase !== "ascii") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.font = `bold ${CELL - 2}px monospace`;
    ctx.textBaseline = "top";

    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);

    const drawCell = (cx: number, cy: number) => {
      const x = cx * CELL;
      const y = cy * CELL;
      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y, CELL, CELL);
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const r = Math.random();
      ctx.fillStyle = r < 0.06 ? "#ff0044" : r < 0.12 ? "#00ffee" : "#000";
      ctx.fillText(ch, x + 2, y + 2);
    };

    const drawFull = () => {
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) drawCell(cx, cy);
    };
    drawFull();

    // shuffled cell order for the dissolve
    const cells = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    let raf = 0;
    let cleared = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      if (t < FLICKER_MS) {
        drawFull();
      } else {
        const target = Math.min(
          cells.length,
          Math.floor(((t - FLICKER_MS) / DISSOLVE_MS) * cells.length)
        );
        while (cleared < target) {
          const i = cells[cleared++];
          ctx.clearRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
        }
        if (cleared >= cells.length) {
          setPhase("gone");
          onDoneRef.current();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className="fixed inset-0 z-[9999]" aria-hidden={phase === "ascii"}>
      {phase === "slop" && (
        <div className="absolute inset-0 overflow-hidden bg-white font-sans">
          {/* peak AI slop portfolio */}
          <nav className="flex items-center justify-between px-10 py-5 shadow-md bg-white">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Adnan.dev
            </div>
            <div className="hidden md:flex gap-8 text-gray-600 font-medium">
              <span>Home</span>
              <span>About</span>
              <span>Projects</span>
              <span>Contact</span>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-5 py-2 rounded-full font-medium">
              Hire Me
            </button>
          </nav>

          <header className="text-center py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-5xl">
              👨‍💻
            </div>
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
              Hi, I'm Adnan{" "}
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              Passionate Full-Stack Developer | Problem Solver | Tech Enthusiast 🚀
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">
                Download Resume
              </button>
              <button className="border-2 border-purple-500 text-purple-600 px-8 py-3 rounded-full font-semibold">
                Contact Me
              </button>
            </div>
          </header>

          <section className="max-w-4xl mx-auto px-10 py-10 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Me ✨</h2>
            <p className="text-gray-500 leading-relaxed">
              I am a passionate and motivated developer who loves turning ideas
              into reality. I believe in writing clean code and building amazing
              user experiences. When I'm not coding, you can find me exploring
              new technologies and drinking coffee ☕.
            </p>
          </section>

          <section className="max-w-5xl mx-auto px-10 pb-10">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              My Skills 💪
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ["⚛️", "React", "90%"],
                ["🟨", "JavaScript", "85%"],
                ["🎨", "CSS", "80%"],
                ["🧠", "AI/ML", "75%"],
              ].map(([icon, name, pct]) => (
                <div key={name} className="bg-white rounded-2xl shadow-md p-6 text-center">
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="font-semibold text-gray-700 mb-2">{name}</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-100">
            Made with ❤️ using React | © 2026 Adnan. All Rights Reserved.
          </footer>
        </div>
      )}

      {phase === "ascii" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
