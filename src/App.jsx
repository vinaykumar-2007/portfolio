import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#050505",
  violet: "#7C3AED",
  indigo: "#4F46E5",
  blue: "#2563EB",
  electricBlue: "#3B82F6",
  purple: "#9333EA",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  neon: "rgba(139,92,246,0.5)",
};

// ─── Utility: Animated Counter ───────────────────────────────────────────────
function Counter({ end, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Utility: Reveal on scroll ────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Aurora Background ────────────────────────────────────────────────────────
function Aurora() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "-20%", left: "-10%", width: "70%", height: "70%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
        animation: "aurora1 8s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "-15%", width: "60%", height: "60%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)",
        animation: "aurora2 10s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "20%", width: "65%", height: "65%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(147,51,234,0.1) 0%, transparent 70%)",
        animation: "aurora3 12s ease-in-out infinite alternate",
      }} />
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: `rgba(167,139,250,${p.opacity})`,
          animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav({ active, setActive }) {
  const links = ["hero", "journey", "about", "skills", "project", "certifications", "contact"];
  const labels = { hero: "Home", journey: "Journey", about: "About", skills: "Skills", project: "Project", certifications: "Certs", contact: "Contact" };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActive(id);
  };

  return (
    <nav style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 100,
      background: "rgba(5,5,5,0.7)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 100,
      padding: "8px 20px",
      display: "flex", gap: 4,
    }}>
      {links.map(id => (
        <button key={id} onClick={() => scrollTo(id)} style={{
          background: active === id ? "rgba(124,58,237,0.3)" : "transparent",
          border: active === id ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent",
          color: active === id ? "#c4b5fd" : "rgba(255,255,255,0.5)",
          borderRadius: 100,
          padding: "5px 14px",
          fontSize: 12,
          fontWeight: active === id ? 600 : 400,
          cursor: "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.03em",
        }}>
          {labels[id]}
        </button>
      ))}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero({ setActive }) {
  const [textIdx, setTextIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const texts = ["Machine Learning Enthusiast", "Deep Learning Learner", "Problem Solver", "Future AI Engineer"];

  useEffect(() => {
    const current = texts[textIdx];
    let timeout;
    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, textIdx]);

  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", position: "relative", padding: "120px 24px 80px",
    }} onMouseMove={null}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(124,58,237,0.15) 0%, transparent 60%)`,
        transition: "background 0.3s ease",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
        <div style={{
          display: "inline-block",
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 100,
          padding: "6px 18px",
          fontSize: 12,
          color: "#c4b5fd",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 32,
          animation: "fadeInDown 0.8s ease",
        }}>
          AI Engineer Aspirant · VIT-AP University
        </div>

        <h1 style={{
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 800,
          lineHeight: 1.05,
          margin: "0 0 24px",
          background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "fadeInDown 0.8s ease 0.1s both",
          letterSpacing: "-0.02em",
        }}>
          Elusuri<br />Vinay Kumar
        </h1>

        <div style={{
          fontSize: "clamp(18px, 3vw, 28px)",
          color: "rgba(255,255,255,0.5)",
          marginBottom: 48,
          height: 40,
          animation: "fadeInDown 0.8s ease 0.2s both",
          fontWeight: 300,
        }}>
          <span style={{ color: "#a78bfa" }}>{displayed}</span>
          <span style={{ animation: "blink 1s step-end infinite", color: "#7c3aed" }}>|</span>
        </div>

        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          animation: "fadeInDown 0.8s ease 0.3s both",
        }}>
          <button onClick={() => document.getElementById("project")?.scrollIntoView({ behavior: "smooth" })} style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "none", borderRadius: 100,
            padding: "14px 32px",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 0 60px rgba(124,58,237,0.6)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 40px rgba(124,58,237,0.4)"; }}>
            View Projects →
          </button>

          <a href="https://github.com/vinaykumar-2007" target="_blank" rel="noreferrer" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 100,
            padding: "14px 32px",
            color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 500,
            textDecoration: "none",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s",
            display: "inline-block",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"; e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
            GitHub ↗
          </a>

          <a href="mailto:vinaykumar@example.com" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 100,
            padding: "14px 32px",
            color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 500,
            textDecoration: "none",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s",
            display: "inline-block",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"; e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
            Contact Me
          </a>
        </div>

        <div style={{
          display: "flex", gap: 48, justifyContent: "center", marginTop: 80,
          animation: "fadeInDown 0.8s ease 0.5s both",
        }}>
          {[["8.96", "CGPA"], ["6+", "Certifications"], ["40+", "LeetCode"], ["3", "GitHub Repos"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#c4b5fd" }}>{val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Journey Timeline ─────────────────────────────────────────────────────────
function Journey() {
  const events = [
    { year: "2024", label: "Started B.Tech AI & ML", desc: "Enrolled at VIT-AP University, beginning the journey into Artificial Intelligence and Machine Learning.", icon: "🎓", color: "#7c3aed" },
    { year: "2025", label: "Obstacle Detection System", desc: "Built a real-world AI project to assist visually impaired individuals using computer vision and deep learning.", icon: "👁️", color: "#4f46e5" },
    { year: "2025", label: "Joined Dhruva Club", desc: "Became part of the Dhruva Club Design Team, contributing to creative and technical initiatives.", icon: "🎨", color: "#2563eb" },
    { year: "2026", label: "DSA & ML Focus", desc: "Deepened expertise in Data Structures and Algorithms while advancing Machine Learning knowledge.", icon: "🧠", color: "#0ea5e9" },
    { year: "Future", label: "AI Engineer", desc: "Working towards a full-time role as an AI Engineer, contributing to cutting-edge AI systems.", icon: "🚀", color: "#8b5cf6" },
  ];

  return (
    <section id="journey" style={{ padding: "120px 24px", maxWidth: 800, margin: "0 auto" }}>
      <Reveal>
        <SectionHeader eyebrow="My Path" title="The Journey" subtitle="Every milestone, every step forward." />
      </Reveal>

      <div style={{ position: "relative", marginTop: 64 }}>
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0, width: 1,
          background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.6) 10%, rgba(124,58,237,0.6) 90%, transparent)",
          transform: "translateX(-50%)",
        }} />

        {events.map((ev, i) => (
          <Reveal key={ev.year + ev.label} delay={i * 100}>
            <div style={{
              display: "flex",
              justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
              marginBottom: 48,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", left: "50%", top: 24,
                width: 14, height: 14,
                borderRadius: "50%",
                background: ev.color,
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 20px ${ev.color}`,
                border: "2px solid rgba(255,255,255,0.2)",
                zIndex: 2,
              }} />

              <div style={{
                width: "43%",
                [i % 2 === 0 ? "marginRight" : "marginLeft"]: "7%",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "24px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
                cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${ev.color}40`; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{ev.icon}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                    color: ev.color, textTransform: "uppercase",
                  }}>{ev.year}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{ev.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{ev.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 8 }}>
      <div style={{
        display: "inline-block",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
        textTransform: "uppercase", color: "#7c3aed", marginBottom: 16,
      }}>{eyebrow}</div>
      <h2 style={{
        fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
        background: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        margin: "0 0 16px", letterSpacing: "-0.02em",
      }}>{title}</h2>
      {subtitle && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function About() {
  const stats = [
    { val: 8.96, suffix: "", label: "CGPA", prefix: "" },
    { val: 6, suffix: "+", label: "Certifications", prefix: "" },
    { val: 40, suffix: "+", label: "LeetCode Solved", prefix: "" },
    { val: 3, suffix: "", label: "GitHub Repos", prefix: "" },
  ];

  return (
    <section id="about" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Who I Am" title="About Me" subtitle="Driven by curiosity, powered by code." /></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 64 }}>
        <Reveal delay={100}>
          <div style={{
            gridColumn: "span 1",
            background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.04))",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: 24,
            padding: 40,
            height: "100%",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, marginBottom: 24,
              boxShadow: "0 0 40px rgba(124,58,237,0.4)",
            }}>⚡</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Elusuri Vinay Kumar</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: 14, margin: 0 }}>
              B.Tech student in Artificial Intelligence and Machine Learning at VIT-AP University. Passionate about building systems that genuinely help people — from obstacle detection for visually impaired users to exploring the frontiers of deep learning.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["AI & ML", "Deep Learning", "DSA", "Open Source"].map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 100,
                  background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)",
                  color: "#c4b5fd", fontWeight: 600, letterSpacing: "0.05em",
                }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <a href="https://github.com/vinaykumar-2007" target="_blank" rel="noreferrer" style={linkStyle}>GitHub ↗</a>
              <a href="https://www.linkedin.com/in/vinayelusuri" target="_blank" rel="noreferrer" style={linkStyle}>LinkedIn ↗</a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "24px",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"; e.currentTarget.style.background = "rgba(124,58,237,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#c4b5fd", lineHeight: 1 }}>
                  {s.prefix}{s.label === "CGPA"
  ? s.val.toFixed(2)
  : <Counter end={s.val} duration={1200} />
}{s.suffix}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: 24, flexGrow: 1,
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Focus Areas</div>
            {["Data Structures & Algorithms", "Machine Learning", "Deep Learning", "Open Source Contribution"].map((area, i) => (
              <div key={area} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{area}</span>
                  <span style={{ fontSize: 12, color: "#7c3aed" }}>{[75, 80, 65, 60][i]}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${[75, 80, 65, 60][i]}%`,
                    background: `linear-gradient(90deg, #7c3aed, #4f46e5)`,
                    borderRadius: 10,
                    boxShadow: "0 0 8px rgba(124,58,237,0.5)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const linkStyle = {
  fontSize: 12, color: "#7c3aed",
  textDecoration: "none", padding: "6px 16px",
  border: "1px solid rgba(124,58,237,0.3)",
  borderRadius: 100, transition: "all 0.2s",
};

// ─── Skills Section ───────────────────────────────────────────────────────────
function Skills() {
  const groups = [
    {
      label: "Languages", icon: "{ }",
      skills: [
        { name: "Python", level: 85, icon: "🐍" },
        { name: "Java", level: 75, icon: "☕" },
        { name: "C", level: 70, icon: "⚡" },
        { name: "SQL", level: 72, icon: "🗄️" },
        { name: "MATLAB", level: 65, icon: "📊" },
      ],
    },
    {
      label: "AI & ML", icon: "🧠",
      skills: [
        { name: "Machine Learning", level: 78, icon: "🤖" },
        { name: "Deep Learning", level: 68, icon: "🧬" },
        { name: "Computer Vision", level: 70, icon: "👁️" },
        { name: "Data Analysis", level: 75, icon: "📈" },
      ],
    },
    {
      label: "Tools", icon: "🛠",
      skills: [
        { name: "Jupyter", level: 85, icon: "📓" },
        { name: "RStudio", level: 65, icon: "📉" },
        { name: "Git", level: 72, icon: "🌿" },
        { name: "Kaggle", level: 70, icon: "🏆" },
      ],
    },
  ];

  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <section id="skills" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Capabilities" title="Skills" subtitle="Technologies I work with." /></Reveal>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
        {groups.map((g, i) => (
          <button key={g.label} onClick={() => setActiveGroup(i)} style={{
            background: activeGroup === i ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${activeGroup === i ? "transparent" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 100, padding: "10px 24px",
            color: activeGroup === i ? "#fff" : "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "all 0.3s",
          }}>
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {groups[activeGroup].skills.map((skill, i) => (
          <Reveal key={skill.name} delay={i * 80}>
            <SkillCard skill={skill} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SkillCard({ skill }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, padding: 24,
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
      }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{skill.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 16 }}>{skill.name}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: hovered ? `${skill.level}%` : "0%",
          background: "linear-gradient(90deg, #7c3aed, #818cf8)",
          borderRadius: 10, transition: "width 0.8s ease",
          boxShadow: "0 0 10px rgba(124,58,237,0.6)",
        }} />
      </div>
      <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 8, textAlign: "right", fontWeight: 700 }}>{skill.level}%</div>
    </div>
  );
}

// ─── Project Showcase ─────────────────────────────────────────────────────────
function Project() {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "solution", "tech", "impact"];

  const content = {
    overview: {
      title: "The Problem",
      text: "Over 285 million people worldwide live with visual impairment. Navigation and obstacle avoidance in unfamiliar environments remains a critical daily challenge, often requiring constant human assistance or expensive specialized equipment.",
    },
    solution: {
      title: "The Solution",
      text: "An intelligent real-time obstacle detection system using computer vision and deep learning. The system processes video frames, identifies obstacles at varying distances, and delivers audio alerts — giving users spatial awareness and independence.",
    },
    tech: {
      title: "Tech Stack",
      items: ["Python", "OpenCV", "Deep Learning", "Computer Vision", "Object Detection", "Text-to-Speech", "NumPy", "Jupyter Notebook"],
    },
    impact: {
      title: "Impact & Learnings",
      text: "This project reinforced that AI has the power to restore independence and dignity. Working on a real-world assistive technology deepened understanding of model optimization, real-time processing constraints, and accessible design.",
    },
  };

  return (
    <section id="project" style={{ padding: "120px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Featured Work" title="Project Showcase" subtitle="Real-world AI in action." /></Reveal>

      <Reveal delay={100}>
        <div style={{
          marginTop: 64,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 28,
          overflow: "hidden",
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))",
            padding: "40px 40px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  color: "#7c3aed", textTransform: "uppercase",
                  background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
                  borderRadius: 100, padding: "4px 14px", marginBottom: 16,
                }}>AI for Good</div>
                <h3 style={{
                  fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800,
                  color: "#fff", margin: "0 0 12px", lineHeight: 1.2,
                }}>Obstacle Detection System<br />for the Visually Impaired</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0 }}>
                  Real-time computer vision · Audio alerts · Independence enablement
                </p>
              </div>
              <div style={{ fontSize: 64 }}>👁️</div>
            </div>

            <div style={{ display: "flex", gap: 4, marginTop: 32, overflowX: "auto" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: tab === t ? "rgba(124,58,237,0.2)" : "transparent",
                  border: tab === t ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                  borderBottom: "none",
                  borderRadius: "10px 10px 0 0",
                  padding: "10px 20px",
                  color: tab === t ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                  fontSize: 13, fontWeight: tab === t ? 600 : 400,
                  cursor: "pointer", textTransform: "capitalize",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 40 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#c4b5fd", margin: "0 0 16px" }}>{content[tab].title}</h4>
            {tab === "tech" ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {content[tab].items.map(item => (
                  <span key={item} style={{
                    fontSize: 13, padding: "8px 16px", borderRadius: 100,
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                    color: "#a78bfa", fontWeight: 500,
                  }}>{item}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{content[tab].text}</p>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────
function Certifications() {
  const certs = [
    { name: "Google Generative AI", issuer: "Google", icon: "🌐", color: "#4f46e5" },
    { name: "Google Generative AI Studio", issuer: "Google", icon: "🎨", color: "#7c3aed" },
    { name: "MATLAB Onramp", issuer: "MathWorks", icon: "📊", color: "#2563eb" },
    { name: "Kaggle Python", issuer: "Kaggle", icon: "🐍", color: "#0ea5e9" },
    { name: "SoloLearn Python", issuer: "SoloLearn", icon: "⚡", color: "#6d28d9" },
    { name: "HCDA", issuer: "Professional", icon: "🏆", color: "#4338ca" },
  ];

  return (
    <section id="certifications" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Credentials" title="Certifications" subtitle="Verified skills and continuous learning." /></Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20, marginTop: 64,
      }}>
        {certs.map((c, i) => (
          <Reveal key={c.name} delay={i * 80}>
            <CertCard cert={c} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CertCard({ cert }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${hexToRgb(cert.color)}, 0.08)` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? cert.color + "40" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, padding: "28px 24px",
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, ${cert.color}30, ${cert.color}10)`,
        border: `1px solid ${cert.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 16,
      }}>{cert.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{cert.name}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Issued by {cert.issuer}</div>
      <div style={{
        display: "inline-block", marginTop: 16,
        fontSize: 11, padding: "4px 12px", borderRadius: 100,
        background: `${cert.color}20`, border: `1px solid ${cert.color}30`,
        color: cert.color, fontWeight: 600, letterSpacing: "0.05em",
      }}>Verified ✓</div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
function Roadmap() {
  const nodes = [
    { label: "Student", sub: "VIT-AP University · 2024", status: "done", icon: "🎓" },
    { label: "Python & ML Basics", sub: "Kaggle · Google AI · Certifications", status: "done", icon: "📚" },
    { label: "Deep Learning", sub: "CNNs, RNNs, Transformers", status: "active", icon: "🧬" },
    { label: "DSA Mastery", sub: "LeetCode · 40+ Problems Solved", status: "active", icon: "⚡" },
    { label: "Open Source", sub: "3 Repos · Contributing to community", status: "active", icon: "🌿" },
    { label: "AI Engineer", sub: "The destination", status: "future", icon: "🚀" },
  ];

  const statusStyle = {
    done: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
    active: { bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.3)", dot: "#7c3aed" },
    future: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", dot: "rgba(255,255,255,0.2)" },
  };

  return (
    <section id="roadmap" style={{ padding: "120px 24px", maxWidth: 800, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="The Plan" title="AI Engineer Roadmap" subtitle="From student to engineer — a deliberate path." /></Reveal>

      <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 0 }}>
        {nodes.map((node, i) => {
          const st = statusStyle[node.status];
          return (
            <Reveal key={node.label} delay={i * 100}>
              <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: st.dot, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, border: "3px solid rgba(5,5,5,1)",
                    boxShadow: node.status === "active" ? `0 0 20px ${st.dot}` : "none",
                    flexShrink: 0,
                    zIndex: 1,
                  }}>{node.status === "done" ? "✓" : node.icon[0]}</div>
                  {i < nodes.length - 1 && (
                    <div style={{
                      width: 1, flexGrow: 1, minHeight: 32,
                      background: i < 2 ? "rgba(16,185,129,0.3)" : "rgba(124,58,237,0.3)",
                      margin: "4px 0",
                    }} />
                  )}
                </div>

                <div style={{
                  flex: 1,
                  background: st.bg,
                  border: `1px solid ${st.border}`,
                  borderRadius: 16, padding: "20px 24px",
                  marginBottom: i < nodes.length - 1 ? 12 : 0,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{node.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{node.sub}</div>
                  </div>
                  <div style={{ fontSize: 24 }}>{node.icon}</div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── LeetCode Dashboard ───────────────────────────────────────────────────────
function LeetCode() {
  const topics = [
    { name: "Arrays", solved: 12, total: 20, color: "#7c3aed" },
    { name: "Strings", solved: 8, total: 15, color: "#4f46e5" },
    { name: "Linked Lists", solved: 6, total: 12, color: "#2563eb" },
    { name: "Trees", solved: 5, total: 18, color: "#0ea5e9" },
    { name: "Sorting", solved: 9, total: 10, color: "#8b5cf6" },
  ];

  return (
    <section id="leetcode" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Competitive Coding" title="LeetCode Progress" subtitle="Building problem-solving intuition." /></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 64 }}>
        <Reveal delay={100}>
          <div style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 24, padding: 40,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#c4b5fd", lineHeight: 1 }}>
              <Counter end={40} duration={1500} />+
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Problems Solved</div>
            <a href="https://leetcode.com/u/vinaykumarelusuri/" target="_blank" rel="noreferrer" style={{
              display: "inline-block", marginTop: 20,
              fontSize: 13, padding: "8px 20px", borderRadius: 100,
              background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa", fontWeight: 600, textDecoration: "none",
            }}>View Profile ↗</a>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24, padding: 32,
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>By Topic</div>
            {topics.map(t => (
              <div key={t.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: t.color, fontWeight: 700 }}>{t.solved}/{t.total}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(t.solved / t.total) * 100}%`,
                    background: `linear-gradient(90deg, ${t.color}, ${t.color}aa)`,
                    borderRadius: 10,
                    boxShadow: `0 0 8px ${t.color}80`,
                    transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── GitHub Section ───────────────────────────────────────────────────────────
function GitHub() {
  return (
    <section id="github" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <Reveal><SectionHeader eyebrow="Open Source" title="GitHub Activity" subtitle="3 public repositories and growing." /></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 64 }}>
        {[
          { name: "Obstacle Detection System", desc: "AI-powered obstacle detection for visually impaired users using OpenCV and deep learning.", lang: "Python", stars: 2 },
          { name: "ML Experiments", desc: "A collection of machine learning notebooks, experiments, and model implementations.", lang: "Jupyter", stars: 1 },
          { name: "DSA Practice", desc: "Curated solutions to LeetCode problems with explanations and optimized approaches.", lang: "Python", stars: 1 },
        ].map((repo, i) => (
          <Reveal key={repo.name} delay={i * 100}>
            <RepoCard repo={repo} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={300}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="https://github.com/vinaykumar-2007" target="_blank" rel="noreferrer" style={{
            display: "inline-block",
            fontSize: 14, padding: "12px 28px", borderRadius: 100,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.background = "rgba(124,58,237,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
            View All Repositories ↗
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function RepoCard({ repo }) {
  const [hovered, setHovered] = useState(false);
  const langColors = { Python: "#3572A5", Jupyter: "#DA5B0B" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, padding: 24,
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📁</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>{repo.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{repo.desc}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: langColors[repo.lang], display: "inline-block" }} />
          {repo.lang}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>⭐ {repo.stars}</span>
      </div>
    </div>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function Contact() {
  const links = [
    { label: "GitHub", url: "https://github.com/vinaykumar-2007", icon: "🐙", desc: "View my code" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/vinayelusuri", icon: "💼", desc: "Connect professionally" },
    { label: "LeetCode", url: "https://leetcode.com/u/vinaykumarelusuri/", icon: "⚡", desc: "See my solutions" },
    { label: "Email", url: "mailto:vinay@example.com", icon: "✉️", desc: "Reach out directly" },
  ];

  return (
    <section id="contact" style={{ padding: "120px 24px 80px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
      <Reveal>
        <SectionHeader eyebrow="Let's Connect" title="Get In Touch" subtitle="Open to opportunities, collaborations, and conversations." />
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 64 }}>
        {links.map((link, i) => (
          <Reveal key={link.label} delay={i * 80}>
            <a href={link.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <ContactCard link={link} />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactCard({ link }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, padding: "32px 20px",
        transition: "all 0.3s",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "none",
        cursor: "pointer",
        textAlign: "center",
      }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{link.icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{link.label}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{link.desc}</div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding: "48px 24px",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      textAlign: "center",
    }}>
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)",
        maxWidth: 400, margin: "0 auto 40px",
      }} />
      <div style={{
        fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 800,
        background: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 12,
      }}>Elusuri Vinay Kumar</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 32 }}>
        AI Engineer Aspirant · VIT-AP University · Building tomorrow's intelligence
      </div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          ["GitHub", "https://github.com/vinaykumar-2007"],
          ["LinkedIn", "https://www.linkedin.com/in/vinayelusuri"],
          ["LeetCode", "https://leetcode.com/u/vinaykumarelusuri/"],
        ].map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" style={{
            fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#a78bfa"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>
            {label}
          </a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 40 }}>
        © 2026 Elusuri Vinay Kumar. Crafted with precision.
      </div>
    </footer>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "journey", "about", "skills", "project", "certifications", "roadmap", "leetcode", "github", "contact"];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.3 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      WebkitFontSmoothing: "antialiased",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes aurora1 { from { transform: translate(0,0) scale(1); } to { transform: translate(80px,40px) scale(1.1); } }
        @keyframes aurora2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px,30px) scale(1.08); } }
        @keyframes aurora3 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,-50px) scale(1.05); } }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-20px); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 2px; }
      `}</style>

      <Aurora />
      <Particles />
      <Nav active={activeSection} setActive={setActiveSection} />

      <div style={{ position: "relative", zIndex: 2 }}>
        <Hero setActive={setActiveSection} />
        <Journey />
        <About />
        <Skills />
        <Project />
        <Roadmap />
        <Certifications />
        <LeetCode />
        <GitHub />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
