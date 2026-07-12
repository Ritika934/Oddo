import { useEffect, useState } from 'react';
import { FiTruck, FiCheckCircle, FiTool, FiMap, FiUsers, FiPieChart, FiDroplet, FiDollarSign } from 'react-icons/fi';
import KpiCard from '../components/dashboard/KpiCard';
import TripsChart from '../components/dashboard/TripsChart';
import FuelCostChart from '../components/dashboard/FuelCostChart';
import UtilizationChart from '../components/dashboard/UtilizationChart';
import ExpenseBreakdownChart from '../components/dashboard/ExpenseBreakdownChart';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboard.api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/common/Loader';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0];

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      if (response && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};

  const KPIS_LIST = [
    { label: 'Total Vehicles', value: kpis.totalVehicles || '0', icon: FiTruck, tone: 'default' },
    { label: 'Available Vehicles', value: kpis.availableVehicles || '0', icon: FiCheckCircle, tone: 'success' },
    { label: 'In Maintenance', value: kpis.inMaintenance || '0', icon: FiTool, tone: 'signal' },
    { label: 'Active Trips', value: kpis.activeTrips || '0', icon: FiMap, tone: 'transit' },
    { label: 'Fleet Odometer', value: kpis.totalOdometer || '0 km', icon: FiUsers, tone: 'default' },
    { label: 'Fleet Utilization', value: kpis.utilizationRate || '0%', icon: FiPieChart, tone: 'transit', trend: kpis.utilizationRate !== '0%' ? '+4%' : undefined },
    { label: "Today's Fuel Cost", value: kpis.todayFuelCost || '₹0', icon: FiDroplet, tone: 'signal', trend: '-2%' },
    { label: 'Operational Cost', value: kpis.operationalCost || '₹0', icon: FiDollarSign, tone: 'default', trend: '+6%' },
  ];

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
        {KPIS_LIST.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TripsChart data={charts.tripTrends} />
        <FuelCostChart data={charts.fuelCostTrend} />
        <UtilizationChart rate={charts.utilizationPct} />
        <ExpenseBreakdownChart data={charts.expenseBreakdown} />
      </div>
    </div>
  );
}
