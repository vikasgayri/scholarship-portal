import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { FaArrowRight, FaClipboardCheck, FaMagnifyingGlass } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
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
import { formatCurrency, formatDate } from "../lib/formatters";
import { api } from "../services/api";

const initialApplication = {
  scholarshipId: "",
  fullName: "",
  phoneNumber: "",
  dateOfBirth: "",
  course: "",
  institution: "",
  academicYear: "",
  percentage: "",
  annualIncome: "",
  category: "General",
  caste: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  essay: "",
  documents: {
    idProof: null,
    incomeCertificate: null,
    marksheet: null,
  },
};

const personalFields = [
  ["fullName", "Full name", "text"],
  ["phoneNumber", "Phone number", "tel"],
  ["dateOfBirth", "Date of birth", "date"],
];

const academicFields = [
  ["course", "Course / Program", "text"],
  ["institution", "College / Institution", "text"],
  ["academicYear", "Academic year", "text"],
  ["percentage", "Percentage / CGPA", "text"],
];

const addressFields = [
  ["addressLine", "Address", "text"],
  ["city", "City", "text"],
  ["state", "State", "text"],
  ["pincode", "PIN code", "text"],
];

const requiredDocuments = [
  ["idProof", "Aadhaar / ID proof"],
  ["incomeCertificate", "Income certificate"],
  ["marksheet", "Marksheet"],
];

function validateApplication(values) {
  const errors = {};

  [
    ...personalFields,
    ...academicFields,
    ["annualIncome", "Annual family income"],
    ["category", "Category"],
    ["caste", "Caste / Community"],
    ...addressFields,
  ].forEach(([field, label]) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${label} is required.`;
    }
  });

  if (values.phoneNumber && values.phoneNumber.replace(/\D/g, "").length < 10) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (values.pincode && !/^\d{5,6}$/.test(values.pincode)) {
    errors.pincode = "Enter a valid PIN code.";
  }

  if (Number(values.annualIncome) <= 0) {
    errors.annualIncome = "Annual family income must be greater than zero.";
  }

  if (!values.essay.trim() || values.essay.trim().length < 80) {
    errors.essay = "Statement of purpose must be at least 80 characters.";
  }

  requiredDocuments.forEach(([field, label]) => {
    if (!values.documents[field]) {
      errors[field] = `${label} is required.`;
    }
  });

  return errors;
}

export default function Scholarships() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { scholarshipId } = useParams();
  const [scholarships, setScholarships] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    ...initialApplication,
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    course: user?.course || "",
    city: user?.city || "",
    state: user?.state || "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    async function loadScholarships() {
      try {
        setError("");
        const data = await api.scholarships(deferredSearch);
        setScholarships(data);
        setSelectedScholarship((currentSelection) => {
          const nextSelection =
            data.find((item) => item.id === scholarshipId) ||
            data.find((item) => item.id === currentSelection?.id) ||
            data[0] ||
            null;
          setApplicationForm((currentForm) => ({
            ...currentForm,
            scholarshipId: nextSelection?.id || "",
          }));
          return nextSelection;
        });
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadScholarships();
  }, [deferredSearch, scholarshipId]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateApplication(applicationForm);
    setFieldErrors(nextErrors);
    setError("");

    if (Object.keys(nextErrors).length > 0) {
      setError("Complete all required application fields and upload the required documents.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.createApplication(token, applicationForm);
      showToast({
        title: "Application submitted",
        description: `Submitted for ${response.scholarshipTitle}.`,
        variant: "success",
      });
      startTransition(() => {
        setApplicationForm((currentForm) => ({
          ...initialApplication,
          fullName: currentForm.fullName,
          phoneNumber: currentForm.phoneNumber,
          course: currentForm.course || user?.course || "",
          city: currentForm.city,
          state: currentForm.state,
          category: currentForm.category,
          scholarshipId: currentForm.scholarshipId,
        }));
        setFieldErrors({});
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Submission failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateApplicationField(field, value) {
    setApplicationForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
  }

  function updateDocumentField(field, file) {
    setApplicationForm((currentForm) => ({
      ...currentForm,
      documents: {
        ...currentForm.documents,
        [field]: file,
      },
    }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
  }

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Scholarship finder"
        subtitle="Search live opportunities, compare details, and submit polished applications from one responsive workspace."
        title="Browse and apply with confidence"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">Open listings</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Scholarship catalog</h2>
            </div>
            <div className="w-full max-w-md">
              <Input
                label="Search scholarships"
                onChange={(event) => setSearchTerm(event.target.value)}
                type="search"
                value={searchTerm}
              />
            </div>
          </div>

          {!scholarships ? (
            <div className="mt-6">
              <ListSkeleton cards={6} />
            </div>
          ) : scholarships.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                description="Try a broader keyword or clear the search to see more available opportunities."
                icon={FaMagnifyingGlass}
                title="No scholarships match this search"
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {scholarships.map((scholarship) => {
                const isSelected = selectedScholarship?.id === scholarship.id;

                return (
                  <Card
                    className={`group cursor-pointer hover:-translate-y-1 hover:shadow-strong ${
                      isSelected ? "border-teal-300 ring-2 ring-teal-100" : ""
                    }`}
                    key={scholarship.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="info">{scholarship.category}</Badge>
                      <span className="text-sm font-semibold text-teal-700">
                        {formatCurrency(scholarship.amount)}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                      {scholarship.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{scholarship.provider}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {scholarship.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <span className="text-sm text-slate-500">
                        Deadline {formatDate(scholarship.deadline)}
                      </span>
                      <Button
                        onClick={() => {
                          setSelectedScholarship(scholarship);
                          setApplicationForm((currentForm) => ({
                            ...currentForm,
                            scholarshipId: scholarship.id,
                          }));
                          navigate(`/scholarships/${scholarship.id}/apply`);
                        }}
                        size="sm"
                        variant={isSelected ? "primary" : "secondary"}
                      >
                        {isSelected ? "Selected" : "Apply Now"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="xl:sticky xl:top-28 xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Application form</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {selectedScholarship?.title || "Choose a scholarship"}
              </h2>
            </div>
            <span className="rounded-2xl bg-teal-50 p-3 text-teal-700">
              <FaClipboardCheck />
            </span>
          </div>

          {selectedScholarship ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="brand">{selectedScholarship.provider}</Badge>
                <Badge variant="warning">{formatDate(selectedScholarship.deadline)}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {selectedScholarship.description}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                description="Select any listing from the left to prefill your application form."
                icon={FaStar}
                title="No scholarship selected"
              />
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <p className="section-label">Personal details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {personalFields.map(([field, label, type]) => (
                  <Input
                    error={fieldErrors[field]}
                    key={field}
                    label={label}
                    onChange={(event) => updateApplicationField(field, event.target.value)}
                    type={type}
                    value={applicationForm[field]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="section-label">Academic details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {academicFields.map(([field, label, type]) => (
                  <Input
                    error={fieldErrors[field]}
                    key={field}
                    label={label}
                    onChange={(event) => updateApplicationField(field, event.target.value)}
                    type={type}
                    value={applicationForm[field]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="section-label">Income and category</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  error={fieldErrors.annualIncome}
                  label="Annual family income"
                  onChange={(event) => updateApplicationField("annualIncome", event.target.value)}
                  type="number"
                  value={applicationForm.annualIncome}
                />
                <Input
                  as="select"
                  error={fieldErrors.category}
                  label="Category"
                  onChange={(event) => updateApplicationField("category", event.target.value)}
                  options={
                    <>
                      <option>General</option>
                      <option>OBC</option>
                      <option>SC</option>
                      <option>ST</option>
                      <option>EWS</option>
                      <option>Minority</option>
                    </>
                  }
                  value={applicationForm.category}
                />
                <Input
                  error={fieldErrors.caste}
                  label="Caste / Community"
                  onChange={(event) => updateApplicationField("caste", event.target.value)}
                  value={applicationForm.caste}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="section-label">Address</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {addressFields.map(([field, label, type]) => (
                  <Input
                    error={fieldErrors[field]}
                    key={field}
                    label={label}
                    onChange={(event) => updateApplicationField(field, event.target.value)}
                    type={type}
                    value={applicationForm[field]}
                  />
                ))}
              </div>
            </div>

            <Input
              as="textarea"
              error={fieldErrors.essay}
              label="Statement of purpose"
              onChange={(event) => updateApplicationField("essay", event.target.value)}
              value={applicationForm.essay}
            />

            <div className="space-y-4">
              <p className="section-label">Required documents</p>
              <div className="grid gap-3">
                {requiredDocuments.map(([field, label]) => (
                  <div key={field}>
                    <label
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:border-teal-300 hover:bg-teal-50"
                      htmlFor={`application-${field}`}
                    >
                      <span>
                        <span className="block font-semibold text-slate-900">{label}</span>
                        <span className="block text-slate-500">
                          {applicationForm.documents[field]?.name || "PDF, JPG, or PNG up to 5 MB"}
                        </span>
                      </span>
                      <span className="rounded-xl bg-white px-3 py-2 font-semibold text-teal-700 shadow-sm">
                        Choose
                      </span>
                    </label>
                    <input
                      accept=".pdf,image/png,image/jpeg"
                      className="sr-only"
                      id={`application-${field}`}
                      onChange={(event) => updateDocumentField(field, event.target.files?.[0] || null)}
                      type="file"
                    />
                    {fieldErrors[field] ? (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors[field]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!applicationForm.scholarshipId}
              loading={isSubmitting}
              size="lg"
              type="submit"
            >
              Submit application
              <FaArrowRight />
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
