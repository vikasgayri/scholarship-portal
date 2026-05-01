import Card from "./Card";

export default function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}) {
  return (
    <Card className="flex min-h-[260px] flex-col items-center justify-center border-dashed text-center">
      {Icon ? (
        <span className="mb-4 rounded-2xl bg-slate-100 p-4 text-2xl text-slate-500">
          <Icon />
        </span>
      ) : null}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
