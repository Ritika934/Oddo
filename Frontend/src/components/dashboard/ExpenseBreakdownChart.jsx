import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../common/Card';

const COLORS = ['#E8A33D', '#3DA5A0', '#3FAE6B', '#8B94AA'];

const DEFAULT_DATA = [
  { name: 'Fuel', value: 45 },
  { name: 'Maintenance', value: 28 },
  { name: 'Toll', value: 14 },
  { name: 'Other', value: 13 },
];

export default function ExpenseBreakdownChart({ data }) {
  const chartData = data || DEFAULT_DATA;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Expense breakdown</h3>
        <span className="font-mono text-[11px] text-ink-400">THIS MONTH</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} formatter={(v) => `${v}%`} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
