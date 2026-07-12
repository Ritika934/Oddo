import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiCheckSquare } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import { maintenanceApi } from '../api/maintenance.api';
import { vehicleApi } from '../api/vehicle.api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const LIMIT = 10;
const STATUS_TONE = { 'In Shop': 'warn', Completed: 'success' };

export default function Maintenance() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination & Filtering
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formValues, setFormValues] = useState({
    vehicle_id: '',
    description: '',
  });
  const [completeCost, setCompleteCost] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await maintenanceApi.list({
        vehicle_id: selectedVehicleId,
        page,
        limit: LIMIT,
      });
      const data = response?.data;
      if (data) {
        setTickets(data.records || []);
        setTotalPages(Math.ceil((data.count || LIMIT) / LIMIT) || 1);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not load maintenance tickets. Is backend running?');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, page]);

  const loadVehicles = useCallback(async () => {
    try {
      // Load all vehicles for dropdown filters and log creation
      const response = await vehicleApi.getAll({ limit: 100 });
      setVehicles(response?.data?.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles for dropdowns', err);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    setPage(1);
  }, [selectedVehicleId]);

  const handleCreateOpen = () => {
    // Find available vehicles (status is 'Available') for new logs
    const availableVehs = vehicles.filter((v) => v.status === 'Available');
    setFormValues({
      vehicle_id: availableVehs[0]?.id || '',
      description: '',
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.vehicle_id || !formValues.description) {
      showToast('All fields are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await maintenanceApi.create(formValues);
      showToast('Maintenance logged successfully. Vehicle put In Shop.', 'success');
      setCreateOpen(false);
      loadTickets();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to log maintenance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeCost || Number(completeCost) < 0) {
      showToast('Repair cost must be a non-negative number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await maintenanceApi.complete(completeTarget.id, {
        cost: Number(completeCost),
      });
      showToast('Maintenance closed. Vehicle restored to Available.', 'success');
      setCompleteTarget(null);
      setCompleteCost('');
      loadTickets();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to close maintenance ticket', 'error');
    } finally {
      setSubmitting(false);
    }
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
      key: 'description',
      header: 'Issue / Description',
      render: (r) => <span className="text-sm">{r.description}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (r) => (r.status === 'Completed' ? formatCurrency(r.cost) : '—'),
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (r) => formatDate(r.start_date),
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (r) => (r.end_date ? formatDate(r.end_date) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        if (r.status !== 'In Shop') return null;
        return (
          <button
            onClick={() => {
              setCompleteTarget(r);
              setCompleteCost('');
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-success/10 text-success hover:bg-success hover:text-white transition-all duration-150"
            aria-label="Complete service order"
          >
            <FiCheckSquare size={13} /> Complete
          </button>
        );
      },
    },
  ];

  const availableVehsForLogs = vehicles.filter((v) => v.status === 'Available');

  return (
    <div>
      <PageHeader
        eyebrow="SERVICE BAY"
        title="Maintenance"
        description="Open work orders and full service history per vehicle."
        action={<Button onClick={handleCreateOpen}><FiPlus size={16} /> Log maintenance</Button>}
      />

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
          <Loader label="Loading maintenance tickets" />
        ) : errorMsg ? (
          <div className="p-8 text-center text-sm text-danger">{errorMsg}</div>
        ) : (
          <>
            <Table columns={columns} data={tickets} emptyLabel="No service records match your filter" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Log Maintenance Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Log Maintenance Ticket"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Vehicle</label>
            <select
              value={formValues.vehicle_id}
              onChange={(e) => setFormValues((v) => ({ ...v, vehicle_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              {availableVehsForLogs.length === 0 ? (
                <option value="">No vehicles are currently Available (all busy or in shop)</option>
              ) : (
                availableVehsForLogs.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_name} ({v.registration_number})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Description of Issue</label>
            <textarea
              value={formValues.description}
              onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
              placeholder="e.g. Brake pad wear replacement, transmission check..."
              required
              rows={4}
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || availableVehsForLogs.length === 0}>
              {submitting ? 'Logging…' : 'Log Ticket'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Maintenance Modal */}
      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="Complete Maintenance Service"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <p className="text-sm text-ink-600 dark:text-paper-200">
            Closing service order for vehicle <strong>{completeTarget?.vehicle_name}</strong>.
          </p>
          <div className="border border-ink-100 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 p-3 rounded-lg text-xs space-y-1">
            <div><strong>Issue</strong>: {completeTarget?.description}</div>
            <div><strong>Started</strong>: {formatDate(completeTarget?.start_date)}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Total Maintenance Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={completeCost}
              onChange={(e) => setCompleteCost(e.target.value)}
              required
              placeholder="e.g. 3500.50"
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCompleteTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Completing…' : 'Close Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
