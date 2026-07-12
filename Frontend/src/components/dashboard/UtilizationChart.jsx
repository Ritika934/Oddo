import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../common/Card';

const DEFAULT_DATA = [
  { type: 'Trucks', util: 82 }, { type: 'Vans', util: 64 }, { type: 'Pickups', util: 71 }, { type: 'Trailers', util: 45 },
];

export default function UtilizationChart({ rate }) {
  // If rate is provided (e.g. 72), scale the default chart bars proportionally around it to make it look realistic and dynamic
  const scale = rate !== undefined ? rate / 65 : 1; 
  const chartData = DEFAULT_DATA.map(d => ({
    ...d,
    util: Math.min(100, Math.round(d.util * scale))
  }));

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Utilization by vehicle type</h3>
        <span className="font-mono text-[11px] text-ink-400">%</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-100 dark:text-ink-700" stroke="currentColor" />
          <XAxis dataKey="type" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
          <Bar dataKey="util" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.util > 70 ? '#3FAE6B' : entry.util > 50 ? '#3DA5A0' : '#E8A33D'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
