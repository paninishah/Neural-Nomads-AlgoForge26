import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

interface LandingRevealProps {
  onComplete: () => void;
}

/* ═══════════════════════════════════════════════════════════
   PARTICLE CANVAS — handles dust, fireflies, god-rays
   ═══════════════════════════════════════════════════════════ */
const ParticleCanvas = ({ phase }: { phase: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    particlesRef.current = Array.from({ length: 180 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      hue: Math.random() > 0.6 ? 45 : 120, // gold or green
      life: Math.random(),
      maxLife: 0.8 + Math.random() * 0.2,
      type: i < 60 ? "dust" : i < 120 ? "glow" : "leaf",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.15;
        p.y += p.vy;
        p.life += 0.002;

        if (p.y < -20 || p.life > p.maxLife) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
        }

        const alpha = p.opacity * Math.sin((p.life / p.maxLife) * Math.PI) * Math.min(phase / 1.5, 1);

        if (p.type === "glow") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha})`);
          grad.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 60%, 75%, ${alpha * 0.7})`;
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[3]"
    />
  );
};

/* ═══════════════════════════════════════════════════════════
   TREE SILHOUETTE — SVG-based, sways + grows
   ═══════════════════════════════════════════════════════════ */
const TreeSilhouette = ({
  x, scale, flip, depth, phase
}: {
  x: string; scale: number; flip?: boolean; depth: number; phase: number;
}) => {
  const opacity = Math.min(phase * 1.2, 0.9) * (1 - depth * 0.3);
  const blur = depth * 2;
  const sway = Math.sin(Date.now() * 0.0008 + depth) * 1.5;

  return (
    <motion.div
      className="absolute bottom-0 pointer-events-none"
      style={{
        left: x,
        transform: `scaleX(${flip ? -1 : 1}) scale(${scale})`,
        transformOrigin: "bottom center",
        filter: `blur(${blur}px)`,
        zIndex: Math.round((1 - depth) * 5) + 1,
      }}
      initial={{ opacity: 0, scaleY: 0.3 }}
      animate={{ opacity, scaleY: 1, rotate: sway }}
      transition={{ duration: 2.5, ease: "easeOut", delay: depth * 0.4 }}
    >
      <svg viewBox="0 0 200 600" width={200 * scale} height={600 * scale} fill="none">
        {/* Trunk */}
        <path
          d="M95 600 C90 500, 88 400, 100 300 C112 400, 110 500, 105 600Z"
          fill={`hsl(25, 30%, ${8 + depth * 8}%)`}
        />
        {/* Main branches */}
        <path d="M100 300 C60 240, 20 200, 10 150" stroke={`hsl(25, 25%, 12%)`} strokeWidth="6" fill="none" />
        <path d="M100 300 C140 240, 180 200, 190 150" stroke={`hsl(25, 25%, 12%)`} strokeWidth="6" fill="none" />
        <path d="M100 380 C55 320, 25 280, 5 240" stroke={`hsl(25, 25%, 10%)`} strokeWidth="5" fill="none" />
        <path d="M100 380 C145 320, 175 285, 195 240" stroke={`hsl(25, 25%, 10%)`} strokeWidth="5" fill="none" />
        {/* Foliage blobs */}
        <ellipse cx="10" cy="130" rx="50" ry="60" fill={`hsl(130, 40%, ${6 + depth * 5}%)`} />
        <ellipse cx="190" cy="130" rx="50" ry="60" fill={`hsl(130, 40%, ${6 + depth * 5}%)`} />
        <ellipse cx="100" cy="90" rx="65" ry="90" fill={`hsl(130, 45%, ${8 + depth * 5}%)`} />
        <ellipse cx="5" cy="210" rx="40" ry="50" fill={`hsl(125, 38%, ${5 + depth * 5}%)`} />
        <ellipse cx="195" cy="215" rx="40" ry="50" fill={`hsl(125, 38%, ${5 + depth * 5}%)`} />
        {/* Sub canopy */}
        <ellipse cx="55" cy="80" rx="35" ry="45" fill={`hsl(128, 42%, ${7 + depth * 4}%)`} />
        <ellipse cx="145" cy="80" rx="35" ry="45" fill={`hsl(128, 42%, ${7 + depth * 4}%)`} />
      </svg>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   GOD RAY — light shafts from above
   ═══════════════════════════════════════════════════════════ */
const GodRay = ({ x, angle, phase, delay }: { x: string; angle: number; phase: number; delay: number }) => (
  <motion.div
    className="absolute top-0 pointer-events-none"
    style={{
      left: x,
      width: "3px",
      height: "70vh",
      transformOrigin: "top center",
      transform: `rotate(${angle}deg)`,
      background: "linear-gradient(to bottom, rgba(255,220,120,0.18), rgba(255,200,80,0.06), transparent)",
      filter: "blur(18px)",
      zIndex: 4,
    }}
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: Math.min(phase * 0.8, 0.9), scaleY: 1 }}
    transition={{ duration: 3, delay, ease: "easeOut" }}
  />
);

/* ═══════════════════════════════════════════════════════════
   VEIL — silk-like flowing fabric panels
   ═══════════════════════════════════════════════════════════ */
const Veil = ({ index, totalVeils, phase, onAllDone }: {
  index: number; totalVeils: number; phase: number; onAllDone: () => void;
}) => {
  const isLast = index === totalVeils - 1;
  const offset = (index / totalVeils) * 100;
  const delay = index * 0.35 + 1.5;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 + index }}
      initial={{ x: 0 }}
      animate={phase >= 3 ? { x: index % 2 === 0 ? "-110%" : "110%" } : { x: 0 }}
      transition={{ duration: 1.8, delay: delay * 0.3, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => { if (isLast && phase >= 3) onAllDone(); }}
    >
      {/* Main veil fabric */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            ${100 + offset * 0.5}deg,
            rgba(220,200,140,${0.07 + index * 0.02}) 0%,
            rgba(180,160,100,${0.05 + index * 0.015}) 30%,
            rgba(255,235,180,${0.09 + index * 0.02}) 50%,
            rgba(200,180,120,${0.04}) 80%,
            transparent 100%
          )`,
          backdropFilter: "blur(1px)",
        }}
      />
      {/* Glowing edge */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          [index % 2 === 0 ? "right" : "left"]: 0,
          width: "2px",
          background: `linear-gradient(
            to bottom,
            transparent,
            rgba(255,215,100,${0.3 + index * 0.05}),
            rgba(255,235,150,${0.4 + index * 0.05}),
            rgba(255,215,100,${0.25}),
            transparent
          )`,
          filter: "blur(2px)",
        }}
      />
      {/* Ripple wave */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${50 + Math.sin(index) * 20}% 40%, rgba(255,220,130,0.06), transparent 60%)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ANNADATA LETTERS — piece-by-piece reveal
   ═══════════════════════════════════════════════════════════ */
const AnnadataTitle = ({ revealed, onHover }: { revealed: boolean; onHover: boolean }) => {
  const letters = "ANNADATA".split("");

  return (
    <div className="flex items-center justify-center select-none" style={{ gap: "0.05em" }}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="font-mukta font-black leading-none"
          style={{
            fontSize: "clamp(3.5rem, 13vw, 10.5rem)",
            color: "transparent",
            WebkitTextStroke: revealed ? "0px" : "1px rgba(212,185,80,0.3)",
            filter: onHover ? "blur(0px)" : undefined,
            display: "inline-block",
          }}
          initial={{ opacity: 0, y: 80, rotateX: -60, filter: "blur(20px)" }}
          animate={revealed ? {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            color: onHover ? "rgba(255,235,130,1)" : "rgba(212,185,80,1)",
            textShadow: onHover
              ? `0 0 40px rgba(255,220,80,0.9), 0 0 80px rgba(255,200,60,0.5), 0 0 120px rgba(255,180,40,0.3)`
              : `0 0 30px rgba(212,185,80,0.5), 0 0 60px rgba(180,155,50,0.25), 0 4px 0 rgba(0,0,0,0.5)`,
          } : {}}
          transition={{
            duration: 1.0,
            delay: i * 0.08 + 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const VineReveal = ({ onComplete }: LandingRevealProps) => {
  const [phase, setPhase] = useState(0);
  // 0 = black, 1 = nature awakens, 2 = god rays + atmosphere, 3 = veils part, 4 = title revealed, 5 = CTA
  const [titleRevealed, setTitleRevealed] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [veils] = useState(() => Array.from({ length: 5 }));

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const cx = e.clientX - window.innerWidth / 2;
    const cy = e.clientY - window.innerHeight / 2;
    mouseX.set(cx * 0.012);
    mouseY.set(cy * 0.012);
  }, [mouseX, mouseY]);

  // Orchestrate phases with timers
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => {
        setPhase(4);
        setTitleRevealed(true);
      }, 4200),
      setTimeout(() => {
        setPhase(5);
        setCtaVisible(true);
      }, 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#020402", zIndex: 9999 }}
      onMouseMove={handleMouseMove}
    >
      {/* ── LAYER 0: Base gradient background ── */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: phase >= 2
            ? "radial-gradient(ellipse at 50% 100%, #0d2a0a 0%, #050f03 40%, #020402 100%)"
            : "radial-gradient(ellipse at 50% 100%, #060e04 0%, #020402 60%, #020402 100%)"
        }}
        transition={{ duration: 3 }}
      />

      {/* ── LAYER 1: Atmospheric fog ── */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 2.5 }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 80%, rgba(40,70,20,0.4) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(20,45,10,0.6) 0%, transparent 50%)",
        }} />
      </motion.div>

      {/* ── LAYER 2: Ground mist ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "35%", zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.8 : 0 }}
        transition={{ duration: 3, delay: 0.5 }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${30 + i * 15}%`,
              background: `radial-gradient(ellipse at ${30 + i * 15}% 100%, rgba(80,120,50,${0.08 - i * 0.015}), transparent 70%)`,
              filter: "blur(20px)",
            }}
            animate={{ x: [0, i % 2 === 0 ? 20 : -20, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* ── LAYER 3: Particles ── */}
      <ParticleCanvas phase={phase} />

      {/* ── LAYER 4: God rays ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <>
            <GodRay x="25%" angle={8} phase={phase} delay={0} />
            <GodRay x="40%" angle={-3} phase={phase} delay={0.3} />
            <GodRay x="55%" angle={5} phase={phase} delay={0.6} />
            <GodRay x="70%" angle={-7} phase={phase} delay={0.2} />
            <GodRay x="35%" angle={12} phase={phase} delay={0.8} />
          </>
        )}
      </AnimatePresence>

      {/* ── LAYER 5: Warm sunrise bloom ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "15%", left: "50%",
          transform: "translateX(-50%)",
          width: "60vw", height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,190,60,0.12) 0%, rgba(255,150,30,0.05) 40%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: 5,
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.3 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      {/* ── LAYER 6: Trees — parallax with mouse ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: springX, y: springY, zIndex: 6 }}
      >
        {/* Far trees */}
        <TreeSilhouette x="2%" scale={0.6} depth={0.8} phase={phase} />
        <TreeSilhouette x="12%" scale={0.55} flip depth={0.85} phase={phase} />
        <TreeSilhouette x="75%" scale={0.65} depth={0.75} phase={phase} />
        <TreeSilhouette x="88%" scale={0.6} flip depth={0.8} phase={phase} />

        {/* Mid trees */}
        <TreeSilhouette x="-4%" scale={0.9} depth={0.45} phase={phase} />
        <TreeSilhouette x="20%" scale={0.8} flip depth={0.4} phase={phase} />
        <TreeSilhouette x="72%" scale={0.85} depth={0.42} phase={phase} />
        <TreeSilhouette x="92%" scale={0.9} flip depth={0.4} phase={phase} />

        {/* Foreground trees */}
        <TreeSilhouette x="-8%" scale={1.3} depth={0.1} phase={phase} />
        <TreeSilhouette x="82%" scale={1.25} flip depth={0.12} phase={phase} />
      </motion.div>

      {/* ── LAYER 7: Grass silhouette ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "18%", zIndex: 7 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: phase >= 1 ? 0.7 : 0, y: 0 }}
        transition={{ duration: 2, delay: 0.8 }}
      >
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,120 C0,120 80,60 120,80 C160,100 200,40 240,60 C280,80 320,30 360,50 C400,70 440,20 480,40 C520,60 560,10 600,30 C640,50 680,0 720,20 C760,40 800,0 840,15 C880,30 920,5 960,20 C1000,35 1040,10 1080,25 C1120,40 1160,15 1200,30 C1240,45 1280,20 1320,35 C1360,50 1400,30 1440,45 L1440,120 Z"
            fill="hsl(130, 40%, 5%)"
          />
          <path
            d="M0,120 C60,80 100,95 150,85 C200,75 250,90 320,80 C390,70 430,88 500,78 C570,68 620,85 700,75 C780,65 830,82 900,72 C970,62 1020,80 1100,70 C1180,60 1230,78 1300,68 C1350,62 1400,75 1440,68 L1440,120 Z"
            fill="hsl(130, 45%, 7%)"
          />
        </svg>
      </motion.div>

      {/* ── LAYER 8: Veils ── */}
      {phase >= 2 && veils.map((_, i) => (
        <Veil
          key={i}
          index={i}
          totalVeils={veils.length}
          phase={phase}
          onAllDone={() => {}}
        />
      ))}

      {/* ── LAYER 9: Center content ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-30"
        style={{ x: useSpring(mouseX, { stiffness: 20, damping: 15 }), y: useSpring(mouseY, { stiffness: 20, damping: 15 }) } as any}
      >
        {/* Title */}
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="cursor-default"
        >
          <AnnadataTitle revealed={titleRevealed} onHover={hovering} />
        </div>

        {/* Particle burst ring at reveal */}
        <AnimatePresence>
          {titleRevealed && (
            <motion.div
              className="absolute pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                width: 200, height: 200,
                borderRadius: "50%",
                border: "1px solid rgba(212,185,80,0.4)",
                boxShadow: "0 0 40px rgba(212,185,80,0.2)",
                zIndex: 31,
              }}
            />
          )}
        </AnimatePresence>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mt-6"
        >
          <p
            className="font-hind text-sm md:text-base tracking-[0.35em] uppercase mb-1"
            style={{ color: "rgba(220,190,100,0.65)" }}
          >
            Empowering those who feed the nation
          </p>
          <p className="font-hind text-xs" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
            Every decision — backed by data, not guesswork.
          </p>
        </motion.div>

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-12"
        >
          <motion.button
            onClick={onComplete}
            className="relative px-16 py-4 font-mukta font-bold text-sm uppercase tracking-[0.3em] overflow-hidden group"
            style={{
              background: "transparent",
              color: "rgba(212,185,80,0.9)",
              border: "1px solid rgba(212,185,80,0.25)",
            }}
            whileHover={{
              borderColor: "rgba(212,185,80,0.7)",
              color: "rgba(255,235,130,1)",
              boxShadow: "0 0 50px rgba(212,185,80,0.15), inset 0 0 30px rgba(212,185,80,0.05)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Animated fill on hover */}
            <motion.span
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, transparent, rgba(212,185,80,0.06), transparent)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">Enter Platform →</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── Vignette overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          zIndex: 28,
        }}
      />

      {/* ── SKIP ── */}
      <AnimatePresence>
        {phase < 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            onClick={onComplete}
            className="absolute top-6 right-8 font-mukta text-xs uppercase tracking-[0.3em] z-50"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VineReveal;
