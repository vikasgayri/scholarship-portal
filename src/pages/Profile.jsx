import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const fieldConfig = [
  ["name", "Full name"],
  ["course", "Course"],
  ["phoneNumber", "Phone number"],
  ["city", "City"],
  ["state", "State"],
];

export default function Profile() {
  const navigate = useNavigate();
  const { logout, refreshUser, setUser, token } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    phoneNumber: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await api.studentProfile(token);
        setFormData({
          name: profile.name || "",
          course: profile.course || "",
          phoneNumber: profile.phoneNumber || "",
          city: profile.city || "",
          state: profile.state || "",
        });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const updatedProfile = await api.updateStudentProfile(token, formData);
      setUser(updatedProfile);
      await refreshUser();
      showToast({
        title: "Profile updated",
        description: "Your student details have been saved.",
        variant: "success",
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Save failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      setError("Type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await api.deleteAccount(token);
      logout();
      showToast({
        title: "Account deleted",
        description: "Your profile, applications, activity, and documents were removed.",
        variant: "success",
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Delete failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Profile"
        subtitle="Keep your student details current so applications and document reviews stay accurate."
        title="Manage your student profile"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card className="mx-auto w-full max-w-4xl">
        <div>
          <p className="section-label">Personal details</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Update profile information</h2>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldConfig.map(([field, label]) => (
              <Input
                disabled={isLoading}
                key={field}
                label={label}
                onChange={(event) =>
                  setFormData((currentData) => ({
                    ...currentData,
                    [field]: event.target.value,
                  }))
                }
                value={formData[field]}
              />
            ))}
          </div>

          <Button className="w-full sm:w-auto" loading={isSubmitting} size="lg" type="submit">
            Save profile
          </Button>
        </form>
      </Card>

      <Card className="mx-auto w-full max-w-4xl border-red-200 bg-red-50/70">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            Danger zone
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-red-950">Delete account</h2>
          <p className="mt-2 text-sm leading-6 text-red-800">
            This permanently removes your profile, applications, activity history, and uploaded
            documents from the portal.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input
            label="Type DELETE to confirm"
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            value={deleteConfirmation}
          />
          <Button
            disabled={deleteConfirmation !== "DELETE"}
            loading={isDeleting}
            onClick={handleDeleteAccount}
            variant="danger"
          >
            Delete my account
          </Button>
        </div>
      </Card>
    </div>
  );
}
