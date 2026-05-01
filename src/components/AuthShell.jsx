import { FaArrowTrendUp, FaCircleCheck, FaGraduationCap, FaShieldHeart } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const previewItems = [
  {
    icon: FaGraduationCap,
    title: "Track every scholarship",
    description: "Centralize search, applications, and supporting documents in one portal.",
  },
  {
    icon: FaShieldHeart,
    title: "Built for secure review",
    description: "Role-based access keeps student and admin workflows clearly separated.",
  },
  {
    icon: FaArrowTrendUp,
    title: "Make decisions faster",
    description: "Live summaries and clean dashboards help teams review with confidence.",
  },
];

export default function AuthShell({
  badge,
  children,
  className,
  description,
  heading,
  secondaryAction,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_26%),linear-gradient(180deg,#062220_0%,#020617_100%)]" />
      <div className="absolute inset-0 bg-mesh opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-4 text-white">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-xl shadow-strong ring-1 ring-white/15 backdrop-blur">
              <FaGraduationCap />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                ScholarHub
              </p>
              <p className="text-sm text-slate-300">Scholarship operations platform</p>
            </div>
          </Link>
          {secondaryAction}
        </header>

        <div className="grid flex-1 gap-10 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <section className="hidden rounded-[36px] border border-white/10 bg-white/8 p-8 text-white shadow-strong backdrop-blur xl:block">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
              {badge}
            </p>

            <div className="mt-8 max-w-xl space-y-5">
              <h1 className="text-balance font-serif text-5xl leading-tight">{heading}</h1>
              <p className="max-w-lg text-lg leading-8 text-slate-200">{description}</p>
            </div>

            <div className="mt-10 space-y-4">
              {previewItems.map(({ description: itemDescription, icon: Icon, title }) => (
                <div
                  className="flex gap-4 rounded-3xl border border-white/10 bg-white/6 p-5"
                  key={title}
                >
                  <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-teal-100">
                    <Icon />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{itemDescription}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-teal-200/20 bg-white/8 p-5">
              <div className="flex items-center gap-3 text-teal-100">
                <FaCircleCheck />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Production-ready workflows
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Thoughtful validation, transparent feedback, and responsive experiences for
                students and administrators.
              </p>
            </div>
          </section>

          <section className={cn("mx-auto w-full max-w-xl", className)}>{children}</section>
        </div>
      </div>
    </div>
  );
}
