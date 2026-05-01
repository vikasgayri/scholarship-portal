import { useState } from "react";
import { FaArrowRight, FaLock } from "react-icons/fa6";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";

function validateLogin(values) {
  const nextErrors = {};

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

  return nextErrors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} />;
  }

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(formData);

    setFieldErrors(nextErrors);
    setError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(formData);
      const redirectTarget =
        location.state?.from?.pathname ||
        (authenticatedUser.role === "ADMIN" ? "/admin" : "/dashboard");

      showToast({
        title: "Welcome back",
        description: "Your workspace is ready.",
        variant: "success",
      });

      navigate(redirectTarget, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Unable to sign in",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Secure login"
      description="Sign in to review live scholarship opportunities, monitor applications, and keep every student document in one trusted workspace."
      heading="A professional portal for scholarship operations."
      secondaryAction={
        <Button as={Link} size="sm" to="/register" variant="secondary">
          Create account
        </Button>
      }
    >
      <Card className="glass-panel rounded-[32px] border-white/70 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="section-label">Welcome back</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in</h2>
          <p className="text-sm leading-6 text-slate-500">
            Enter your credentials to continue into your scholarship workspace.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            error={fieldErrors.email}
            label="Email address"
            onChange={(event) => handleChange("email", event.target.value)}
            type="email"
            value={formData.email}
          />

          <Input
            autoComplete="current-password"
            error={fieldErrors.password}
            helperText="Use your registered email and password."
            label="Password"
            onChange={(event) => handleChange("password", event.target.value)}
            type="password"
            value={formData.password}
          />

          {error ? (
            <Alert variant="error">
              <p>{error}</p>
              {error.toLowerCase().includes("verify") ? (
                <p className="mt-2">
                  Need to finish verification?{" "}
                  <Link className="font-semibold underline" to="/verify-account">
                    Verify account
                  </Link>
                </p>
              ) : null}
            </Alert>
          ) : null}

          <Button className="w-full" loading={isSubmitting} size="lg" type="submit">
            Open workspace
            <FaArrowRight />
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p className="flex items-center gap-2">
            <FaLock className="text-teal-700" />
            Protected by role-based access controls
          </p>
          <p>
            New here?{" "}
            <Link className="font-semibold text-teal-700" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </Card>
    </AuthShell>
  );
}
