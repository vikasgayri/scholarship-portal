import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaChartLine,
  FaShieldAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { ListSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../lib/formatters";
import { api } from "../services/api";

const featureCards = [
  {
    icon: FaUserGraduate,
    title: "Student-first workflows",
    description: "Profiles, applications, and supporting documents stay organized in one portal.",
  },
  {
    icon: FaShieldAlt,
    title: "Admin-grade controls",
    description: "Role-aware review flows keep student and administrator experiences clean and secure.",
  },
  {
    icon: FaChartLine,
    title: "Operational visibility",
    description: "Dashboards surface real application metrics, statuses, and review bottlenecks.",
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [scholarships, setScholarships] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />
      <div className="absolute inset-0 bg-mesh opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
              Spring Boot + MongoDB portal
            </p>
            <h2 className="mt-2 text-2xl font-semibold">ScholarHub</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button as={Link} to={isAuthenticated ? "/dashboard" : "/login"} variant="secondary">
              {isAuthenticated ? "Open workspace" : "Login"}
            </Button>
            <Button as={Link} to={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? user?.name || "Continue" : "Create account"}
            </Button>
          </div>
        </header>

        <section className="grid gap-10 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
              Built for real student workflows
            </p>
            <h1 className="mt-6 max-w-3xl text-balance font-serif text-5xl leading-tight sm:text-6xl">
              Search, apply, upload, review, and approve from one place.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              This portal runs with a React frontend, Spring Boot API, MongoDB persistence,
              role-based auth, document uploads, and an admin review panel designed for real
              operations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} size="lg" to={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Go to dashboard" : "Start as student"}
              </Button>
              <Button as={Link} size="lg" to="/login" variant="secondary">
                Admin or returning user
              </Button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {featureCards.map(({ description, icon: Icon, title }) => (
                <div
                  className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur"
                  key={title}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-teal-100">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <Card className="border-white/10 bg-white/10 text-white shadow-strong backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-white/12 p-3">
                  <FaShieldAlt />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
                    Portal status
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">Production-oriented stack</h3>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                <li>JWT authentication with role-based routing</li>
                <li>MongoDB-backed scholarships and applications</li>
                <li>Student document uploads with validation</li>
                <li>Responsive dashboard and admin panel</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-white/6 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                Open scholarships
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Current opportunities</h2>
            </div>
            <Button
              as={Link}
              to={isAuthenticated ? "/scholarships" : "/register"}
              variant="secondary"
            >
              Explore in portal
              <FaArrowRight />
            </Button>
          </div>

          {error ? <p className="mt-6 text-sm text-red-200">{error}</p> : null}

          {!scholarships ? (
            <div className="mt-6">
              <ListSkeleton cards={4} />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {scholarships.slice(0, 4).map((scholarship) => (
                <Card
                  className="border-white/10 bg-white/10 text-white shadow-strong backdrop-blur"
                  key={scholarship.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-teal-100">
                      {scholarship.category}
                    </span>
                    <strong className="text-teal-100">{formatCurrency(scholarship.amount)}</strong>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{scholarship.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{scholarship.provider}</p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-300">
                    <li>Deadline: {formatDate(scholarship.deadline)}</li>
                    <li>Location: {scholarship.location}</li>
                    <li>Seats: {scholarship.seats}</li>
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

