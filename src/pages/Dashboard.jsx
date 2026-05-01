import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaFileCircleCheck,
  FaFolderOpen,
  FaHourglassHalf,
} from "react-icons/fa6";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../lib/formatters";
import { api } from "../services/api";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const data = await api.studentDashboard(token);
        setDashboard(data);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadDashboard();
  }, [token]);

  if (user?.role === "ADMIN") {
    return <Navigate replace to="/admin" />;
  }

  if (!dashboard && !error) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="page-shell">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        action={
          <Button as={Link} size="lg" to="/scholarships">
            Find scholarships
            <FaArrowRight />
          </Button>
        }
        eyebrow="Student workspace"
        subtitle="Review your current progress, keep documents ready, and stay on top of application deadlines."
        title={`Welcome back, ${dashboard.profile.name}`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="teal"
          icon={FaStar}
          label="Open scholarships"
          tone="Fresh opportunities available now"
          value={dashboard.summary.totalScholarships}
        />
        <StatCard
          accent="sky"
          icon={FaFolderOpen}
          label="Applications"
          tone="Across all submitted opportunities"
          value={dashboard.summary.applications}
        />
        <StatCard
          accent="amber"
          icon={FaHourglassHalf}
          label="Under review"
          tone="Awaiting admin review"
          value={dashboard.summary.underReview}
        />
        <StatCard
          accent="emerald"
          icon={FaCheckCircle}
          label="Approved"
          tone="Successfully cleared decisions"
          value={dashboard.summary.approved}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-label">Activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recent activity</h2>
            </div>
            <Badge variant="info">{dashboard.recentActivities.length} updates</Badge>
          </div>

          {dashboard.recentActivities.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                description="Once you submit applications or update documents, the latest events will appear here."
                icon={FaFileCircleCheck}
                title="No activity yet"
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {dashboard.recentActivities.map((activity) => (
                <div
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  key={activity.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{activity.message}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Recorded {formatDate(activity.createdAt)}
                      </p>
                    </div>
                    <Badge variant="brand">Live</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="section-label">Profile snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Readiness</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Email", dashboard.profile.email],
              ["Course", dashboard.profile.course || "Add your course"],
              ["Phone", dashboard.profile.phoneNumber || "Add a phone number"],
              ["City", dashboard.profile.city || "Add your city"],
            ].map(([label, value]) => (
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
                key={label}
              >
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold">Profile completeness</p>
            <p className="mt-2 text-3xl font-semibold">
              {dashboard.profile.profileComplete ? "Ready" : "Needs attention"}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {dashboard.profile.profileComplete
                ? "Your core profile details are ready for scholarship applications."
                : "Update your profile fields to improve application readiness."}
            </p>
            <Button
              as={Link}
              className="mt-5"
              size="sm"
              to="/profile"
              variant="secondary"
            >
              Review profile
            </Button>
          </div>
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Recommended opportunities</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Recommended opportunities
            </h2>
          </div>
          <Badge variant="brand">{dashboard.featuredScholarships.length} featured</Badge>
        </div>

        {dashboard.featuredScholarships.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              action={
                <Button as={Link} to="/scholarships">
                  Explore scholarships
                </Button>
              }
              description="We’ll surface strong matches here as scholarships become available."
              icon={FaStar}
              title="No recommendations yet"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {dashboard.featuredScholarships.map((scholarship) => (
              <Card className="group hover:-translate-y-1 hover:shadow-strong" key={scholarship.id}>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="info">{scholarship.category}</Badge>
                  <span className="text-sm font-semibold text-teal-700">
                    {formatCurrency(scholarship.amount)}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{scholarship.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{scholarship.provider}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">{scholarship.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">
                    Deadline {formatDate(scholarship.deadline)}
                  </span>
                  <Button as={Link} size="sm" to="/scholarships" variant="ghost">
                    View details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
