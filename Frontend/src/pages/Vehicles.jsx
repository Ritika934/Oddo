import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiActivity, FiCheckCircle, FiTool, FiAlertOctagon } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VehicleForm from '../components/vehicle/VehicleForm';
import { vehicleApi } from '../api/vehicle.api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';

const STATUS_TONE = {
  available: 'success',
  on_trip: 'info',
  in_shop: 'warning',
  retired: 'danger'
};

const STATUS_LABELS = {
  available: 'Available',
  on_trip: 'On Trip',
  in_shop: 'In Shop',
  retired: 'Retired'
};

export default function Vehicles() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Confirm delete states
  const [vehicleToRetire, setVehicleToRetire] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleApi.getAll({
        search,
        status: filters.status,
        page,
        limit: 10
      });
      const data = response?.data;
      if (data && data.vehicles) {
        setVehicles(data.vehicles);
        // Estimate total pages (assuming limit is 10)
        setTotalPages(Math.ceil((data.count || 10) / 10) || 1);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, filters, page]);

  // Real-time Fleet distribution calculations for graphics
  const stats = useMemo(() => {
    const counts = { available: 0, on_trip: 0, in_shop: 0, retired: 0 };
    vehicles.forEach(v => {
      const status = v.status?.toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    const total = vehicles.length || 1;
    return {
      available: counts.available,
      on_trip: counts.on_trip,
      in_shop: counts.in_shop,
      retired: counts.retired,
      availablePct: Math.round((counts.available / total) * 100),
      onTripPct: Math.round((counts.on_trip / total) * 100),
      inShopPct: Math.round((counts.in_shop / total) * 100),
      retiredPct: Math.round((counts.retired / total) * 100),
      total: vehicles.length
    };
  }, [vehicles]);

  const handleCreateOrUpdate = async (data) => {
    setFormLoading(true);
    try {
      if (selectedVehicle) {
        // Edit mode
        await vehicleApi.update(selectedVehicle.id, data);
        showToast('Vehicle updated successfully.', 'success');
      } else {
        // Create mode
        await vehicleApi.create(data);
        showToast('Vehicle added to registry.', 'success');
      }
      setIsFormOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      showToast(error.message || 'Action failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRetire = async () => {
    if (!vehicleToRetire) return;
    try {
      await vehicleApi.delete(vehicleToRetire.id);
      showToast('Vehicle retired successfully.', 'success');
      setVehicleToRetire(null);
      fetchVehicles();
    } catch (error) {
      showToast(error.message || 'Failed to retire vehicle', 'error');
    }
  };

  const columns = [
    { key: 'registration_number', header: 'Registration', render: (r) => <span className="font-mono font-medium">{r.registration_number}</span> },
    { key: 'vehicle_name', header: 'Vehicle Name' },
    { key: 'model', header: 'Model', render: (r) => <span>{r.model || '—'}</span> },
    { key: 'vehicle_type', header: 'Type' },
    { key: 'max_load_capacity', header: 'Capacity', render: (r) => <span>{r.max_load_capacity} kg</span> },
    { key: 'odometer', header: 'Odometer', render: (r) => <span>{Number(r.odometer).toLocaleString()} km</span> },
    { key: 'acquisition_cost', header: 'Cost', render: (r) => <span>{formatCurrency(r.acquisition_cost)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status?.toLowerCase()] || 'neutral'}>{STATUS_LABELS[r.status?.toLowerCase()] || r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            tone="neutral"
            onClick={() => {
              setSelectedVehicle(r);
              setIsFormOpen(true);
            }}
          >
            <FiEdit2 size={13} />
          </Button>
          {r.status?.toLowerCase() !== 'retired' && (
            <Button
              size="xs"
              tone="danger"
              onClick={() => setVehicleToRetire(r)}
            >
              <FiTrash2 size={13} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FLEET REGISTRY"
        title="Vehicles"
        description="Every unit in the fleet, its capacity, and live status information."
        action={
          <Button onClick={() => { setSelectedVehicle(null); setIsFormOpen(true); }}>
            <FiPlus size={16} /> Add vehicle
          </Button>
        }
      />

      {/* Real-time Fleet distribution graph bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/15 text-success">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-paper-300 font-medium uppercase tracking-wider">Available</p>
            <p className="text-2xl font-bold font-display mt-0.5">{stats.available}</p>
            <div className="w-24 bg-ink-100 dark:bg-ink-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-success h-full rounded-full" style={{ width: `${stats.availablePct || 0}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-info/15 text-info">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-paper-300 font-medium uppercase tracking-wider">On Trip</p>
            <p className="text-2xl font-bold font-display mt-0.5">{stats.on_trip}</p>
            <div className="w-24 bg-ink-100 dark:bg-ink-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-info h-full rounded-full" style={{ width: `${stats.onTripPct || 0}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/15 text-warning">
            <FiTool size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-paper-300 font-medium uppercase tracking-wider">In Shop</p>
            <p className="text-2xl font-bold font-display mt-0.5">{stats.in_shop}</p>
            <div className="w-24 bg-ink-100 dark:bg-ink-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-warning h-full rounded-full" style={{ width: `${stats.inShopPct || 0}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-danger/15 text-danger">
            <FiAlertOctagon size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-paper-300 font-medium uppercase tracking-wider">Retired</p>
            <p className="text-2xl font-bold font-display mt-0.5">{stats.retired}</p>
            <div className="w-24 bg-ink-100 dark:bg-ink-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-danger h-full rounded-full" style={{ width: `${stats.retiredPct || 0}%` }}></div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or registration…" />
          <FilterBar
            values={filters}
            onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
            filters={[
              {
                key: 'status',
                label: 'All statuses',
                options: [
                  { value: 'available', label: 'Available' },
                  { value: 'on_trip', label: 'On Trip' },
                  { value: 'in_shop', label: 'In Shop' },
                  { value: 'retired', label: 'Retired' }
                ]
              },
              {
                key: 'type',
                label: 'All types',
                options: [
                  { value: 'Truck', label: 'Truck' },
                  { value: 'Van', label: 'Van' },
                  { value: 'Pickup', label: 'Pickup' }
                ]
              },
            ]}
          />
        </div>
        <Table
          columns={columns}
          data={vehicles}
          loading={loading}
          emptyLabel="No vehicles match your search or filters"
        />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedVehicle(null); }}
        title={selectedVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
      >
        <VehicleForm
          initialData={selectedVehicle}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => { setIsFormOpen(false); setSelectedVehicle(null); }}
          loading={formLoading}
        />
      </Modal>

      {/* Retire Confirmation dialog */}
      <ConfirmDialog
        isOpen={!!vehicleToRetire}
        onClose={() => setVehicleToRetire(null)}
        onConfirm={handleRetire}
        title="Retire Vehicle?"
        message={`Are you sure you want to retire vehicle ${vehicleToRetire?.registration_number}? This will change its status to Retired and it will no longer be available for dispatch.`}
      />
    </div>
  );
}
