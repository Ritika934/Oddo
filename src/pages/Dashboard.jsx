import { FiTruck, FiCheckCircle, FiTool, FiMap, FiUsers, FiPieChart, FiDroplet, FiDollarSign } from 'react-icons/fi';
import KpiCard from '../components/dashboard/KpiCard';
import TripsChart from '../components/dashboard/TripsChart';
import FuelCostChart from '../components/dashboard/FuelCostChart';
import UtilizationChart from '../components/dashboard/UtilizationChart';
import ExpenseBreakdownChart from '../components/dashboard/ExpenseBreakdownChart';
import { useAuth } from '../context/AuthContext';

const KPIS = [
  { label: 'Active vehicles', value: '42', icon: FiTruck, tone: 'default' },
  { label: 'Available vehicles', value: '27', icon: FiCheckCircle, tone: 'success' },
  { label: 'In maintenance', value: '5', icon: FiTool, tone: 'signal' },
  { label: 'Active trips', value: '19', icon: FiMap, tone: 'transit' },
  { label: 'Drivers on duty', value: '31', icon: FiUsers, tone: 'default' },
  { label: 'Fleet utilization', value: '72%', icon: FiPieChart, tone: 'transit', trend: '+4%' },
  { label: "Today's fuel cost", value: '₹18,400', icon: FiDroplet, tone: 'signal', trend: '-2%' },
  { label: 'Operational cost', value: '₹64,200', icon: FiDollarSign, tone: 'default', trend: '+6%' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs tracking-widest text-signal">FLEET STATUS</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900 dark:text-paper-50">
          Good to see you, {firstName || 'there'}.
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-paper-200">
          Here's what's moving across your fleet today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TripsChart />
        <FuelCostChart />
        <UtilizationChart />
        <ExpenseBreakdownChart />
      </div>
    </div>
  );
}
