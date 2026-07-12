import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiActivity } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { fuelApi } from '../api/fuel.api';
import { vehicleApi } from '../api/vehicle.api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const LIMIT = 10;

export default function Fuel() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination & Filtering
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Efficiency data for selected vehicle
  const [efficiencyStats, setEfficiencyStats] = useState(null);
  const [loadingEfficiency, setLoadingEfficiency] = useState(false);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formValues, setFormValues] = useState({
    vehicle_id: '',
    fill_date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: '',
    odometer: '',
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fuelApi.list({
        vehicle_id: selectedVehicleId,
        page,
        limit: LIMIT,
      });
      const data = response?.data;
      if (data) {
        setLogs(data.logs || []);
        setTotalPages(Math.ceil((data.count || LIMIT) / LIMIT) || 1);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not load fuel logs. Is backend running?');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, page]);

  const loadVehicles = useCallback(async () => {
    try {
      const response = await vehicleApi.getAll({ limit: 100 });
      setVehicles(response?.data?.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles dropdown', err);
    }
  }, []);

  const loadEfficiency = useCallback(async () => {
    if (!selectedVehicleId) {
      setEfficiencyStats(null);
      return;
    }
    setLoadingEfficiency(true);
    try {
      const response = await fuelApi.getEfficiency(selectedVehicleId);
      setEfficiencyStats(response?.data?.stats || null);
    } catch (err) {
      console.error('Failed to load efficiency statistics', err);
    } finally {
      setLoadingEfficiency(false);
    }
  }, [selectedVehicleId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    loadEfficiency();
  }, [loadEfficiency]);

  useEffect(() => {
    setPage(1);
  }, [selectedVehicleId]);

  const handleCreateOpen = () => {
    setFormValues({
      vehicle_id: vehicles[0]?.id || '',
      fill_date: new Date().toISOString().split('T')[0],
      liters: '',
      cost: '',
      odometer: '',
    });
    setCreateOpen(true);
  };

  const handleFormChange = (key, val) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    // Auto-fill current vehicle odometer as suggestion
    if (key === 'vehicle_id') {
      const v = vehicles.find((veh) => veh.id === val);
      if (v) {
        setFormValues((prev) => ({ ...prev, odometer: v.odometer }));
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.vehicle_id || !formValues.liters || !formValues.cost || !formValues.odometer || !formValues.fill_date) {
      showToast('All fields are required', 'error');
      return;
    }
    if (Number(formValues.liters) <= 0 || Number(formValues.cost) < 0 || Number(formValues.odometer) < 0) {
      showToast('Please enter valid numeric measurements', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await fuelApi.create({
        ...formValues,
        liters: Number(formValues.liters),
        cost: Number(formValues.cost),
        odometer: Number(formValues.odometer),
      });
      showToast('Fuel log recorded successfully.', 'success');
      setCreateOpen(false);
      loadLogs();
      loadEfficiency();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save fuel log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalLiters = logs.reduce((sum, f) => sum + Number(f.liters), 0);
  const totalCost = logs.reduce((sum, f) => sum + Number(f.cost), 0);

  // Map each log to its efficiency calculation from the history array (matching log_id)
  const getLogEfficiencyValue = (logId) => {
    if (!efficiencyStats?.history) return null;
    const historyItem = efficiencyStats.history.find((h) => h.log_id === logId);
    return historyItem ? `${historyItem.efficiency} km/L` : null;
  };

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900 dark:text-paper-50">{r.vehicle_name || 'N/A'}</span>
          <span className="font-mono text-xs text-ink-500">{r.registration_number || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'liters',
      header: 'Fuel (L)',
      render: (r) => `${Number(r.liters).toFixed(2)} L`,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (r) => <span className="font-semibold">{formatCurrency(r.cost)}</span>,
    },
    {
      key: 'fill_date',
      header: 'Fill Date',
      render: (r) => formatDate(r.fill_date),
    },
    {
      key: 'odometer',
      header: 'Odometer',
      render: (r) => <span className="font-mono">{Number(r.odometer).toLocaleString()} km</span>,
    },
    {
      key: 'efficiency',
      header: 'Trip Efficiency',
      render: (r) => {
        if (!selectedVehicleId) {
          return <span className="text-xs text-ink-400">Filter vehicle to view</span>;
        }
        const val = getLogEfficiencyValue(r.id);
        return val ? <span className="font-semibold text-success">{val}</span> : <span className="text-ink-400">— (Initial)</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FUEL LEDGER"
        title="Fuel logs"
        description={`Page totals: ${totalLiters.toFixed(1)} L · ${formatCurrency(totalCost)}`}
        action={<Button onClick={handleCreateOpen}><FiPlus size={16} /> Add fuel log</Button>}
      />

      {/* Real-time efficiency header display when vehicle is selected */}
      {selectedVehicleId && efficiencyStats && (
        <Card className="p-4 bg-ink-850 border border-ink-800 shadow-plate rounded-xl">
          {loadingEfficiency ? (
            <Loader size="sm" label="Calculating efficiency..." />
          ) : (
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <FiActivity size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">Average Efficiency</p>
                <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-50">
                  {efficiencyStats.average_efficiency} <span className="text-sm font-medium text-ink-500">km/L</span>
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Calculated based on {efficiencyStats.history.length + 1} successive fill-ups.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2 text-xs text-ink-700 dark:text-paper-100 focus:outline-none focus:ring-1 focus:ring-transit"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicle_name} ({v.registration_number})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loader label="Loading fuel logs" />
        ) : errorMsg ? (
          <div className="p-8 text-center text-sm text-danger">{errorMsg}</div>
        ) : (
          <>
            <Table columns={columns} data={logs} emptyLabel="No fuel log records found" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Add Fuel Log Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Fuel Log Entry"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Vehicle</label>
            <select
              value={formValues.vehicle_id}
              onChange={(e) => handleFormChange('vehicle_id', e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_name} ({v.registration_number}) · Odo: {v.odometer} km
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Fuel Quantity (Liters)</label>
              <input
                type="number"
                step="0.01"
                value={formValues.liters}
                onChange={(e) => handleFormChange('liters', e.target.value)}
                required
                placeholder="e.g. 45.5"
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Total Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formValues.cost}
                onChange={(e) => handleFormChange('cost', e.target.value)}
                required
                placeholder="e.g. 4800"
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Current Odometer (km)</label>
              <input
                type="number"
                value={formValues.odometer}
                onChange={(e) => handleFormChange('odometer', e.target.value)}
                required
                placeholder="Odometer reading"
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Fill Date</label>
              <input
                type="date"
                value={formValues.fill_date}
                onChange={(e) => handleFormChange('fill_date', e.target.value)}
                required
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Record Log'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
