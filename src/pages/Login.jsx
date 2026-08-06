import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaCheck, FaKey, FaLock, FaXmark } from "react-icons/fa6";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

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

const initialResetForm = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { label: "Enter a new password", percent: 0, tone: "bg-slate-200" };
  }

  if (score <= 2) {
    return { label: "Weak password", percent: 35, tone: "bg-red-500" };
  }

  if (score <= 4) {
    return { label: "Good password", percent: 70, tone: "bg-amber-500" };
  }

  return { label: "Strong password", percent: 100, tone: "bg-emerald-500" };
}

function validateResetPassword(values, requireOtp = false) {
  const nextErrors = {};

  if (requireOtp && !/^\d{6}$/.test(values.otp)) {
    nextErrors.otp = "Enter the 6-digit OTP sent to your email.";
  }

  if (!values.newPassword) {
    nextErrors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 8) {
    nextErrors.newPassword = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.newPassword) || !/\d/.test(values.newPassword)) {
    nextErrors.newPassword = "Use at least one uppercase letter and one number.";
  }

  if (!values.confirmPassword) {
    nextErrors.confirmPassword = "Confirm your new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    nextErrors.confirmPassword = "Passwords do not match.";
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
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetForm, setResetForm] = useState(initialResetForm);
  const [resetErrors, setResetErrors] = useState({});
  const [resetMessage, setResetMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const passwordStrength = useMemo(
    () => getPasswordStrength(resetForm.newPassword),
    [resetForm.newPassword],
  );

  useEffect(() => {
    if (!resetSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      closeResetModal();
      navigate("/login", { replace: true });
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, resetSuccess]);

  if (isAuthenticated) {
    return <Navigate replace to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} />;
  }

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function openResetModal() {
    setResetForm((current) => ({ ...current, email: formData.email }));
    setResetErrors({});
    setResetMessage("");
    setResetSuccess("");
    setResetLoading("");
    setIsOtpVerified(false);
    setResetStep(1);
    setIsResetOpen(true);
  }

  function closeResetModal() {
    setIsResetOpen(false);
    setResetStep(1);
    setResetForm(initialResetForm);
    setResetErrors({});
    setResetMessage("");
    setResetSuccess("");
    setResetLoading("");
    setIsOtpVerified(false);
  }

  function handleResetChange(field, value) {
    const nextValue = field === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setResetForm((current) => ({ ...current, [field]: nextValue }));
    setResetErrors((current) => ({ ...current, [field]: "" }));
    setResetMessage("");

    if (field === "otp") {
      setIsOtpVerified(false);
    }
  }

  async function handleSendOtp() {
    const email = resetForm.email.trim();

    if (!email) {
      setResetErrors({ email: "Email is required." });
      return;
    }

    if (!isValidEmail(email)) {
      setResetErrors({ email: "Enter a valid email address." });
      return;
    }

    setResetLoading("send");
    setResetErrors({});
    setResetMessage("");

    try {
      const response = await api.forgotPassword({ email });
      setResetMessage(response.message || "OTP has been sent to your registered email.");
      setResetStep(2);
      showToast({
        title: "OTP sent",
        description: "OTP has been sent to your registered email.",
        variant: "success",
      });
    } catch (requestError) {
      setResetErrors({ email: requestError.message });
      showToast({
        title: "Unable to send OTP",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setResetLoading("");
    }
  }

  async function handleVerifyResetOtp() {
    if (!/^\d{6}$/.test(resetForm.otp)) {
      setResetErrors({ otp: "Enter the 6-digit OTP sent to your email." });
      return;
    }

    setResetLoading("verify");
    setResetErrors({});
    setResetMessage("");

    try {
      await api.verifyResetOtp({
        email: resetForm.email.trim(),
        otp: resetForm.otp,
      });
      setIsOtpVerified(true);
      setResetMessage("OTP verified successfully. You can now reset your password.");
      showToast({
        title: "OTP verified",
        description: "You can now reset your password.",
        variant: "success",
      });
    } catch (requestError) {
      setIsOtpVerified(false);
      setResetErrors({ otp: requestError.message });
      showToast({
        title: "Invalid OTP",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setResetLoading("");
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    const nextErrors = validateResetPassword(resetForm, true);

    setResetErrors(nextErrors);
    setResetMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setResetLoading("reset");

    try {
      await api.resetPassword({
        email: resetForm.email.trim(),
        otp: resetForm.otp,
        newPassword: resetForm.newPassword,
      });
      setResetSuccess("Password changed successfully.");
      showToast({
        title: "Password changed",
        description: "Password changed successfully.",
        variant: "success",
      });
    } catch (requestError) {
      setResetErrors({ form: requestError.message });
      showToast({
        title: "Unable to reset password",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setResetLoading("");
    }
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
            label="Password"
            onChange={(event) => handleChange("password", event.target.value)}
            type="password"
            value={formData.password}
          />

          <div className="-mt-2 flex justify-end">
            <button
              className="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
              onClick={openResetModal}
              type="button"
            >
              Forgot Password?
            </button>
          </div>

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

      {isResetOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <Card className="w-full max-w-xl animate-[fadeIn_180ms_ease-out] rounded-[28px] border-white/80 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">Account recovery</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Reset password</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {resetStep === 1
                    ? "Enter your registered email address to receive a secure 6-digit OTP."
                    : "Verify the OTP and choose a new password for your ScholarHub account."}
                </p>
              </div>
              <button
                aria-label="Close password reset"
                className="rounded-2xl p-3 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={closeResetModal}
                type="button"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
              <span className={resetStep === 1 ? "rounded-xl bg-white px-3 py-2 text-teal-700 shadow-sm" : "px-3 py-2 text-slate-500"}>
                1. Email
              </span>
              <span className={resetStep === 2 ? "rounded-xl bg-white px-3 py-2 text-teal-700 shadow-sm" : "px-3 py-2 text-slate-500"}>
                2. Reset
              </span>
            </div>

            {resetMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {resetMessage}
              </div>
            ) : null}

            {resetSuccess ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <FaCheck />
                {resetSuccess}
              </div>
            ) : null}

            {resetErrors.form ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {resetErrors.form}
              </div>
            ) : null}

            {resetStep === 1 ? (
              <div className="mt-6 space-y-5">
                <Input
                  autoComplete="email"
                  error={resetErrors.email}
                  label="Registered email address"
                  onChange={(event) => handleResetChange("email", event.target.value)}
                  type="email"
                  value={resetForm.email}
                />
                <Button
                  className="w-full"
                  loading={resetLoading === "send"}
                  onClick={handleSendOtp}
                  size="lg"
                  type="button"
                >
                  Send OTP
                  <FaKey />
                </Button>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleResetPassword}>
                <Input
                  autoComplete="one-time-code"
                  className="text-center text-lg font-semibold tracking-[0.28em]"
                  error={resetErrors.otp}
                  helperText={isOtpVerified ? "OTP verified." : "Enter the 6-digit code from your email."}
                  inputMode="numeric"
                  label="OTP"
                  maxLength={6}
                  onChange={(event) => handleResetChange("otp", event.target.value)}
                  pattern="[0-9]*"
                  value={resetForm.otp}
                />

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Button
                    loading={resetLoading === "verify"}
                    onClick={handleVerifyResetOtp}
                    type="button"
                    variant="secondary"
                  >
                    Verify OTP
                  </Button>
                  {isOtpVerified ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      <FaCheck />
                      Verified
                    </div>
                  ) : null}
                </div>

                <Input
                  autoComplete="new-password"
                  error={resetErrors.newPassword}
                  label="New Password"
                  onChange={(event) => handleResetChange("newPassword", event.target.value)}
                  type="password"
                  value={resetForm.newPassword}
                />

                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.tone}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{passwordStrength.label}</p>
                </div>

                <Input
                  autoComplete="new-password"
                  error={resetErrors.confirmPassword}
                  label="Confirm Password"
                  onChange={(event) => handleResetChange("confirmPassword", event.target.value)}
                  type="password"
                  value={resetForm.confirmPassword}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button onClick={() => setResetStep(1)} type="button" variant="secondary">
                    Change email
                  </Button>
                  <Button loading={resetLoading === "reset"} type="submit">
                    Reset Password
                    <FaArrowRight />
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      ) : null}
    </AuthShell>
  );
}
