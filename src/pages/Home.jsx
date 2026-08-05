import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  CloudUpload,
  Code2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  SquareUser,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../lib/formatters";
import { api } from "../services/api";
import "../styles/home.css";

const stats = [
  { label: "Scholarships", value: 50, suffix: "+" },
  { label: "Students", value: 1000, suffix: "+" },
  { label: "Awarded", value: 5, prefix: "₹", suffix: " Crore+" },
  { label: "Success Rate", value: 95, suffix: "%" },
];
const fallbackScholarships = [
  {
    id: "featured-merit-grant",
    title: "National Merit Excellence Grant",
    provider: "ScholarHub Foundation",
    category: "Merit",
    amount: 125000,
    deadline: "2026-09-15",
    location: "India",
    seats: 40,
  },
  {
    id: "featured-women-tech",
    title: "Women in Technology Scholarship",
    provider: "Future Coders Trust",
    category: "STEM",
    amount: 90000,
    deadline: "2026-08-30",
    location: "Remote",
    seats: 25,
  },
  {
    id: "featured-rural-leaders",
    title: "Rural Leaders Education Award",
    provider: "BrightPath Initiative",
    category: "Need-based",
    amount: 75000,
    deadline: "2026-10-05",
    location: "Pan India",
    seats: 60,
  },
  {
    id: "featured-research-fellowship",
    title: "Undergraduate Research Fellowship",
    provider: "Innovation Council",
    category: "Research",
    amount: 150000,
    deadline: "2026-11-12",
    location: "Hybrid",
    seats: 18,
  },
];

const features = [
  { icon: LayoutDashboard, title: "Student Dashboard", text: "One calm workspace for applications, deadlines, documents, and progress." },
  { icon: LockKeyhole, title: "Secure Authentication", text: "Protected access keeps student profiles and admin reviews private." },
  { icon: CloudUpload, title: "Document Upload", text: "Upload, validate, and reuse required academic records without friction." },
  { icon: ClipboardCheck, title: "Application Tracking", text: "Clear statuses help students know exactly where every application stands." },
  { icon: ShieldCheck, title: "Admin Panel", text: "Review profiles, documents, and scholarship applications from a focused console." },
  { icon: Bell, title: "Real-time Notifications", text: "Stay aligned with submission updates, document checks, and review outcomes." },
  { icon: Zap, title: "Responsive Design", text: "A polished experience across desktop, tablet, and mobile screens." },
];

const steps = [
  { icon: UserPlus, title: "Create Account", text: "Set up a verified student profile." },
  { icon: CloudUpload, title: "Upload Documents", text: "Add the records reviewers need." },
  { icon: SendIcon, title: "Apply", text: "Submit to matching scholarships." },
  { icon: UserCheck, title: "Admin Review", text: "Track review progress clearly." },
  { icon: Award, title: "Receive Scholarship", text: "Move forward with confidence." },
];

const testimonials = [
  {
    name: "Raghvendra singh tanwar",
    role: "Engineering Student",
    avatar: "https://res.cloudinary.com/sekjaezc/image/upload/v1785913252/Screenshot_2026-08-05_at_12.25.05_PM_wsre59.png",
    quote: "ScholarHub made every deadline visible and helped me submit stronger applications without chasing documents.",
  },
  {
    name: "Parth Kashyap",
    role: "Medical Applicant",
    avatar: "https://res.cloudinary.com/sekjaezc/image/upload/f_auto,q_auto/Screenshot_2026-08-05_at_12.17.52_PM_cc2mna",
    quote: "The status updates were the best part. I always knew what was pending and what had already been reviewed.",
  },
  {
    name: "Virendra Meghwal",
    role: "First-generation Scholar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    quote: "It feels professional, fast, and simple. I found opportunities I would have missed otherwise.",
  },
];
const faqs = [
  {
    question: "How do I apply?",
    answer: "Create an account, complete your profile, upload documents, and choose an open scholarship from the portal.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. ScholarHub uses authenticated access and role-based permissions so student and admin areas stay protected.",
  },
  {
    question: "Can I track applications?",
    answer: "Yes. Your dashboard shows application progress, review status, and recent activity in one place.",
  },
  {
    question: "Who reviews applications?",
    answer: "Authorized administrators review submitted applications, documents, eligibility details, and final status changes.",
  },
];

function SendIcon(props) {
  return <ArrowRight {...props} />;
}

function useCountUp(target, isVisible) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    let frameId;
    const duration = 1400;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, target]);

  return count;
}

function StatCard({ stat, isVisible }) {
  const count = useCountUp(stat.value, isVisible);

  return (
    <article className="stat-card reveal-card">
      <strong>
        {stat.prefix}
        {count.toLocaleString("en-IN")}
        {stat.suffix}
      </strong>
      <span>{stat.label}</span>
    </article>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
     async function loadScholarships() {
      try {
        const data = await api.publicScholarships("");
        setScholarships(data);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadScholarships();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const featuredScholarships = useMemo(() => {
    const liveScholarships = scholarships.slice(0, 4);
    return liveScholarships.length ? liveScholarships : fallbackScholarships;
  }, [scholarships]);
  const primaryDestination = isAuthenticated ? "/dashboard" : "/register";
  const primaryLabel = isAuthenticated ? "Go to Dashboard" : "Get Started";

  return (
    <div className="marketing-page">
      <header className={`marketing-nav ${isScrolled ? "is-scrolled" : ""}`}>
        <Link className="brand-mark" to="/" aria-label="ScholarHub home">
          <span className="brand-icon">
            <GraduationCap size={24} />
          </span>
          <span>ScholarHub</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`marketing-links ${isMenuOpen ? "open" : ""}`} aria-label="Primary navigation">
          <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="#scholarships" onClick={() => setIsMenuOpen(false)}>Scholarships</a>
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</a>
          <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </nav>

        <div className="marketing-actions">
          <Link className="nav-login" to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Workspace" : "Login"}
          </Link>
          <Link className="filled-link" to={primaryDestination}>
            {isAuthenticated ? user?.name || "Continue" : "Create Account"}
          </Link>
        </div>
      </header>

       <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              Premium scholarship workspace
            </span>
            <h1>Unlock Your Future with Scholarships</h1>
            <p>
              Find scholarships, upload documents, track applications, and receive updates, all from one secure platform.
            </p>

            <div className="hero-cta">
              <Link className="filled-link large" to={primaryDestination}>
                {primaryLabel}
                <ArrowRight size={18} />
              </Link>
              <Link className="outline-link large" to={isAuthenticated ? "/scholarships" : "/register"}>
                <Search size={18} />
                Explore Scholarships
              </Link>
            </div>
          </div>

          <div className="dashboard-preview" aria-label="ScholarHub dashboard preview">
            <div className="dashboard-glow" />
            <div className="preview-shell">
              <div className="preview-header">
                <div>
                  <span>Application Status</span>
                  <strong>Student Dashboard</strong>
                </div>
                <span className="live-pill">Live</span>
              </div>

              <div className="preview-grid">
                <article className="preview-card approved-card">
                  <CheckCircle2 size={24} />
                  <span>Approved</span>
                  <strong>12</strong>
                </article>
                <article className="preview-card pending-card">
                  <FileText size={24} />

                   <span>Pending</span>
                  <strong>04</strong>
                </article>
                <article className="preview-card amount-card">
                  <CircleDollarSign size={26} />
                  <span>Scholarship Amount</span>
                  <strong>₹1.2L</strong>
                </article>
                <article className="preview-card progress-card">
                  <div className="progress-ring" aria-hidden="true">
                    <span>78%</span>
                  </div>
                  <div>
                    <span>Profile Progress</span>
                    <strong>Ready to apply</strong>
                  </div>
                </article>
              </div>

              <div className="mini-graph" aria-hidden="true">
                <span style={{ height: "34%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "46%" }} />
                <span style={{ height: "76%" }} />
                <span style={{ height: "62%" }} />
                <span style={{ height: "88%" }} />
              </div>
            </div>

            <article className="floating-card notification-card">
              <Bell size={20} />
              <div>
                <strong>New update</strong>
                <span>Merit Grant review completed</span>
              </div>
            </article>

            <article className="floating-card graph-card">
              <TrendingUp size={20} />
              <div>
                <strong>+32%</strong>
                <span>Applications this month</span>
              </div>
              </article>
          </div>
        </section>

        <section className="stats-section" ref={statsRef} aria-label="ScholarHub statistics">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isVisible={statsVisible} />
          ))}
        </section>

        <section className="listing-section" id="scholarships">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                <BookOpen size={16} />
                Featured Scholarships
              </span>
              <h2>Current opportunities</h2>
            </div>
            <Link className="outline-link" to={isAuthenticated ? "/scholarships" : "/register"}>
              Explore in Portal
              <ArrowRight size={18} />
            </Link>
          </div>

          {error ? <p className="page-state error">{error}</p> : null}

          <div className="scholarship-grid">
            {featuredScholarships.map((scholarship, index) => {
              const ScholarshipIcon = [Award, GraduationCap, BookOpen, ShieldCheck][index % 4];

              return (
                <article className="scholarship-card reveal-card" key={scholarship.id}>
                  <div className="scholarship-icon" aria-hidden="true">
                    <ScholarshipIcon size={28} />
                  </div>
                  <div className="listing-topline">
                    <span>{scholarship.category || "Scholarship"}</span>
                    <strong>{formatCurrency(scholarship.amount)}</strong>
                  </div>
                  <h3>{scholarship.title}</h3>
                  <p>{scholarship.provider}</p>
                  <dl className="scholarship-meta">
                    <div>
                      <dt>Deadline</dt>
                      <dd>{formatDate(scholarship.deadline)}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>
                        <MapPin size={14} />
                        {scholarship.location}
                      </dd>
                    </div>
                    <div>
                      <dt>Eligibility</dt>
                      <dd>{scholarship.seats ? `${scholarship.seats} seats available` : "Profile review required"}</dd>
                    </div>
                  </dl>
                  <Link className="apply-link" to={isAuthenticated ? "/scholarships" : "/register"}>
                    Apply Now
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="timeline-section" id="how-it-works">
          <div className="section-header centered">
            <span className="eyebrow">
              <ClipboardCheck size={16} />
              How It Works
            </span>
            <h2>From signup to award, every step is clear.</h2>
          </div>

          <div className="timeline">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                 <article className="timeline-step reveal-card" key={step.title}>
                  <span className="step-number">Step {index + 1}</span>
                  <div className="step-icon">
                    <StepIcon size={24} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                <Sparkles size={16} />
                Features
              </span>
              <h2>Everything students and admins need.</h2>
            </div>
          </div>

          <div className="feature-grid">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <article className="feature-card reveal-card" key={feature.title}>
                  <span className="feature-icon">
                    <FeatureIcon size={24} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
                );
            })}
          </div>
        </section>

        <section className="testimonials-section" id="about">
          <div className="section-header centered">
            <span className="eyebrow">
              <MessageCircle size={16} />
              Testimonials
            </span>
            <h2>Students trust ScholarHub to keep the path organized.</h2>
          </div>

          <div className="testimonial-track">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <div className="rating" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>"{testimonial.quote}"</p>
                <div className="testimonial-person">
                  <img src={testimonial.avatar} alt={`${testimonial.name} profile`} />
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="faq-section">
          <div className="section-header centered">
            <span className="eyebrow">FAQ</span>
            <h2>Questions before you apply?</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
      const isOpen = activeFaq === index;
              return (
                <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveFaq(isOpen ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={20} />
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cta-section" id="contact">
          <span className="eyebrow">
            <Award size={16} />
            Applications open
          </span>
          <h2>Ready to Apply?</h2>
          <p>Start your scholarship journey with a secure profile, guided applications, and real-time progress.</p>
          <Link className="filled-link large" to={primaryDestination}>
            Start Your Journey
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="marketing-footer">
        <div>
          <Link className="brand-mark" to="/">
            <span className="brand-icon">
              <GraduationCap size={22} />
            </span>
            <span>ScholarHub</span>
          </Link>
          <p>Secure scholarship discovery, document uploads, application tracking, and admin review.</p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#scholarships">Scholarships</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
        </div>

        <div className="footer-links">
          <Link to="/register">Privacy Policy</Link>
          <Link to="/register">Terms</Link>
          <a href="mailto:hello@scholarhub.com">Contact</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            <Code2 size={16} />
            GitHub
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            <SquareUser size={16} />
            LinkedIn
          </a>
          <a href="mailto:hello@scholarhub.com">
            <Mail size={16} />
            Email
          </a>
        </div>
      </footer>
    </div>
  );
}
