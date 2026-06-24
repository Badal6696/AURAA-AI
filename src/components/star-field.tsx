import { useEffect, useRef } from "react";

export function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 180 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1 + 0.3,
      r: Math.random() * 1.2 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.z * 0.15;
        s.tw += 0.02;
        if (s.y > h) {
          s.y = -2;
          s.x = Math.random() * w;
        }
        const alpha = 0.5 + Math.sin(s.tw) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(160, 130, 255, 0.7)";
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 opacity-70" />;
}
