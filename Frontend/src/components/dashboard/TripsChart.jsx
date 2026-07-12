import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const DEFAULT_DATA = [
  { day: 'Mon', trips: 18 }, { day: 'Tue', trips: 24 }, { day: 'Wed', trips: 20 },
  { day: 'Thu', trips: 28 }, { day: 'Fri', trips: 32 }, { day: 'Sat', trips: 22 }, { day: 'Sun', trips: 14 },
];

export default function TripsChart({ data }) {
  const chartData = data || DEFAULT_DATA;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Trips per day</h3>
        <span className="font-mono text-[11px] text-ink-400">LAST 7 DAYS</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3DA5A0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3DA5A0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-ink-100 dark:text-ink-700" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B94AA' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
          <Area type="monotone" dataKey="trips" stroke="#3DA5A0" strokeWidth={2} fill="url(#tripsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
