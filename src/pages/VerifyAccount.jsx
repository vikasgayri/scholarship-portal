import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { api } from "../services/api";

export default function VerifyAccount() {
  const location = useLocation();
  const { showToast } = useToast();
  const initialVerification = location.state?.verification || null;
  const [email, setEmail] = useState(location.state?.email || initialVerification?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [verification, setVerification] = useState(initialVerification);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailVerified = verification?.emailVerified;

  async function handleVerifyEmail() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const nextVerification = await api.verifyEmail({ email, otp: emailOtp });
      setVerification(nextVerification);
      setMessage("Email verified successfully. You can now log in.");
      showToast({
        title: "Email verified",
        description: "Your account is ready for sign in.",
        variant: "success",
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Verification failed",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendEmail() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const nextVerification = await api.resendEmailOtp({ email });
      setVerification(nextVerification);
      setMessage("Email OTP sent.");
      showToast({
        title: "OTP sent",
        description: "Check your inbox for the latest verification code.",
        variant: "success",
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Unable to resend OTP",
        description: requestError.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Verification"
      description="Complete email verification to unlock role-based access and keep every student workspace secure."
      heading="Confirm your email before entering the portal."
      secondaryAction={
        <Button as={Link} size="sm" to="/login" variant="secondary">
          Back to login
        </Button>
      }
    >
      <Card className="glass-panel rounded-[32px] border-white/70 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="section-label">Account verification</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Verify account</h2>
          <p className="text-sm leading-6 text-slate-500">
            Use the one-time password sent to your inbox. Codes expire in 5 minutes.
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Verification status
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {isEmailVerified ? "Email verified" : "Email pending"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {isEmailVerified
              ? "You can safely continue to login."
              : "Verify once and future sign-ins will work normally."}
          </p>
        </div>

        {verification?.fallbackEmailOtp ? (
          <Alert className="mt-5" variant="info">
            Email is not configured on this backend. Use fallback OTP{" "}
            <strong>{verification.fallbackEmailOtp}</strong> to verify locally.
          </Alert>
        ) : null}

        <div className="mt-8 space-y-5">
          <Input
            label="Email address"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          <Input
            disabled={isEmailVerified}
            helperText="Enter the 6-digit OTP from your email."
            label="Email OTP"
            onChange={(event) => setEmailOtp(event.target.value)}
            value={emailOtp}
          />
        </div>

        {error ? <Alert className="mt-5" variant="error">{error}</Alert> : null}
        {message ? <Alert className="mt-5" variant="success">{message}</Alert> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            disabled={isEmailVerified || !email}
            loading={isSubmitting}
            onClick={handleVerifyEmail}
          >
            Verify email
            <FaArrowRight />
          </Button>
          <Button
            className="flex-1"
            disabled={isEmailVerified || !email || isSubmitting}
            onClick={handleResendEmail}
            variant="secondary"
          >
            Resend OTP
          </Button>
        </div>

        <p className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-500">
          {isEmailVerified ? "Verification complete. " : "Already verified? "}
          <Link className="font-semibold text-teal-700" to="/login">
            Go to login
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
