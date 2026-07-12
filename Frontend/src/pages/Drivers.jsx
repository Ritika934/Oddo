import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiSlash } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import DriverForm from '../components/driver/DriverForm';
import { driverApi } from '../api/driver.api';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { daysUntil, formatDate } from '../utils/formatDate';

const STATUS_TONE = { Available: 'success', 'On Trip': 'info', 'Off Duty': 'neutral', Suspended: 'danger' };
const LIMIT = 10;

export default function Drivers() {
  const { showToast } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspending, setSuspending] = useState(false);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await driverApi.list({
        search: debouncedSearch,
        status,
        page,
        limit: LIMIT,
      });
      setDrivers(data.drivers || []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not load drivers. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const openCreate = () => {
    setEditingDriver(null);
    setModalOpen(true);
  };

  const openEdit = (driver) => {
    setEditingDriver(driver);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingDriver) {
        await driverApi.update(editingDriver.id, values);
        showToast('Driver updated.', 'success');
      } else {
        await driverApi.create(values);
        showToast('Driver added.', 'success');
      }
      setModalOpen(false);
      loadDrivers();
    } catch (err) {
      const message = err?.response?.data?.errors?.[0]?.msg
        || err?.response?.data?.message
        || 'Something went wrong. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      await driverApi.suspend(suspendTarget.id);
      showToast(`${suspendTarget.name} suspended.`, 'success');
      setSuspendTarget(null);
      loadDrivers();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not suspend driver.', 'error');
    } finally {
      setSuspending(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Driver' },
    { key: 'phone', header: 'Phone' },
    { key: 'license_number', header: 'License No.', render: (r) => <span className="font-mono text-xs">{r.license_number}</span> },
    {
      key: 'license_expiry',
      header: 'License expiry',
      render: (r) => {
        const days = daysUntil(r.license_expiry);
        const soon = days !== null && days <= 30;
        return (
          <span className={soon ? 'font-medium text-danger' : ''}>
            {formatDate(r.license_expiry)} {soon && <span className="ml-1 font-mono text-[10px]">({days}d)</span>}
          </span>
        );
      },
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status || 'Unknown'}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 dark:hover:bg-ink-700 hover:text-transit transition-colors"
            aria-label="Edit driver"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => setSuspendTarget(r)}
            disabled={r.status === 'Suspended'}
            className="rounded-md p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-500"
            aria-label="Suspend driver"
          >
            <FiSlash size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="DRIVER ROSTER"
        title="Drivers"
        description="License status, safety scores, and current assignments."
        action={<Button onClick={openCreate}><FiPlus size={16} /> Add driver</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, or license…" />
          <FilterBar
            values={{ status }}
            onChange={(_key, value) => setStatus(value)}
            filters={[
              {
                key: 'status',
                label: 'All statuses',
                options: ['Available', 'On Trip', 'Off Duty', 'Suspended'].map((s) => ({ value: s, label: s })),
              },
            ]}
          />
        </div>

        {loading ? (
          <Loader label="Loading drivers" />
        ) : errorMsg ? (
          <div className="p-8 text-center text-sm text-danger">{errorMsg}</div>
        ) : (
          <>
            <Table columns={columns} data={drivers} emptyLabel="No drivers match your search" />
            <Pagination page={page} totalPages={drivers.length === LIMIT ? page + 1 : page} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDriver ? 'Edit driver' : 'Add driver'}
      >
        <DriverForm
          mode={editingDriver ? 'edit' : 'create'}
          defaultValues={editingDriver}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!suspendTarget}
        title="Suspend driver?"
        message={`${suspendTarget?.name} will be marked as Suspended and won't be assignable to new trips.`}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
        danger
      />
    </div>
  );
}