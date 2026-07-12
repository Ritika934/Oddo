import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiArrowRight, FiCheckSquare, FiXCircle, FiMapPin, FiCompass, FiSend } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FilterBar from '../components/common/FilterBar';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import { tripApi } from '../api/trip.api';
import { vehicleApi } from '../api/vehicle.api';
import { driverApi } from '../api/driver.api';
import { useToast } from '../context/ToastContext';

const STATUS_TONE = { Draft: 'neutral', Dispatched: 'info', Completed: 'success', Cancelled: 'danger' };
const LIMIT = 10;

const CITY_COORDS = {
  delhi: [28.6139, 77.2090],
  jaipur: [26.9124, 75.7873],
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867]
};

export default function Trips() {
  const { showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search/Filters/Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [trackingTarget, setTrackingTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // GPS logs polling state
  const [gpsLogs, setGpsLogs] = useState([]);

  // Form states (Create Trip)
  const [formValues, setFormValues] = useState({
    vehicle_id: '',
    driver_id: '',
    route: '',
    cargo_weight: '',
    start_odometer: '',
  });

  // Complete Trip Form state
  const [endOdometer, setEndOdometer] = useState('');

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await tripApi.list({
        search,
        status,
        page,
        limit: LIMIT,
      });
      const data = response?.data;
      if (data) {
        setTrips(data.trips || []);
        setTotalPages(Math.ceil((data.count || LIMIT) / LIMIT) || 1);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not load trips. Is backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  const loadDropdowns = useCallback(async () => {
    try {
      const [vehRes, drvRes] = await Promise.all([
        vehicleApi.getAll({ limit: 100, status: 'Available' }),
        driverApi.list({ limit: 100, status: 'Available' }),
      ]);
      setVehicles(vehRes?.data?.vehicles || []);
      setDrivers(drvRes?.data?.drivers || []);
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (createOpen) {
      loadDropdowns();
    }
  }, [createOpen, loadDropdowns]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  // GPS Telemetry Polling Hook
  useEffect(() => {
    if (!trackingTarget) {
      setGpsLogs([]);
      return;
    }

    const fetchGps = async () => {
      try {
        const response = await tripApi.getGpsLogs(trackingTarget.id);
        setGpsLogs(response?.data?.logs || []);

        // Query fresh trip details to check if worker has auto-completed it
        const checkRes = await tripApi.getById(trackingTarget.id);
        if (checkRes?.data?.trip?.status !== 'Dispatched') {
          showToast(`Trip ${trackingTarget.code} arrived at destination and auto-completed!`, 'success');
          setTrackingTarget(null);
          loadTrips();
        }
      } catch (err) {
        console.error('GPS tracking logs polling failed', err);
      }
    };

    fetchGps(); // execute immediately
    const timer = setInterval(fetchGps, 3000); // poll every 3 seconds

    return () => clearInterval(timer);
  }, [trackingTarget, showToast, loadTrips]);

  const handleCreateOpen = () => {
    setFormValues({
      vehicle_id: '',
      driver_id: '',
      route: '',
      cargo_weight: '',
      start_odometer: '',
    });
    setCreateOpen(true);
  };

  const handleFormChange = (key, val) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    if (key === 'vehicle_id') {
      const selectedVeh = vehicles.find((v) => v.id === val);
      if (selectedVeh) {
        setFormValues((prev) => ({ ...prev, start_odometer: selectedVeh.odometer }));
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.vehicle_id || !formValues.driver_id || !formValues.route || !formValues.cargo_weight || !formValues.start_odometer) {
      showToast('All fields are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await tripApi.create({
        ...formValues,
        cargo_weight: Number(formValues.cargo_weight),
        start_odometer: Number(formValues.start_odometer),
      });
      showToast('Trip created and dispatched successfully.', 'success');
      setCreateOpen(false);
      loadTrips();
    } catch (err) {
      const message = err?.response?.data?.errors?.[0]?.msg
        || err?.response?.data?.message
        || 'Failed to create trip';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!endOdometer || Number(endOdometer) <= Number(completeTarget.start_odometer)) {
      showToast(`Odometer must exceed start reading (${completeTarget.start_odometer} km)`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await tripApi.complete(completeTarget.id, {
        odometer_end: Number(endOdometer),
      });
      showToast('Trip marked as Completed.', 'success');
      setCompleteTarget(null);
      setEndOdometer('');
      loadTrips();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to complete trip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    setSubmitting(true);
    try {
      await tripApi.cancel(cancelTarget.id);
      showToast('Trip cancelled successfully.', 'success');
      setCancelTarget(null);
      loadTrips();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to cancel trip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getInterpolatedSvgPathCoords = () => {
    if (!trackingTarget || gpsLogs.length === 0) return { x: 50, y: 100, pct: 0, lat: 0, lng: 0 };
    const log = gpsLogs[gpsLogs.length - 1];

    const startCity = trackingTarget.route.split(/➔|→/)[0]?.trim().toLowerCase();
    const endCity = trackingTarget.route.split(/➔|→/)[1]?.trim().toLowerCase();

    const startCoords = CITY_COORDS[startCity] || [28.6139, 77.2090];
    const endCoords = CITY_COORDS[endCity] || [26.9124, 75.7873];

    const totalDist = Math.hypot(endCoords[0] - startCoords[0], endCoords[1] - startCoords[1]);
    const curDist = Math.hypot(Number(log.latitude) - startCoords[0], Number(log.longitude) - startCoords[1]);
    const t = totalDist > 0 ? Math.min(1.0, curDist / totalDist) : 0;

    // Bezier Quadratic formula: P0=[50,100], P1=[200,50], P2=[350,100]
    const x = Math.pow(1 - t, 2) * 50 + 2 * (1 - t) * t * 200 + Math.pow(t, 2) * 350;
    const y = Math.pow(1 - t, 2) * 100 + 2 * (1 - t) * t * 50 + Math.pow(t, 2) * 100;

    return {
      x,
      y,
      pct: Math.round(t * 100),
      lat: Number(log.latitude).toFixed(5),
      lng: Number(log.longitude).toFixed(5)
    };
  };

  const currentPosition = getInterpolatedSvgPathCoords();

  const columns = [
    {
      key: 'code',
      header: 'Trip ID',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.code}</span>,
    },
    {
      key: 'route',
      header: 'Route',
      render: (r) => (
        <span className="flex items-center gap-1.5 font-medium">
          {r.route.split(' ➔ ')[0] || r.route.split(' → ')[0]}
          <FiArrowRight size={12} className="text-ink-400" />
          {r.route.split(' ➔ ')[1] || r.route.split(' → ')[1]}
        </span>
      ),
    },
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
      key: 'driver',
      header: 'Driver',
      render: (r) => <span className="font-semibold text-ink-900 dark:text-paper-50">{r.driver_name || 'N/A'}</span>,
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
        if (r.status === 'Draft') {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await tripApi.dispatch(r.id);
                    showToast(`Trip ${r.code} dispatched successfully.`, 'success');
                    loadTrips();
                  } catch (err) {
                    showToast(err?.response?.data?.message || 'Failed to dispatch trip', 'error');
                  }
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-transit/10 text-transit hover:bg-transit hover:text-white transition-all duration-150"
                aria-label="Dispatch trip"
              >
                <FiSend size={13} /> Dispatch
              </button>
            </div>
          );
        }
        if (r.status !== 'Dispatched') return null;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrackingTarget(r)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-transit/10 text-transit hover:bg-transit hover:text-white transition-all duration-150"
              aria-label="Track trip"
            >
              <FiMapPin size={13} /> Track
            </button>
            <button
              onClick={() => {
                setCompleteTarget(r);
                setEndOdometer('');
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-success/10 text-success hover:bg-success hover:text-white transition-all duration-150"
              aria-label="Complete trip"
            >
              <FiCheckSquare size={13} /> Complete
            </button>
            <button
              onClick={() => setCancelTarget(r)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-150"
              aria-label="Cancel trip"
            >
              <FiXCircle size={13} /> Cancel
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="DISPATCH BOARD"
        title="Trips"
        description="Dispatch, track, and complete vehicle routing."
        action={<Button onClick={handleCreateOpen}><FiPlus size={16} /> Create trip</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by route start/end…" />
          <FilterBar
            values={{ status }}
            onChange={(_key, value) => setStatus(value)}
            filters={[
              {
                key: 'status',
                label: 'All statuses',
                options: ['Dispatched', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: s })),
              },
            ]}
          />
        </div>

        {loading ? (
          <Loader label="Loading dispatch records" />
        ) : errorMsg ? (
          <div className="p-8 text-center text-sm text-danger">{errorMsg}</div>
        ) : (
          <>
            <Table columns={columns} data={trips} emptyLabel="No trips found matching your query" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Create / Dispatch Trip Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Dispatch New Trip"
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
              <option value="">Select an available vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_name} ({v.registration_number}) · Cap: {v.max_load_capacity} kg · Odo: {v.odometer} km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Driver</label>
            <select
              value={formValues.driver_id}
              onChange={(e) => handleFormChange('driver_id', e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              <option value="">Select an available driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · Lic: {d.license_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Route (Start ➔ Destination)</label>
            <select
              value={formValues.route}
              onChange={(e) => handleFormChange('route', e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              <option value="">Select a predefined route...</option>
              <option value="Delhi ➔ Jaipur">Delhi ➔ Jaipur (~270 km)</option>
              <option value="Mumbai ➔ Pune">Mumbai ➔ Pune (~150 km)</option>
              <option value="Bangalore ➔ Chennai">Bangalore ➔ Chennai (~350 km)</option>
              <option value="Kolkata ➔ Hyderabad">Kolkata ➔ Hyderabad (~1200 km)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Cargo Weight (kg)</label>
              <input
                type="number"
                value={formValues.cargo_weight}
                onChange={(e) => handleFormChange('cargo_weight', e.target.value)}
                required
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Start Odometer (km)</label>
              <input
                type="number"
                value={formValues.start_odometer}
                onChange={(e) => handleFormChange('start_odometer', e.target.value)}
                required
                className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Dispatching…' : 'Dispatch Trip'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="Complete Dispatch order"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <p className="text-sm text-ink-600 dark:text-paper-200">
            Trip <strong className="font-mono">{completeTarget?.code}</strong> is being marked as Completed. record the ending odometer reading.
          </p>
          <div className="border border-ink-100 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 p-3 rounded-lg text-xs space-y-1">
            <div><strong>Route</strong>: {completeTarget?.route}</div>
            <div><strong>Start Odometer</strong>: {completeTarget?.start_odometer} km</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">End Odometer Reading (km)</label>
            <input
              type="number"
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
              required
              placeholder={`Must be > ${completeTarget?.start_odometer}`}
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCompleteTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Complete Trip'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live GPS Tracking Modal */}
      <Modal
        open={!!trackingTarget}
        onClose={() => setTrackingTarget(null)}
        title="GPS Telemetry Tracking"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-400">ACTIVE TRIP</p>
              <h4 className="font-display font-bold text-lg dark:text-paper-50">{trackingTarget?.route}</h4>
            </div>
            <Badge tone="info">Live Tracking</Badge>
          </div>

          {/* Interactive animated SVG path */}
          <div className="relative">
            <svg viewBox="0 0 400 200" className="w-full h-48 bg-ink-950 rounded-lg border border-ink-800 shadow-plate">
              {/* Route line shadow */}
              <path d="M 50 100 Q 200 50 350 100" fill="none" stroke="#1c1c1e" strokeWidth="6" strokeLinecap="round" />
              {/* Completed route line */}
              <path d="M 50 100 Q 200 50 350 100" fill="none" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
              
              {/* Animated dashed green line */}
              <path d="M 50 100 Q 200 50 350 100" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" className="animate-[dash_10s_linear_infinite]" />
              
              {/* Starting point marker */}
              <circle cx="50" cy="100" r="5" fill="#262626" stroke="#10b981" strokeWidth="2" />
              <text x="50" y="125" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="600">
                {trackingTarget?.route.split(/➔|→/)[0]?.trim()}
              </text>
              
              {/* Target endpoint marker */}
              <circle cx="350" cy="100" r="5" fill="#262626" stroke="#10b981" strokeWidth="2" />
              <text x="350" y="125" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="600">
                {trackingTarget?.route.split(/➔|→/)[1]?.trim()}
              </text>

              {/* Interpolated position vehicle marker */}
              {gpsLogs.length > 0 && (
                <g>
                  <circle cx={currentPosition.x} cy={currentPosition.y} r="10" fill="#10b981" className="animate-ping opacity-25" />
                  <circle cx={currentPosition.x} cy={currentPosition.y} r="6" fill="#10b981" />
                  <path d={`M ${currentPosition.x - 3} ${currentPosition.y - 12} L ${currentPosition.x + 3} ${currentPosition.y - 12} L ${currentPosition.x} ${currentPosition.y - 4} Z`} fill="#10b981" />
                </g>
              )}
            </svg>
          </div>

          {/* Telemetry info cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-ink-850 border border-ink-800 p-2.5 shadow-plate">
              <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Position</span>
              <p className="font-mono text-xs font-bold text-ink-900 dark:text-paper-100 mt-0.5">
                {gpsLogs.length > 0 ? `${currentPosition.lat}, ${currentPosition.lng}` : 'Waiting...'}
              </p>
            </div>
            <div className="rounded-lg bg-ink-850 border border-ink-800 p-2.5 shadow-plate">
              <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Progress</span>
              <p className="font-mono text-xs font-bold text-ink-900 dark:text-paper-100 mt-0.5">
                {currentPosition.pct}%
              </p>
            </div>
            <div className="rounded-lg bg-ink-850 border border-ink-800 p-2.5 shadow-plate">
              <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Speed</span>
              <p className="font-mono text-xs font-bold text-ink-900 dark:text-paper-100 mt-0.5 flex items-center gap-1">
                <FiCompass className="text-transit" /> 62 km/h
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTrackingTarget(null)}>Close Tracker</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Trip Dialog */}
      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel Dispatch Order?"
        message={`Are you sure you want to cancel trip ${cancelTarget?.code}? The assigned vehicle (${cancelTarget?.registration_number}) and driver will be restored to Available status.`}
        onConfirm={handleCancelSubmit}
        onCancel={() => setCancelTarget(null)}
        danger
      />
    </div>
  );
}
