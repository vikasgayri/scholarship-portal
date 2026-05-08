import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  FaClipboardCheck,
  FaGraduationCap,
  FaPeopleGroup,
  FaShieldHalved,
} from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/ToastProvider";
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

  if (normalized.includes("NEEDS")) {
    return "warning";
  }

  if (normalized.includes("REJECT")) {
    return "danger";
  }

  return "neutral";
}

function EntitySection({ description, eyebrow, items, renderItem, title }) {
  return (
    <Card>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <Badge variant="info">{items.length} records</Badge>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            description={`No ${title.toLowerCase()} are available right now.`}
            icon={FaShieldHalved}
            title={`No ${title.toLowerCase()}`}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      )}
    </Card>
  );
}

export default function AdminPanel() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [documentFilter, setDocumentFilter] = useState("");

  const loadAdminData = useCallback(async () => {
    setError("");

    try {
      const [overviewData, userData, applicationData, documentData, scholarshipData] =
        await Promise.all([
          api.adminOverview(token),
          api.adminUsers(token),
          api.adminApplications(token),
          api.adminDocuments(token),
          api.adminScholarships(token),
        ]);

      setOverview(overviewData);
      setUsers(userData);
      setApplications(applicationData);
      setDocuments(documentData);
      setScholarships(scholarshipData);
    } catch (requestError) {
      setError(requestError.message || "Failed to load admin data.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [loadAdminData, token]);

  const filteredUsers = useMemo(() => {
    const query = userFilter.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((portalUser) =>
      [
        portalUser.name,
        portalUser.email,
        portalUser.phoneNumber,
        portalUser.course,
        portalUser.city,
        portalUser.state,
        portalUser.role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [userFilter, users]);

  const filteredApplications = useMemo(() => {
    const query = applicationFilter.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "ALL" || application.status === statusFilter;
      const matchesQuery = !query || [
        application.user?.name,
        application.user?.email,
        application.user?.phoneNumber,
        application.studentName,
        application.studentEmail,
        application.phoneNumber,
        application.scholarshipTitle,
        application.course,
        application.institution,
        application.category,
        application.city,
        application.state,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [applicationFilter, applications, statusFilter]);

  const filteredDocuments = useMemo(() => {
    const query = documentFilter.trim().toLowerCase();
    if (!query) {
      return documents;
    }

    return documents.filter((document) =>
      [document.name, document.category, document.contentType, document.status, document.applicationId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [documentFilter, documents]);

  async function handleApplicationStatus(application, status) {
    setUpdatingApplicationId(application.id);
    setError("");

    try {
      await api.updateApplicationStatus(token, application.id, {
        status,
        reviewerNote: reviewNotes[application.id] || application.reviewerNote || "",
      });

      setReviewNotes((currentNotes) => ({ ...currentNotes, [application.id]: "" }));
      await loadAdminData();
      showToast({
        title: "Application updated",
        description: `${application.user?.name || application.studentName} will be notified by email when mail is configured.`,
        variant: "success",
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to update application.");
      showToast({
        title: "Update failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setUpdatingApplicationId("");
    }
  }

  async function openDocument(document, mode = "view") {
    setError("");

    try {
      const blob = mode === "download"
        ? await api.downloadAdminDocument(token, document.id)
        : await api.viewAdminDocument(token, document.id);
      const blobUrl = window.URL.createObjectURL(blob);
      if (mode === "download") {
        const link = window.document.createElement("a");
        link.href = blobUrl;
        link.download = document.name || "document";
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to open document.");
      showToast({
        title: "Document error",
        description: requestError.message,
        variant: "error",
      });
    }
  }

  async function handleDeleteUser(portalUser) {
    setError("");

    if (!window.confirm(`Are you sure you want to delete ${portalUser.name} and all related records?`)) {
      return;
    }

    try {
      const deleteResponse = await api.deleteAdminUser(token, portalUser.id);
      await loadAdminData();
      showToast({
        title: "User deleted",
        description: deleteResponse?.message
          || "The user, applications, uploaded documents, and activity logs were removed.",
        variant: "success",
      });
    } catch (requestError) {
      console.error("Failed to delete admin user:", {
        error: requestError,
        userId: portalUser.id,
      });
      setError(requestError.message || "Failed to delete user.");
      showToast({
        title: "Delete failed",
        description: requestError.message || "Failed to delete user.",
        variant: "error",
      });
    }
  }

  if (!overview && !error) {
    return <DashboardSkeleton />;
  }

  if (error && !overview) {
    return (
      <div className="page-shell">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Admin control center"
        subtitle="Monitor platform health, student readiness, document review load, and scholarship inventory from one operational dashboard."
        title="Review operations across the full portal"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="teal"
          icon={FaPeopleGroup}
          label="Students"
          tone="Registered portal users"
          value={overview.totalStudents}
        />
        <StatCard
          accent="sky"
          icon={FaGraduationCap}
          label="Scholarships"
          tone="Active inventory in the platform"
          value={overview.totalScholarships}
        />
        <StatCard
          accent="amber"
          icon={FaClipboardCheck}
          label="Applications"
          tone="Submissions across the current cycle"
          value={overview.totalApplications}
        />
        <StatCard
          accent="emerald"
          icon={FaShieldAlt}
          label="Pending reviews"
          tone="Items needing admin action"
          value={overview.pendingReviews}
        />
      </section>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Users</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Registered users</h2>
            <p className="mt-2 text-sm text-slate-500">
              View full profile and contact details for every portal account.
            </p>
          </div>
          <div className="w-full max-w-md">
            <Input
              label="Filter users"
              onChange={(event) => setUserFilter(event.target.value)}
              type="search"
              value={userFilter}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((portalUser) => (
                <tr className="align-top" key={portalUser.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{portalUser.name}</p>
                    <p className="text-slate-500">{portalUser.email}</p>
                    <Badge variant={portalUser.role === "ADMIN" ? "brand" : "neutral"}>
                      {portalUser.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{portalUser.phoneNumber}</td>
                  <td className="px-4 py-4 text-slate-600">{portalUser.course}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {[portalUser.city, portalUser.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={portalUser.emailVerified ? "success" : "warning"}>
                      {portalUser.emailVerified ? "Email verified" : "Verification pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {portalUser.role !== "ADMIN" ? (
                      <Button
                        onClick={() => handleDeleteUser(portalUser)}
                        size="sm"
                        variant="danger"
                      >
                        Delete User
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-label">Applications</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Student submissions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Filter applications, inspect submitted details, and update review decisions instantly.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-2xl">
            <Input
              label="Search applications"
              onChange={(event) => setApplicationFilter(event.target.value)}
              type="search"
              value={applicationFilter}
            />
            <Input
              as="select"
              label="Status"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={
                <>
                  <option value="ALL">All statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="NEEDS_CHANGES">Objection raised</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </>
              }
              value={statusFilter}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Scholarship</th>
                <th className="px-4 py-3">Academic</th>
                <th className="px-4 py-3">Income / Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Review action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((application) => (
                <Fragment key={application.id}>
                  <tr
                    className="align-top cursor-pointer"
                    onClick={() =>
                      setSelectedApplicationId((currentId) =>
                        currentId === application.id ? "" : application.id,
                      )
                    }
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{application.user?.name || application.studentName}</p>
                      <p className="text-slate-500">{application.user?.email || application.studentEmail}</p>
                      <p className="text-slate-500">{application.user?.phoneNumber || application.phoneNumber}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {application.addressLine}, {application.city}, {application.state} {application.pincode}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{application.scholarshipTitle}</p>
                      <p className="text-slate-500">{application.provider}</p>
                      <p className="text-slate-500">{formatCurrency(application.amount)}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Submitted {formatDate(application.submittedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>{application.course}</p>
                      <p>{application.institution}</p>
                      <p>{application.academicYear} · {application.percentage}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>{formatCurrency(application.annualIncome)}</p>
                      <p>{application.category}</p>
                      <p>{application.caste}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusVariant(application.status)}>
                        {titleCase(application.status)}
                      </Badge>
                      <p className="mt-2 max-w-[220px] text-xs text-slate-500">
                        {application.reviewerNote || "No reviewer note yet"}
                      </p>
                    </td>
                    <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                      <div className="w-72 space-y-3">
                        <Input
                          as="textarea"
                          label="Reviewer note"
                          onChange={(event) =>
                            setReviewNotes((currentNotes) => ({
                              ...currentNotes,
                              [application.id]: event.target.value,
                            }))
                          }
                          value={reviewNotes[application.id] ?? application.reviewerNote ?? ""}
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button loading={updatingApplicationId === application.id} onClick={() => handleApplicationStatus(application, "UNDER_REVIEW")} size="sm" variant="secondary">Review</Button>
                          <Button loading={updatingApplicationId === application.id} onClick={() => handleApplicationStatus(application, "NEEDS_CHANGES")} size="sm" variant="secondary">Objection</Button>
                          <Button loading={updatingApplicationId === application.id} onClick={() => handleApplicationStatus(application, "APPROVED")} size="sm">Approve</Button>
                          <Button loading={updatingApplicationId === application.id} onClick={() => handleApplicationStatus(application, "REJECTED")} size="sm" variant="danger">Reject</Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {selectedApplicationId === application.id ? (
                    <tr key={`${application.id}-details`}>
                      <td className="bg-slate-50 px-4 py-5" colSpan="6">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <div>
                            <p className="section-label">User details</p>
                            <p className="mt-2 font-semibold text-slate-950">{application.user?.name || application.studentName}</p>
                            <p className="text-sm text-slate-500">{application.user?.email || application.studentEmail}</p>
                            <p className="text-sm text-slate-500">{application.user?.phoneNumber || application.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="section-label">Application details</p>
                            <p className="mt-2 font-semibold text-slate-950">{application.scholarshipTitle}</p>
                            <p className="text-sm text-slate-500">Status: {titleCase(application.status)}</p>
                            <p className="text-sm text-slate-500">Submitted {formatDate(application.submittedAt)}</p>
                          </div>
                          <div>
                            <p className="section-label">Documents</p>
                            <div className="mt-2 space-y-3">
                              {application.documents?.length ? (
                                application.documents.map((document) => (
                                  <div className="rounded-2xl border border-slate-200 bg-white p-4" key={document.id}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-slate-950">{document.name}</p>
                                        <p className="text-sm text-slate-500">
                                          Uploaded by {document.uploadedBy || application.user?.name || application.studentName}
                                        </p>
                                        <p className="text-xs text-slate-400">{document.type || document.category}</p>
                                      </div>
                                      <Badge variant={getStatusVariant(document.status)}>
                                        {titleCase(document.status)}
                                      </Badge>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <Button onClick={() => openDocument(document)} size="sm" variant="secondary">
                                        Preview
                                      </Button>
                                      <Button onClick={() => openDocument(document, "download")} size="sm" variant="secondary">
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">No documents linked with this application.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Documents</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Uploaded files</h2>
            <p className="mt-2 text-sm text-slate-500">
              Preview or download user documents directly from the admin dashboard.
            </p>
          </div>
          <div className="w-full max-w-md">
            <Input
              label="Filter documents"
              onChange={(event) => setDocumentFilter(event.target.value)}
              type="search"
              value={documentFilter}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.map((document) => (
                <tr className="align-top" key={document.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{document.name}</p>
                    <p className="text-slate-500">{document.contentType}</p>
                    {document.applicationId ? (
                      <p className="text-xs text-slate-400">Application: {document.applicationId}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{document.category}</td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(document.status)}>
                      {titleCase(document.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(document.uploadedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => openDocument(document)} size="sm" variant="secondary">
                        View
                      </Button>
                      <Button onClick={() => openDocument(document, "download")} size="sm" variant="secondary">
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EntitySection
        description="Current scholarship listings visible to students in the portal."
        eyebrow="Scholarships"
        items={scholarships}
        renderItem={(scholarship) => (
          <Card className="hover:-translate-y-0.5 hover:shadow-strong" key={scholarship.id}>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={getStatusVariant(scholarship.status)}>{scholarship.status}</Badge>
              <span className="text-sm font-semibold text-teal-700">
                {formatCurrency(scholarship.amount)}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">{scholarship.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{scholarship.provider}</p>
            <p className="mt-4 text-sm text-slate-500">
              Deadline {formatDate(scholarship.deadline)}
            </p>
          </Card>
        )}
        title="Available listings"
      />
    </div>
  );
}
