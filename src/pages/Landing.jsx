import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, MessageSquare, Activity, BarChart3, Radio,
  ArrowRight, Zap, Users, ChevronRight, Sparkles,
} from 'lucide-react';
import './Landing.css';

/* ── Starfield Canvas ──────────────────────────────────────────────────────── */
function StarfieldCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      speed: Math.random() * 0.00014 + 0.00003,
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() * 0.012 + 0.004,
    }));

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.phase += s.twinkle;
        s.y += s.speed;
        if (s.y > 1) { s.y = 0; s.x = Math.random(); }
        const op = 0.1 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="lp-starfield" aria-hidden="true" />;
}

/* ── Scroll Reveal Hook ────────────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated Counter Card ─────────────────────────────────────────────────── */
function CounterCard({ target, suffix = '', label, sub }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const DURATION = 2000;
    const tick = (now) => {
      const p = Math.min((now - t0) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target]);

  return (
    <div ref={ref} className="lp-metric-card">
      <div className="lp-metric-val">{val}{suffix}</div>
      <div className="lp-metric-label">{label}</div>
      {sub && <div className="lp-metric-sub">{sub}</div>}
    </div>
  );
}

/* ── Navbar ────────────────────────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
      <div className="lp-nav-logo">Xeno<span>.</span>CRM</div>
      <div className="lp-nav-links">
        <a href="#features" className="lp-nav-link">Features</a>
        <a href="#how" className="lp-nav-link">How it works</a>
        <Link to="/dashboard" className="lp-nav-cta">
          Enter App <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="lp-hero">
      <StarfieldCanvas />
      <div className="lp-hero-glow lp-hero-glow-1" />
      <div className="lp-hero-glow lp-hero-glow-2" />

      <div className="lp-hero-body">
        <div className="lp-hero-eyebrow">
          <Zap size={11} /> AI-NATIVE CRM PLATFORM
        </div>
        <h1 className="lp-hero-h1">
          — The smarter way to<br />
          <span className="lp-accent">reach</span>,{' '}
          <span className="lp-accent">retain</span>, and{' '}
          <span className="lp-accent">grow</span><br />
          your shoppers.
        </h1>
        <p className="lp-hero-sub">
          Gemini AI meets your customer data — building precise audiences from plain
          English, drafting personalised messages, and tracking every delivery in real time.
        </p>
        <div className="lp-hero-actions">
          <Link to="/dashboard" className="lp-btn-primary">
            Enter the CRM <ArrowRight size={15} />
          </Link>
          <a href="#features" className="lp-btn-ghost">Explore features ↓</a>
        </div>
      </div>

      {/* Floating stat pills */}
      <div className="lp-pill lp-pill--a">
        <span className="lp-pill-num">+90%</span>
        <span className="lp-pill-text">Delivery Rate</span>
      </div>
      <div className="lp-pill lp-pill--b">
        <Sparkles size={12} style={{ color: 'var(--orange)' }} />
        <span className="lp-pill-text">Gemini AI</span>
      </div>
      <div className="lp-pill lp-pill--c">
        <Users size={12} style={{ color: 'var(--orange)' }} />
        <span className="lp-pill-text">998 Customers</span>
      </div>

      {/* Stat strip — 5 stats equally spaced */}
      <div className="lp-hero-stats">
        <div className="lp-hero-stat">
          <span className="lp-hero-stat-num lp-accent">998+</span>
          <div>
            <div className="lp-hero-stat-label">Customers</div>
            <div className="lp-hero-stat-sub">In the CRM</div>
          </div>
        </div>
        <div className="lp-hero-stat">
          <span className="lp-hero-stat-num lp-accent">90%</span>
          <div>
            <div className="lp-hero-stat-label">Delivery Rate</div>
            <div className="lp-hero-stat-sub">Avg. per campaign</div>
          </div>
        </div>
        <div className="lp-hero-stat">
          <span className="lp-hero-stat-num lp-accent">+60%</span>
          <div>
            <div className="lp-hero-stat-label">Open Rate</div>
            <div className="lp-hero-stat-sub">Simulated engagement</div>
          </div>
        </div>
        <div className="lp-hero-stat">
          <span className="lp-hero-stat-num lp-accent">4</span>
          <div>
            <div className="lp-hero-stat-label">Channels</div>
            <div className="lp-hero-stat-sub">WA · SMS · Email · RCS</div>
          </div>
        </div>
        <div className="lp-hero-stat">
          <span className="lp-hero-stat-num lp-accent">100%</span>
          <div>
            <div className="lp-hero-stat-label">Opt-out Safe</div>
            <div className="lp-hero-stat-sub">Compliance enforced</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Marquee ───────────────────────────────────────────────────────────────── */
const TICKER = [
  'CAMPAIGN MANAGEMENT', 'AI AUDIENCE BUILDER', 'DELIVERY ANALYTICS',
  'GEMINI INTEGRATION', 'REAL-TIME WEBHOOKS', 'NATURAL LANGUAGE QUERIES',
  'MULTI-CHANNEL DELIVERY', 'REVENUE ATTRIBUTION', 'CUSTOMER SEGMENTATION',
];
function Marquee() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="lp-marquee">
      <div className="lp-marquee-track">
        {doubled.map((t, i) => (
          <span key={i} className="lp-marquee-item">
            {t}<span className="lp-marquee-sep"> · </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Big Statement ─────────────────────────────────────────────────────────── */
function Statement() {
  const [ref, vis] = useReveal(0.15);
  return (
    <section className="lp-statement">
      <div className={`lp-statement-inner${vis ? ' visible' : ''}`} ref={ref}>
        <p className="lp-statement-text">
          We handle your<br />
          customer data so you<br />
          can focus on building<br />
          <span className="lp-accent">great campaigns.</span>
        </p>
        <div className="lp-statement-shape" aria-hidden="true">
          <div className="lp-shape-orb" />
          <div className="lp-shape-orb lp-shape-orb-2" />
        </div>
      </div>
    </section>
  );
}

/* ── Features Bento ────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Bot,
    tag: 'AI SUGGESTIONS',
    title: 'Campaign Ideas from Gemini',
    desc: 'Gemini AI analyses spend patterns, inactivity, and channel preferences to generate targeted campaign ideas with predicted audience size and ROI.',
    area: 'a',
    accent: true,
  },
  {
    icon: MessageSquare,
    tag: 'NL SEGMENTS',
    title: 'Audiences from Plain English',
    desc: 'Type who you want to reach. "Customers inactive for 90 days with ₹5k+ spend" becomes an instant, precise segment.',
    area: 'b',
  },
  {
    icon: Activity,
    tag: 'LIVE TRACKING',
    title: 'Real-time Delivery Funnel',
    desc: 'Watch messages move from Sent → Delivered → Opened → Clicked. Async webhooks fire live stats into your dashboard.',
    area: 'c',
  },
  {
    icon: BarChart3,
    tag: 'ANALYTICS',
    title: 'Revenue Attribution',
    desc: 'See which campaigns actually drove revenue. Campaign-level ROI, open rates, click rates, and conversion metrics in one unified view.',
    area: 'd',
  },
  {
    icon: Radio,
    tag: 'CHANNELS',
    title: 'WhatsApp · SMS · Email · RCS',
    desc: 'One campaign, four channels. Opt-out compliance enforced per customer automatically.',
    area: 'e',
  },
];

function FeatCard({ icon: Icon, tag, title, desc, area, accent, index }) {
  const [ref, vis] = useReveal(0.08);
  return (
    <div
      ref={ref}
      className={`lp-feat-card${accent ? ' accent' : ''}${vis ? ' visible' : ''}`}
      style={{ gridArea: area, '--delay': `${index * 0.09}s` }}
    >
      <div className="lp-feat-tag"><Icon size={11} /> {tag}</div>
      <h3 className="lp-feat-title">{title}</h3>
      <p className="lp-feat-desc">{desc}</p>
      <div className="lp-feat-arrow"><ChevronRight size={14} /></div>
    </div>
  );
}

function Features() {
  return (
    <section className="lp-features" id="features">
      <div className="lp-section-header">
        <div className="lp-section-eyebrow">// PLATFORM CAPABILITIES</div>
        <h2 className="lp-section-h2">
          Everything you need to run<br />
          <span className="lp-accent">AI-powered campaigns</span>
        </h2>
      </div>
      <div className="lp-feat-grid">
        {FEATURES.map((f, i) => <FeatCard key={i} {...f} index={i} />)}
      </div>
    </section>
  );
}

/* ── How It Works ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Define Your Audience',
    desc: 'Use natural language or let the AI suggestion engine build a precise customer segment. No SQL, no complex filters — just describe who you want to reach.',
    code: '"Customers inactive for 90+ days with ₹10k+ lifetime spend"\n→ 343 matched customers',
  },
  {
    num: '02',
    title: 'Generate Content with AI',
    desc: 'The AI Content Creator uses your audience context to draft personalised campaign messages. One click to generate, fully editable before sending.',
    code: 'Gemini drafts a personalised WhatsApp message\nwith dynamic customer name and spend data',
  },
  {
    num: '03',
    title: 'Launch, Track & Optimise',
    desc: 'Send your campaign and watch the live funnel update in real time. Delivery, opens, reads, clicks, and attributed revenue — all in one dashboard.',
    code: '144 sent → 130 delivered → 78 opened → 22 clicked\n→ ₹1.8L attributed revenue',
  },
];

function StepItem({ num, title, desc, code, index }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div
      ref={ref}
      className={`lp-step${vis ? ' visible' : ''}`}
      style={{ '--delay': `${index * 0.13}s` }}
    >
      <div className="lp-step-num-wrap">
        <span className="lp-step-num">{num}</span>
      </div>
      <div className="lp-step-content">
        <h3 className="lp-step-title">{title}</h3>
        <p className="lp-step-desc">{desc}</p>
        <pre className="lp-step-code">{code}</pre>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="lp-how" id="how">
      <div className="lp-section-header">
        <div className="lp-section-eyebrow">// HOW IT WORKS</div>
        <h2 className="lp-section-h2">
          From idea to campaign<br />
          in <span className="lp-accent">three steps</span>
        </h2>
      </div>
      <div className="lp-steps">
        {STEPS.map((s, i) => <StepItem key={i} {...s} index={i} />)}
      </div>
    </section>
  );
}

/* ── Metrics Bento ─────────────────────────────────────────────────────────── */
const BAR_H = [45, 63, 79, 92, 84, 98, 71, 87];

function Metrics() {
  const barsRef = useRef(null);
  const [barsVis, setBarsVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setBarsVis(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    if (barsRef.current) obs.observe(barsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="lp-metrics">
      <div className="lp-section-header">
        <div className="lp-section-eyebrow">// PLATFORM PERFORMANCE</div>
      </div>
      <div className="lp-metrics-grid">
        <CounterCard target={998} suffix="+" label="Customers Tracked" sub="Across all segments" />
        <CounterCard target={90} suffix="%" label="Avg. Delivery Rate" sub="Channel simulator" />
        <CounterCard target={60} suffix="%" label="Avg. Open Rate" sub="Post-delivery" />
        <CounterCard target={4} suffix="" label="Channels Supported" sub="WA · SMS · Email · RCS" />

        <div ref={barsRef} className={`lp-metric-card lp-metric-bars${barsVis ? ' bar-visible' : ''}`}>
          <div className="lp-metric-label">Campaign Engagement</div>
          <div className="lp-bar-chart">
            {BAR_H.map((h, i) => (
              <div
                key={i}
                className="lp-bar"
                style={{ '--h': `${h}%`, '--bar-delay': `${i * 0.07}s` }}
              />
            ))}
          </div>
          <div className="lp-metric-sub">Delivered · Opened · Clicked</div>
        </div>

        <div className="lp-metric-card lp-metric-gemini">
          <div className="lp-gemini-dot" />
          <div className="lp-gemini-name">Gemini AI</div>
          <div className="lp-gemini-model">gemini-3.5-flash</div>
          <div className="lp-gemini-status">Connected</div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ───────────────────────────────────────────────────────────────────── */
function CTA() {
  const [ref, vis] = useReveal(0.2);
  return (
    <section className="lp-cta" ref={ref}>
      <div className="lp-cta-glow" />
      <div className={`lp-cta-content${vis ? ' visible' : ''}`}>
        <div className="lp-section-eyebrow">// GET STARTED</div>
        <h2 className="lp-cta-h2">
          Ready to reach your shoppers<br />
          <span className="lp-accent">intelligently?</span>
        </h2>
        <p className="lp-cta-sub">Gemini-powered · Multi-channel · Real-time analytics</p>
        <Link to="/dashboard" className="lp-btn-primary lp-btn-lg">
          Enter the CRM <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-logo">Xeno<span>.</span>CRM</div>
      <div className="lp-footer-sub">AI-Native B2C CRM · Xeno Engineering Assignment</div>
      <div className="lp-footer-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/campaigns">Campaigns</Link>
        <Link to="/ai">AI Studio</Link>
        <Link to="/analytics">Analytics</Link>
      </div>
      <div className="lp-footer-divider" />
      <div className="lp-footer-copy">Built with Gemini AI · React · Node.js · MongoDB</div>
    </footer>
  );
}

/* ── Root Export ───────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="lp-root">
      <LandingNav />
      <Hero />
      <Marquee />
      <Statement />
      <Features />
      <HowItWorks />
      <Metrics />
      <CTA />
      <Footer />
    </div>
  );
}
