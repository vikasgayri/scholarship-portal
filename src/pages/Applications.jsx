import { useEffect, useState } from "react";
import { FaFolderOpen, FaInbox } from "react-icons/fa6";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { ListSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, titleCase } from "../lib/formatters";
import { api } from "../services/api";

function getStatusVariant(value = "") {
  const normalized = value.toUpperCase();

  if (normalized.includes("APPROV")) {
    return "success";
  }

  if (normalized.includes("PEND") || normalized.includes("REVIEW")) {
    return "warning";
  }

  if (normalized.includes("REJECT")) {
    return "danger";
  }

  return "neutral";
}

export default function Applications() {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await api.userApplications(token, user.id);
        setApplications(data);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadApplications();
  }, [token, user.id]);

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Application tracker"
        subtitle="Stay aligned with admin decisions and keep a clear history of your submitted opportunities."
        title="Your submitted applications"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!applications ? (
        <ListSkeleton cards={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          description="Visit the scholarship finder to submit your first application."
          icon={FaInbox}
          title="No applications yet"
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => (
            <Card className="hover:-translate-y-0.5 hover:shadow-strong" key={application.id}>
              <div className="flex items-center justify-between gap-3">
                <Badge variant={getStatusVariant(application.status)}>
                  {titleCase(application.status)}
                </Badge>
                <span className="text-sm font-semibold text-teal-700">
                  {formatCurrency(application.amount)}
                </span>
              </div>
              <div className="mt-5 flex items-start gap-4">
                <span className="rounded-2xl bg-slate-100 p-3 text-slate-500">
                  <FaFolderOpen />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {application.scholarshipTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{application.provider}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Course</span>
                  <span className="font-semibold text-slate-900">{application.course}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(application.submittedAt)}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500">Reviewer note</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {application.reviewerNote || "No note yet"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
