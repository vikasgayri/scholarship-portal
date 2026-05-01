import Card from "./Card";

export default function StatCard({ accent = "teal", icon: Icon, label, tone, value }) {
  const colorMap = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    teal: "bg-teal-50 text-teal-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <Card className="group hover:-translate-y-0.5 hover:shadow-strong">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {tone ? <p className="mt-2 text-sm text-slate-500">{tone}</p> : null}
        </div>
        <span className={`rounded-2xl p-3 text-xl ${colorMap[accent] || colorMap.teal}`}>
          <Icon />
        </span>
      </div>
    </Card>
  );
}
