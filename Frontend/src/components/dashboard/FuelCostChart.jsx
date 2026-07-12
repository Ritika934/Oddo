import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const DEFAULT_DATA = [
  { week: 'W1', cost: 42000 }, { week: 'W2', cost: 38500 }, { week: 'W3', cost: 51000 },
  { week: 'W4', cost: 47000 }, { week: 'W5', cost: 56500 }, { week: 'W6', cost: 49000 },
];

export default function FuelCostChart({ data }) {
  const chartData = data || DEFAULT_DATA;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Fuel cost trend</h3>
        <span className="font-mono text-[11px] text-ink-400">₹ / WEEK</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-100 dark:text-ink-700" stroke="currentColor" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Cost']} />
          <Line type="monotone" dataKey="cost" stroke="#E8A33D" strokeWidth={2.5} dot={{ r: 3, fill: '#E8A33D' }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
