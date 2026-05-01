import { FaCircleCheck, FaCircleInfo, FaTriangleExclamation } from "react-icons/fa6";
import { cn } from "../../lib/utils";

const styles = {
  error: {
    icon: FaTriangleExclamation,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  success: {
    icon: FaCircleCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  info: {
    icon: FaCircleInfo,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
};

export default function Alert({ className, children, variant = "info" }) {
  const { className: toneClassName, icon: Icon } = styles[variant] || styles.info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
        toneClassName,
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
