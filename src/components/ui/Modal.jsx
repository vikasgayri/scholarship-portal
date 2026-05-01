import Button from "./Button";
import Card from "./Card";

export default function Modal({
  children,
  confirmLabel = "Confirm",
  isOpen,
  loading = false,
  onClose,
  onConfirm,
  title,
  variant = "primary",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <button
            aria-label="Close modal"
            className="rounded-xl px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        <div className="mt-4 text-sm leading-6 text-slate-600">{children}</div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button loading={loading} onClick={onConfirm} variant={variant}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
