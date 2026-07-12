import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../common/Card';

const data = [
  { name: 'Fuel', value: 45, color: '#E8A33D' },
  { name: 'Maintenance', value: 28, color: '#3DA5A0' },
  { name: 'Toll', value: 14, color: '#3FAE6B' },
  { name: 'Other', value: 13, color: '#8B94AA' },
];

export default function ExpenseBreakdownChart() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Expense breakdown</h3>
        <span className="font-mono text-[11px] text-ink-400">THIS MONTH</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} formatter={(v) => `${v}%`} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
