
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AudioWaveform,
  CircleHelp,
  Command,
  Crosshair,
  Code2,
  Maximize2,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";

type Palette = "cyan" | "violet" | "matrix";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type ParticleCanvasProps = {
  density: number;
  distance: number;
  speed: number;
  palette: Palette;
  paused: boolean;
};

const palettes: Record<Palette, { main: string; secondary: string; glow: string }> = {
  cyan: {
    main: "56, 214, 255",
    secondary: "112, 130, 255",
    glow: "#38D6FF",
  },
  violet: {
    main: "174, 112, 255",
    secondary: "255, 92, 190",
    glow: "#AE70FF",
  },
  matrix: {
    main: "88, 255, 177",
    secondary: "56, 214, 255",
    glow: "#58FFB1",
  },
};

function ParticleCanvas({
  density,
  distance,
  speed,
  palette,
  paused,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let animationId = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const colors = palettes[palette];
    let particles: Particle[] = [];

    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 0.18 + Math.random() * 0.55;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: 0.8 + Math.random() * 1.7,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: density }, createParticle);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const clearPointer = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      if (paused) return;

      frame += 1;
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.52,
        height * 0.48,
        0,
        width * 0.52,
        height * 0.48,
        Math.max(width, height) * 0.7,
      );

      glow.addColorStop(0, "rgba(20, 44, 86, 0.22)");
      glow.addColorStop(1, "rgba(5, 10, 25, 0)");

      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        if (!particle) continue;

        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0 && dist < 145) {
            const force = ((145 - dist) / 145) * 0.075;
            particle.vx += (dx / dist) * force;
            particle.vy += (dy / dist) * force;
          }
        }

        particle.vx += (Math.random() - 0.5) * 0.006;
        particle.vy += (Math.random() - 0.5) * 0.006;

        const maxSpeed = 0.85 * speed;
        const velocity = Math.sqrt(
          particle.vx * particle.vx + particle.vy * particle.vy,
        );

        if (velocity > maxSpeed && velocity > 0) {
          particle.vx = (particle.vx / velocity) * maxSpeed;
          particle.vy = (particle.vy / velocity) * maxSpeed;
        }

        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
      }

      // Draw connections between nearby particles.
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];

        if (!a) continue;

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];

          if (!b) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distance) {
            const opacity = (1 - dist / distance) * 0.34;

            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(${colors.main}, ${opacity})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      }

      // Draw particle points.
      particles.forEach((particle, index) => {
        const pulse = 0.72 + Math.sin(frame * 0.025 + index) * 0.2;

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius * pulse,
          0,
          Math.PI * 2,
        );
        context.fillStyle = `rgba(${index % 4 === 0 ? colors.secondary : colors.main}, 0.9)`;
        context.shadowBlur = 9;
        context.shadowColor = colors.glow;
        context.fill();
        context.shadowBlur = 0;
      });

      // Cursor field.
      if (pointer.active) {
        const cursorGlow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          145,
        );

        cursorGlow.addColorStop(0, `rgba(${colors.main}, 0.10)`);
        cursorGlow.addColorStop(1, `rgba(${colors.main}, 0)`);

        context.fillStyle = cursorGlow;
        context.fillRect(
          pointer.x - 145,
          pointer.y - 145,
          290,
          290,
        );

        context.beginPath();
        context.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2);
        context.fillStyle = colors.glow;
        context.fill();
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", clearPointer);

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
    };
  }, [density, distance, speed, palette, paused]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-label="Interactive particle field. Move your pointer to repel nearby particles."
      role="img"
    />
  );
}

function App() {
  const [density, setDensity] = useState(105);
  const [distance, setDistance] = useState(135);
  const [speed, setSpeed] = useState(1);
  const [palette, setPalette] = useState<Palette>("cyan");
  const [paused, setPaused] = useState(false);

  const reset = () => {
    setDensity(105);
    setDistance(135);
    setSpeed(1);
    setPalette("cyan");
    setPaused(false);
  };

  const colors = palettes[palette];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Creative Digital Lab home">
          <span className="brand-mark">
            <AudioWaveform size={20} strokeWidth={1.8} />
          </span>
          <span className="brand-name">
            CREATIVE<span>LAB</span>
            <small>INDEPENDENT EXPERIMENTS</small>
          </span>
        </a>

        <div className="topbar-center">
          <span className="live-dot" />
          ALL SYSTEMS OPERATIONAL
        </div>

        <a
          className="github-link"
          href="https://github.com/johndavidjeevaraj-design/creative-digital-lab"
          target="_blank"
          rel="noreferrer"
        >
          <Code2 size={16} />
          <span>SOURCE CODE</span>
          <ArrowUpRight size={14} />
        </a>
      </header>

      <section className="intro" id="home">
        <div className="intro-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            EXPERIMENT 001 / GENERATIVE SYSTEMS
          </div>

          <h1>
            PARTICLE
            <br />
            <span>PLAYGROUND<span className="title-period">.</span></span>
          </h1>

          <p className="intro-description">
            An interactive study of motion, proximity, and emergent patterns.
            Move your cursor through the field and watch the system respond.
          </p>

          <div className="intro-tags">
            <span><span className="tag-dot" /> CANVAS API</span>
            <span><span className="tag-dot" /> REAL-TIME RENDERING</span>
            <span><span className="tag-dot" /> POINTER INTERACTION</span>
          </div>
        </div>

        <div className="intro-index">
          <div className="index-symbol"><Crosshair size={24} /></div>
          <span className="index-label">SYSTEM ID</span>
          <span className="index-value">CDL—001</span>
          <div className="index-divider" />
          <span className="index-label">BUILD</span>
          <span className="index-value">V.1.0.0</span>
        </div>
      </section>

      <section className="workspace" aria-label="Particle playground workspace">
        <div className="simulation-panel">
          <div className="panel-toolbar">
            <div className="panel-heading">
              <span className="panel-status" />
              <span>LIVE SIMULATION</span>
              <span className="toolbar-separator">/</span>
              <span className="muted">PARTICLE FIELD</span>
            </div>
            <div className="toolbar-actions">
              <span className="frame-label">REALTIME <span>●</span></span>
              <button
                className="icon-button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Resume simulation" : "Pause simulation"}
                title={paused ? "Resume" : "Pause"}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
              <button
                className="icon-button"
                onClick={reset}
                aria-label="Reset simulation controls"
                title="Reset controls"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div
            className="simulation-stage"
            style={{ "--active-glow": colors.glow } as CSSProperties}
          >
            <div className="stage-grid" />
            <div className="stage-orb stage-orb-one" />
            <div className="stage-orb stage-orb-two" />

            <ParticleCanvas
              density={density}
              distance={distance}
              speed={speed}
              palette={palette}
              paused={paused}
            />

            <div className="stage-coordinate coordinate-top">
              <span>FIELD / 01</span>
              <span>X: 000.00 · Y: 000.00</span>
            </div>

            <div className="stage-coordinate coordinate-bottom">
              <span>INTERACTION FIELD</span>
              <span>MOVE POINTER TO INTERACT <MousePointer2 size={12} /></span>
            </div>

            <div className="stage-crosshair crosshair-one" />
            <div className="stage-crosshair crosshair-two" />

            {paused && (
              <div className="paused-overlay">
                <Pause size={18} />
                SIMULATION PAUSED
              </div>
            )}
          </div>

          <div className="simulation-footer">
            <div className="simulation-stat">
              <span className="stat-icon"><Activity size={14} /></span>
              <span className="stat-label">PARTICLES</span>
              <strong>{density.toString().padStart(3, "0")}</strong>
            </div>
            <div className="simulation-stat">
              <span className="stat-icon"><Zap size={14} /></span>
              <span className="stat-label">FIELD RADIUS</span>
              <strong>{distance}<small> PX</small></strong>
            </div>
            <div className="simulation-stat">
              <span className="stat-icon"><AudioWaveform size={14} /></span>
              <span className="stat-label">MOTION SPEED</span>
              <strong>{speed.toFixed(1)}<small>×</small></strong>
            </div>
            <div className="simulation-state">
              <span className={paused ? "state-indicator paused" : "state-indicator"} />
              {paused ? "PAUSED" : "RUNNING"}
            </div>
          </div>
        </div>

        <aside className="controls-panel">
          <div className="controls-header">
            <div className="controls-heading">
              <SlidersHorizontal size={17} />
              <span>PARAMETERS</span>
            </div>
            <span className="controls-id">SYS.01</span>
          </div>

          <p className="controls-description">
            Tune the field. Changes are rendered in real time.
          </p>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="density">Particle density</label>
              <output>{density}</output>
            </div>
            <input
              id="density"
              className="range-input"
              type="range"
              min="40"
              max="180"
              step="5"
              value={density}
              onChange={(event) => setDensity(Number(event.target.value))}
              style={{ "--range-progress": `${((density - 40) / 140) * 100}%`, "--range-color": colors.glow } as CSSProperties}
            />
            <div className="range-labels"><span>SPARSE</span><span>DENSE</span></div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="distance">Connection distance</label>
              <output>{distance}<small>px</small></output>
            </div>
            <input
              id="distance"
              className="range-input"
              type="range"
              min="60"
              max="220"
              step="5"
              value={distance}
              onChange={(event) => setDistance(Number(event.target.value))}
              style={{ "--range-progress": `${((distance - 60) / 160) * 100}%`, "--range-color": colors.glow } as CSSProperties}
            />
            <div className="range-labels"><span>LOCAL</span><span>WIDE</span></div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="speed">Motion speed</label>
              <output>{speed.toFixed(1)}<small>×</small></output>
            </div>
            <input
              id="speed"
              className="range-input"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              style={{ "--range-progress": `${((speed - 0.2) / 2.3) * 100}%`, "--range-color": colors.glow } as CSSProperties}
            />
            <div className="range-labels"><span>SLOW</span><span>FAST</span></div>
          </div>

          <div className="control-divider" />

          <div className="palette-heading">
            <span>COLOR FREQUENCY</span>
            <CircleHelp size={14} />
          </div>

          <div className="palette-options">
            <button
              className={`palette-button ${palette === "cyan" ? "selected" : ""}`}
              onClick={() => setPalette("cyan")}
              aria-pressed={palette === "cyan"}
            >
              <span className="palette-swatch cyan-swatch" />
              <span>ARCTIC</span>
              {palette === "cyan" && <span className="palette-check">✓</span>}
            </button>
            <button
              className={`palette-button ${palette === "violet" ? "selected" : ""}`}
              onClick={() => setPalette("violet")}
              aria-pressed={palette === "violet"}
            >
              <span className="palette-swatch violet-swatch" />
              <span>ULTRAVIOLET</span>
              {palette === "violet" && <span className="palette-check">✓</span>}
            </button>
            <button
              className={`palette-button ${palette === "matrix" ? "selected" : ""}`}
              onClick={() => setPalette("matrix")}
              aria-pressed={palette === "matrix"}
            >
              <span className="palette-swatch matrix-swatch" />
              <span>BIOSPHERE</span>
              {palette === "matrix" && <span className="palette-check">✓</span>}
            </button>
          </div>

          <button className="reset-button" onClick={reset}>
            <RotateCcw size={14} />
            RESET PARAMETERS
            <span>↵</span>
          </button>

          <div className="control-hint">
            <Sparkles size={14} />
            <p>Tip: move your pointer slowly to sculpt the particle field.</p>
          </div>
        </aside>
      </section>

      <section className="bottom-strip">
        <div className="bottom-note">
          <span className="bottom-index">001</span>
          <div>
            <strong>EMERGENT BY DESIGN.</strong>
            <p>Simple rules. Unexpected patterns.</p>
          </div>
        </div>

        <div className="bottom-tech">
          <span>BUILT WITH</span>
          <strong>REACT</strong>
          <span className="tech-dot">/</span>
          <strong>TYPESCRIPT</strong>
          <span className="tech-dot">/</span>
          <strong>CANVAS 2D</strong>
        </div>

        <a className="next-experiment" href="#home" onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          EXPLORE THE FIELD <ArrowDownRight size={15} />
        </a>
      </section>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} CREATIVE DIGITAL LAB</span>
        <span>AN OPEN EXPERIMENT IN INTERACTION</span>
        <span className="footer-coordinates"><Command size={12} /> MADE TO EXPLORE</span>
      </footer>

      <button
        className="floating-help"
        title="About this experiment"
        aria-label="About this experiment"
        onClick={() => window.alert("Experiment 001: Particle Playground. Move your pointer over the simulation to influence nearby particles. Use the parameters panel to change density, connection distance, speed, and color palette.")}
      >
        <Maximize2 size={15} />
      </button>
    </main>
  );
}

export default App;
