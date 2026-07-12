import { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
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
import { expenseApi } from '../api/expense.api';
import { vehicleApi } from '../api/vehicle.api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const CATEGORY_TONE = { Toll: 'info', Repair: 'warn', Parking: 'neutral', Miscellaneous: 'neutral' };
const LIMIT = 10;

export default function Expenses() {
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering states
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete states
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const [formValues, setFormValues] = useState({
    vehicle_id: '',
    category: 'Toll',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await expenseApi.list({
        vehicle_id: selectedVehicleId,
        category: selectedCategory,
        page,
        limit: LIMIT,
      });
      const data = response?.data;
      if (data) {
        setExpenses(data.expenses || []);
        // simple estimated pagination
        setTotalPages(Math.ceil((data.count || LIMIT) / LIMIT) || 1);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not load expenses. Is backend running?');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, selectedCategory, page]);

  const loadVehicles = useCallback(async () => {
    try {
      const response = await vehicleApi.getAll({ limit: 100 });
      setVehicles(response?.data?.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles dropdown list', err);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    setPage(1);
  }, [selectedVehicleId, selectedCategory]);

  const openCreate = () => {
    setEditingExpense(null);
    setFormValues({
      vehicle_id: vehicles[0]?.id || '',
      category: 'Toll',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setFormValues({
      vehicle_id: expense.vehicle_id,
      category: expense.category,
      amount: expense.amount,
      expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
      description: expense.description || '',
    });
    setModalOpen(true);
  };

  const handleFormChange = (key, val) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.vehicle_id) {
      showToast('Please select a vehicle', 'error');
      return;
    }
    if (!formValues.amount || Number(formValues.amount) <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        amount: Number(formValues.amount),
      };

      if (editingExpense) {
        await expenseApi.update(editingExpense.id, payload);
        showToast('Expense record updated.', 'success');
      } else {
        await expenseApi.create(payload);
        showToast('Expense record added.', 'success');
      }
      setModalOpen(false);
      loadExpenses();
    } catch (err) {
      const message = err?.response?.data?.errors?.[0]?.msg
        || err?.response?.data?.message
        || 'Failed to save expense';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await expenseApi.delete(deleteTarget.id);
      showToast('Expense record deleted.', 'success');
      setDeleteTarget(null);
      loadExpenses();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not delete expense.', 'error');
    }
  };

  const columns = [
    {
      key: 'category',
      header: 'Category',
      render: (r) => <Badge tone={CATEGORY_TONE[r.category] || 'neutral'}>{r.category}</Badge>,
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900 dark:text-paper-50">{r.vehicle_name || 'N/A'}</span>
          <span className="font-mono text-xs text-ink-500">{r.vehicle_reg || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'expense_date',
      header: 'Date',
      render: (r) => formatDate(r.expense_date),
    },
    {
      key: 'description',
      header: 'Description',
      render: (r) => <span className="text-xs text-ink-500 max-w-[200px] truncate block">{r.description || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 dark:hover:bg-ink-700 hover:text-transit transition-colors"
            aria-label="Edit expense"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger transition-colors"
            aria-label="Delete expense"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="EXPENSE LOG"
        title="Expenses"
        description="Toll, repairs, parking, and miscellaneous fleet operational spend."
        action={<Button onClick={openCreate}><FiPlus size={16} /> Add expense</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <div className="flex flex-wrap items-center gap-2">
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

            <FilterBar
              values={{ category: selectedCategory }}
              onChange={(_key, value) => setSelectedCategory(value)}
              filters={[
                {
                  key: 'category',
                  label: 'All Categories',
                  options: ['Toll', 'Repair', 'Parking', 'Miscellaneous'].map((c) => ({ value: c, label: c })),
                },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <Loader label="Loading expenses" />
        ) : errorMsg ? (
          <div className="p-8 text-center text-sm text-danger">{errorMsg}</div>
        ) : (
          <>
            <Table columns={columns} data={expenses} emptyLabel="No expense records match your filters" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit expense' : 'Add expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {v.vehicle_name} ({v.registration_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Category</label>
            <select
              value={formValues.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              {['Toll', 'Repair', 'Parking', 'Miscellaneous'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formValues.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              required
              placeholder="e.g. 500"
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Expense Date</label>
            <input
              type="date"
              value={formValues.expense_date}
              onChange={(e) => handleFormChange('expense_date', e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Description</label>
            <textarea
              value={formValues.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Toll booth details, service type, repair comments..."
              rows={3}
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingExpense ? 'Save changes' : 'Add expense'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete expense record?"
        message={`Are you sure you want to permanently delete this expense of ${formatCurrency(deleteTarget?.amount)} for ${deleteTarget?.vehicle_name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
