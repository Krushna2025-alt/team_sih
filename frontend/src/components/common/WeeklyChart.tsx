export default function WeeklyChart({ data, color = '#16a34a' }: { data: { day: string; amount: number }[]; color?: string }) {
const max = Math.max(...data.map((d) => d.amount), 1);
return (
<div className="flex h-40 items-end gap-2">
{data.map((d) => (
<div key={d.day} className="flex flex-1 flex-col items-center gap-1">
<div className="w-full rounded-t" style={{ height: `${(d.amount / max) * 100}%`, background: color, minHeight: 4 }} />
<span className="text-xs text-gray-500">{d.day}</span>
</div>
))}
</div>
);
}
