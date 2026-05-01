import { useMemo, useState } from "react";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  course: "",
  phoneNumber: "",
  city: "",
  state: "",
};

const fieldConfig = [
  ["name", "Full name", "text"],
  ["email", "Email address", "email"],
  ["password", "Password", "password"],
  ["course", "Course or program", "text"],
  ["phoneNumber", "Phone number", "text"],
  ["city", "City", "text"],
  ["state", "State", "text"],
];

function validateRegister(values) {
  const nextErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "Full name is required.";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    nextErrors.password = "Password is required.";
  } else if (values.password.length < 6) {
    nextErrors.password = "Password must be at least 6 characters.";
  }

  if (!values.course.trim()) {
    nextErrors.course = "Course is required.";
  }

  if (!values.phoneNumber.trim()) {
    nextErrors.phoneNumber = "Phone number is required.";
  } else if (values.phoneNumber.replace(/\D/g, "").length < 10) {
    nextErrors.phoneNumber = "Enter a valid phone number.";
  }

  if (!values.city.trim()) {
    nextErrors.city = "City is required.";
  }

  if (!values.state.trim()) {
    nextErrors.state = "State is required.";
  }

  return nextErrors;
}

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const highlights = useMemo(
    () => [
      "Fast onboarding for students",
      "Clean validation for profile readiness",
      "Email verification before first login",
    ],
    [],
  );

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(formData);

    setFieldErrors(nextErrors);
    setError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registration = await register(formData);

      showToast({
        title: "Account created",
        description: "Verify your email to unlock login access.",
        variant: "success",
      });

      navigate("/verify-account", {
        replace: true,
        state: {
          email: registration.user.email,
          verification: registration.verification,
          message: "Account created. Verify your email before logging in.",
        },
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Registration failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Student onboarding"
      description="Create a complete student profile once, then apply with confidence across every scholarship cycle."
      heading="Build your application-ready scholarship profile."
      secondaryAction={
        <Button as={Link} size="sm" to="/login" variant="secondary">
          Sign in
        </Button>
      }
    >
      <Card className="glass-panel rounded-[32px] border-white/70 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="section-label">Create account</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Register</h2>
          <p className="text-sm leading-6 text-slate-500">
            Set up your profile details so applications, documents, and review history stay
            connected to one account.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span
              className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700"
              key={item}
            >
              <FaCheckCircle />
              {item}
            </span>
          ))}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldConfig.map(([field, label, type]) => (
              <Input
                autoComplete={field}
                error={fieldErrors[field]}
                key={field}
                label={label}
                onChange={(event) => handleChange(field, event.target.value)}
                type={type}
                value={formData[field]}
              />
            ))}
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button className="w-full" loading={isSubmitting} size="lg" type="submit">
            Create account
            <FaArrowRight />
          </Button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-700" to="/login">
            Sign in here
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
