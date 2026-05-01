export default function PageHeader({
  action,
  eyebrow,
  subtitle,
  title,
}) {
  return (
    <section className="grid gap-4 rounded-[28px] bg-white/70 p-6 ring-1 ring-white/70 backdrop-blur sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
      <div className="space-y-3">
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="page-title text-balance">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="sm:justify-self-end">{action}</div> : null}
    </section>
  );
}
