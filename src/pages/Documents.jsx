import { useCallback, useEffect, useState } from "react";
import { FaFileArrowUp, FaFileLines } from "react-icons/fa6";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { ListSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { formatBytes, formatDate, titleCase } from "../lib/formatters";
import { api } from "../services/api";

function getStatusVariant(value = "") {
  const normalized = value.toUpperCase();

  if (normalized.includes("APPROV") || normalized.includes("VERIF")) {
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

export default function Documents() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState(null);
  const [formData, setFormData] = useState({
    category: "Academic",
    file: null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await api.studentDocuments(token);
      setDocuments(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!formData.file) {
        throw new Error("Choose a file before uploading.");
      }

      await api.uploadDocument(token, formData);
      setFormData({
        category: "Academic",
        file: null,
      });
      showToast({
        title: "Document uploaded",
        description: "Your file is now available in the portal.",
        variant: "success",
      });
      await loadDocuments();
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Upload failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleViewDocument(documentId) {
    setError("");

    try {
      const blob = await api.viewStudentDocument(token, documentId);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Unable to open document",
        description: requestError.message,
        variant: "error",
      });
    }
  }

  async function handleDownloadDocument(documentId) {
    setError("");

    try {
      const blob = await api.downloadStudentDocument(token, documentId);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Unable to download document",
        description: requestError.message,
        variant: "error",
      });
    }
  }

  async function handleDeleteDocument(documentId) {
    setError("");

    try {
      await api.deleteStudentDocument(token, documentId);
      showToast({
        title: "Document deleted",
        description: "The selected file has been removed from your vault.",
        variant: "success",
      });
      await loadDocuments();
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Delete failed",
        description: requestError.message,
        variant: "error",
      });
    }
  }

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Document vault"
        subtitle="Upload, review, and manage your supporting files with clear status feedback and responsive controls."
        title="Upload and manage supporting files"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card>
          <div>
            <p className="section-label">Upload</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add a new document</h2>
            <p className="mt-2 text-sm text-slate-500">
              Accepted formats are PDF, JPG, and PNG up to 5 MB.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <Input
              as="select"
              label="Category"
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,
                  category: event.target.value,
                }))
              }
              options={
                <>
                  <option>Academic</option>
                  <option>Identity</option>
                  <option>Income</option>
                  <option>Bank</option>
                </>
              }
              value={formData.category}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="file-upload">
                File
              </label>
              <label
                className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-teal-300 hover:bg-teal-50/40"
                htmlFor="file-upload"
              >
                <span className="rounded-2xl bg-white p-4 text-slate-500 shadow-sm">
                  <FaFileArrowUp />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  {formData.file ? formData.file.name : "Choose or drag a file here"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The selected document will upload to your scholarship vault.
                </p>
              </label>
              <input
                className="sr-only"
                id="file-upload"
                onChange={(event) =>
                  setFormData((currentData) => ({
                    ...currentData,
                    file: event.target.files?.[0] || null,
                  }))
                }
                type="file"
              />
            </div>

            <Button className="w-full" loading={isSubmitting} size="lg" type="submit">
              Upload document
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-label">Saved files</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your documents</h2>
            </div>
            <Badge variant="info">{documents?.length || 0} files</Badge>
          </div>

          {!documents ? (
            <div className="mt-6">
              <ListSkeleton cards={4} />
            </div>
          ) : documents.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                description="Upload your first academic or identity document to begin building a complete profile."
                icon={FaFileLines}
                title="No documents uploaded yet"
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {documents.map((document) => (
                <Card className="hover:-translate-y-0.5 hover:shadow-strong" key={document.id}>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={getStatusVariant(document.status)}>
                      {titleCase(document.status)}
                    </Badge>
                    <Badge variant="neutral">{formatBytes(document.size)}</Badge>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{document.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{document.category}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded {formatDate(document.uploadedAt)} • {document.contentType}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Button
                      onClick={() => handleViewDocument(document.id)}
                      variant="secondary"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleDownloadDocument(document.id)}
                      variant="secondary"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => handleDeleteDocument(document.id)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
