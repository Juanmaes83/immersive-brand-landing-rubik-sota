import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import {
  Cpu,
  Globe,
  Menu,
  Maximize2,
  Rocket,
  Shield,
  Snowflake,
  Terminal,
  X,
  Zap,
} from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

type InViewTuple<T extends HTMLElement> = [React.RefObject<T | null>, boolean];
type SplineTarget = { x: number; scale: number };

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateSplineTarget(progress: number): SplineTarget {
  const p = clamp(progress);
  const hero = { x: 28, scale: 1.1 };
  const features = { x: -30, scale: 1.05 };
  const process = { x: 30, scale: 1.1 };

  if (p <= 0.5) {
    const t = p / 0.5;
    return {
      x: mix(hero.x, features.x, t),
      scale: mix(hero.scale, features.scale, t),
    };
  }

  const t = (p - 0.5) / 0.5;
  return {
    x: mix(features.x, process.x, t),
    scale: mix(features.scale, process.scale, t),
  };
}

function useOnceInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): InViewTuple<T> {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
        ...options,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options, seen]);

  return [ref, seen];
}

function GlobalStyles() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --brand-orange: #F27D26;
          --bg: #0a0a0a;
          --text: #f5f5f5;
          --muted: #888888;
          --stroke: #1f1f1f;
          --font-heading: 'Orbitron', sans-serif;
          --font-body: 'Space Grotesk', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        html {
          background: var(--bg);
          scroll-behavior: smooth;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
        }

        * {
          box-sizing: border-box;
        }

        .font-heading {
          font-family: var(--font-heading);
        }

        .font-body {
          font-family: var(--font-body);
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        .gradient-display {
          background-image: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.72) 55%, rgba(255,255,255,1) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .noise-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .spline-shell {
          will-change: transform;
          transform-origin: center center;
          contain: layout paint style;
        }

        .spline-shell canvas {
          width: 100% !important;
          height: 100% !important;
        }

        ::selection {
          background: rgba(242, 125, 38, 0.22);
          color: white;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        ::-webkit-scrollbar-thumb {
          background: #1f1f1f;
          border-radius: 999px;
          border: 2px solid #0a0a0a;
        }
      `}</style>
    </>
  );
}

function SectionHeader({
  label,
  lineClassName,
  titleTop,
  titleBottom,
}: {
  label: string;
  lineClassName?: string;
  titleTop: string;
  titleBottom: string;
}) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="mb-4 flex items-center gap-4">
        <div className={`h-px w-14 bg-white/20 ${lineClassName ?? ""}`} />
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">
          {label}
        </span>
      </div>

      <div className="font-heading uppercase leading-[0.88] tracking-[-0.04em]">
        <div className="gradient-display text-[clamp(2.3rem,6vw,5rem)]">{titleTop}</div>
        <div className="text-[clamp(2.3rem,6vw,5rem)] text-white">{titleBottom}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  stat,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  stat: string;
  delay?: number;
}) {
  const [ref, visible] = useOnceInView<HTMLDivElement>({ threshold: 0.18 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.015)_inset] backdrop-blur-sm"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--brand-orange)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-mono text-[12px] uppercase tracking-[0.24em] text-white/45">{stat}</div>
      <h3 className="mt-3 text-lg font-medium leading-snug text-white/92">{title}</h3>
    </motion.div>
  );
}

function ProcessStep({
  icon: Icon,
  title,
  tags,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tags: string[];
  index: string;
}) {
  const [ref, visible] = useOnceInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-16"
    >
      <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--brand-orange)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">{index}</div>
      <h3 className="text-2xl text-white/95">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/68"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  const [ref, visible] = useOnceInView<HTMLDivElement>({ threshold: 0.25 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
    >
      <div className="font-heading text-4xl uppercase tracking-[-0.06em] text-white md:text-5xl">{value}</div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/48">{label}</div>
    </motion.div>
  );
}

type Lang = "en" | "es";

type Copy = {
  nav: {
    home: string;
    features: string;
    process: string;
    stats: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    description: string;
    signature: string;
  };
  features: {
    label: string;
    titleTop: string;
    titleBottom: string;
    cards: Array<{ title: string; stat: string }>;
  };
  process: {
    label: string;
    titleTop: string;
    titleBottom: string;
    steps: Array<{ index: string; title: string; tags: string[] }>;
  };
  stats: {
    label: string;
    titleTop: string;
    titleBottom: string;
    items: Array<{ value: string; label: string }>;
  };
  misc: {
    loading: string;
    toggleMenu: string;
    language: string;
  };
};

const copy: Record<Lang, Copy> = {
  en: {
    nav: {
      home: "Home",
      features: "Features",
      process: "Process",
      stats: "Stats",
      cta: "Get Started",
    },
    hero: {
      eyebrow: "Developer Infrastructure / Scroll-Native 3D / Minimal Systems",
      titleTop: "Automation",
      titleBottom: "Machines *",
      description:
        "Build the web like an operating system. High-speed runtime, edge-native delivery, and production workflows shaped for teams shipping fast.",
      signature: "IDEA BY RUBIK SOTA 629554870",
    },
    features: {
      label: "Core Systems",
      titleTop: "Built for",
      titleBottom: "Performance",
      cards: [
        { title: "Intelligent Runtime", stat: "<12ms Response" },
        { title: "Edge Distribution", stat: "200+ Nodes" },
        { title: "Zero-Trust Security", stat: "256-bit Encryption" },
      ],
    },
    process: {
      label: "Workflow",
      titleTop: "From Idea",
      titleBottom: "To Production",
      steps: [
        {
          index: "01",
          title: "Initialize & Develop",
          tags: ["TypeScript + Vite", "HMR < 50ms"],
        },
        {
          index: "02",
          title: "Deploy & Monitor",
          tags: ["Zero-config CI/CD", "Live metrics"],
        },
      ],
    },
    stats: {
      label: "Stats",
      titleTop: "Measured for",
      titleBottom: "Scale",
      items: [
        { value: "99.99%", label: "Service Uptime" },
        { value: "3.2x", label: "Pipeline Throughput" },
        { value: "24/7", label: "Observability" },
      ],
    },
    misc: {
      loading: "Loading scene",
      toggleMenu: "Toggle menu",
      language: "Language",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      features: "Sistemas",
      process: "Proceso",
      stats: "Métricas",
      cta: "Empezar",
    },
    hero: {
      eyebrow: "Infraestructura para developers / 3D nativo al scroll / Sistemas mínimos",
      titleTop: "Automation",
      titleBottom: "Machines *",
      description:
        "Construye la web como si fuera un sistema operativo. Runtime de alta velocidad, entrega edge-native y flujos de producción pensados para equipos que lanzan rápido.",
      signature: "IDEA BY RUBIK SOTA 629554870",
    },
    features: {
      label: "Sistemas Base",
      titleTop: "Diseñado para",
      titleBottom: "Rendimiento",
      cards: [
        { title: "Runtime Inteligente", stat: "<12ms Respuesta" },
        { title: "Distribución Edge", stat: "200+ Nodos" },
        { title: "Seguridad Zero-Trust", stat: "Cifrado 256-bit" },
      ],
    },
    process: {
      label: "Flujo",
      titleTop: "De la Idea",
      titleBottom: "A Producción",
      steps: [
        {
          index: "01",
          title: "Inicializa y Desarrolla",
          tags: ["TypeScript + Vite", "HMR < 50ms"],
        },
        {
          index: "02",
          title: "Despliega y Monitoriza",
          tags: ["CI/CD sin configuración", "Métricas en vivo"],
        },
      ],
    },
    stats: {
      label: "Métricas",
      titleTop: "Medido para",
      titleBottom: "Escalar",
      items: [
        { value: "99.99%", label: "Disponibilidad" },
        { value: "3.2x", label: "Rendimiento del Pipeline" },
        { value: "24/7", label: "Observabilidad" },
      ],
    },
    misc: {
      loading: "Cargando escena",
      toggleMenu: "Abrir menú",
      language: "Idioma",
    },
  },
};

export default function AutomationMachinesLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const splineShellRef = useRef<HTMLDivElement | null>(null);
  const splineTargetRef = useRef<any>(null);
  const touchStartY = useRef(0);

  const t = copy[lang];

  const { scrollY, scrollYProgress } = useScroll({ trackContentSize: true });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.2,
  });
  const progressBar = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.18,
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useMotionValueEvent(scrollY, "change", (value) => {
    setNavSolid(value > 20);
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const shell = splineShellRef.current;
    if (!shell) return;

    const { x, scale } = interpolateSplineTarget(latest);
    shell.style.transform = `translate3d(${x}%, 0, 0) scale(${scale})`;

    const target = splineTargetRef.current;
    if (target?.rotation) {
      target.rotation.y = latest * Math.PI * 2;
    }
  });

  useEffect(() => {
    const shell = splineShellRef.current;
    if (!shell) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: "auto" });
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = touchStartY.current - currentY;
      touchStartY.current = currentY;
      event.preventDefault();
      window.scrollBy({ top: delta * 1.1, behavior: "auto" });
    };

    shell.addEventListener("wheel", onWheel, { passive: false });
    shell.addEventListener("touchstart", onTouchStart, { passive: true });
    shell.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      shell.removeEventListener("wheel", onWheel as EventListener);
      shell.removeEventListener("touchstart", onTouchStart as EventListener);
      shell.removeEventListener("touchmove", onTouchMove as EventListener);
    };
  }, []);

  const navItems = useMemo(
    () => [
      { label: t.nav.home, href: "#home" },
      { label: t.nav.features, href: "#features" },
      { label: t.nav.process, href: "#process" },
      { label: t.nav.stats, href: "#stats" },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <GlobalStyles />

      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-px origin-left bg-white/40"
        style={{ scaleX: progressBar }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          navSolid ? "bg-black/70 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a
            href="#home"
            className="pointer-events-auto font-heading text-sm uppercase tracking-[0.32em] text-white md:text-base"
          >
            Automation
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.24em] text-white/50 transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setLang("es")}
                aria-label="Cambiar a español"
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  lang === "es" ? "bg-white text-black" : "text-white/55 hover:text-white"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-label="Switch to English"
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  lang === "en" ? "bg-white text-black" : "text-white/55 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="#process"
              className="pointer-events-auto rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.02]"
            >
              {t.nav.cta}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] md:hidden"
            aria-label={t.misc.toggleMenu}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/8 bg-black/92 px-5 py-5 backdrop-blur-xl md:hidden">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                {t.misc.language}
              </span>
              <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setLang("es")}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                    lang === "es" ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                    lang === "en" ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="pointer-events-auto font-mono text-[12px] uppercase tracking-[0.24em] text-white/70"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#process"
                onClick={() => setMenuOpen(false)}
                className="pointer-events-auto mt-2 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
              >
                {t.nav.cta}
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden noise-grid opacity-70" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_65%_30%,rgba(242,125,38,0.08),transparent_30%)]" />

      <div className="fixed inset-0 z-20 overflow-hidden">
        <div
          ref={splineShellRef}
          className="spline-shell absolute inset-y-0 right-[-12vw] h-full w-[88vw] md:w-[72vw]"
          style={{ transform: "translate3d(28%, 0, 0) scale(1.1)" }}
        >
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
                  {t.misc.loading}
                </div>
              </div>
            }
          >
            <Spline
              scene="https://prod.spline.design/PIgTjpRFA03yfLyK/scene.splinecode"
              onLoad={(app: any) => {
                const candidate =
                  app.findObjectByName?.("Automation") ??
                  app.findObjectByName?.("Scene") ??
                  app.findObjectByName?.("Root") ??
                  app._scene?.children?.[0] ??
                  null;

                splineTargetRef.current = candidate;
              }}
            />
          </Suspense>
        </div>
      </div>

      <main className="relative isolate">
        <section
          id="home"
          className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-5 md:px-8"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl text-center"
            >
              <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">
                {t.hero.eyebrow}
              </div>

              <h1 className="font-heading text-[clamp(3.4rem,10vw,8rem)] uppercase leading-[0.82] tracking-[-0.06em]">
                <span className="gradient-display block">{t.hero.titleTop}</span>
                <span className="block text-white">{t.hero.titleBottom}</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-balance text-base font-light leading-7 text-white/70 md:text-xl md:leading-8">
                {t.hero.description}
              </p>

              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.34em] text-white/38 md:text-[11px]">
                {t.hero.signature}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex items-center justify-center gap-4"
              >
                {[Snowflake, Maximize2, Zap].map((Icon, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-sm"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="pointer-events-none relative z-30 flex min-h-screen items-center px-5 py-28 md:px-8"
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end">
            <div className="w-full md:w-[55%]">
              <SectionHeader
                label={t.features.label}
                titleTop={t.features.titleTop}
                titleBottom={t.features.titleBottom}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FeatureCard icon={Cpu} title={t.features.cards[0].title} stat={t.features.cards[0].stat} delay={0} />
                <FeatureCard icon={Globe} title={t.features.cards[1].title} stat={t.features.cards[1].stat} delay={0.08} />
                <FeatureCard
                  icon={Shield}
                  title={t.features.cards[2].title}
                  stat={t.features.cards[2].stat}
                  delay={0.16}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="process"
          className="pointer-events-none relative z-30 flex min-h-screen items-center px-5 py-28 md:px-8"
        >
          <div className="mx-auto flex w-full max-w-7xl justify-start">
            <div className="w-full md:w-[50%]">
              <SectionHeader
                label={t.process.label}
                titleTop={t.process.titleTop}
                titleBottom={t.process.titleBottom}
              />

              <div className="relative space-y-12">
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-[21px] top-4 h-[calc(100%-2rem)] w-px origin-top bg-gradient-to-b from-white/30 via-white/20 to-white/5"
                />

                <ProcessStep
                  index={t.process.steps[0].index}
                  icon={Terminal}
                  title={t.process.steps[0].title}
                  tags={t.process.steps[0].tags}
                />

                <ProcessStep
                  index={t.process.steps[1].index}
                  icon={Rocket}
                  title={t.process.steps[1].title}
                  tags={t.process.steps[1].tags}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="stats"
          className="pointer-events-none relative z-30 px-5 pb-24 pt-8 md:px-8 md:pb-32"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeader label={t.stats.label} titleTop={t.stats.titleTop} titleBottom={t.stats.titleBottom} />

            <div className="grid gap-4 md:grid-cols-3">
              <StatBlock value={t.stats.items[0].value} label={t.stats.items[0].label} />
              <StatBlock value={t.stats.items[1].value} label={t.stats.items[1].label} />
              <StatBlock value={t.stats.items[2].value} label={t.stats.items[2].label} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
