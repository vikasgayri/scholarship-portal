import { useId, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { cn } from "../../lib/utils";

export default function Input({
  as = "input",
  className,
  error,
  helperText,
  id,
  label,
  options,
  type = "text",
  value,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && passwordVisible ? "text" : type;
  const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const elevated = isFocused || hasValue || as === "select";
  const sharedProps = {
    id: fieldId,
    onBlur: (event) => {
      setIsFocused(false);
      props.onBlur?.(event);
    },
    onFocus: (event) => {
      setIsFocused(true);
      props.onFocus?.(event);
    },
    value,
    ...props,
  };

  const fieldClassName = cn(
    "w-full rounded-2xl border bg-white px-4 pb-3 pt-6 text-sm text-slate-900 outline-none transition",
    "placeholder:text-transparent focus:ring-4",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-teal-500 focus:ring-teal-100",
    as === "textarea" ? "min-h-[132px] resize-y" : "h-14",
    as === "select" ? "appearance-none pr-10" : "",
    isPassword ? "pr-12" : "",
    className,
  );

  return (
    <div className="space-y-1.5">
      <div className="relative">
        {as === "textarea" ? (
          <textarea {...sharedProps} className={fieldClassName} />
        ) : as === "select" ? (
          <select {...sharedProps} className={fieldClassName}>
            {options}
          </select>
        ) : (
          <input {...sharedProps} className={fieldClassName} type={resolvedType} />
        )}

        <label
          className={cn(
            "pointer-events-none absolute left-4 text-slate-500 transition-all duration-200",
            elevated ? "top-2 text-xs font-semibold uppercase tracking-[0.16em]" : "top-4 text-sm",
            error ? "text-red-500" : "text-slate-500",
          )}
          htmlFor={fieldId}
        >
          {label}
        </label>

        {isPassword ? (
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
            onClick={() => setPasswordVisible((current) => !current)}
            type="button"
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}
    </div>
  );
}
