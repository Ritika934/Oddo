import { useForm } from 'react-hook-form';
import Button from '../common/Button';

const STATUS_OPTIONS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

// Backend expects license_expiry as ISO8601 (YYYY-MM-DD works fine for <input type="date">).
function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export default function DriverForm({ mode = 'create', defaultValues, onSubmit, submitting, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: defaultValues?.name || '',
      phone: defaultValues?.phone || '',
      license_number: defaultValues?.license_number || '',
      license_expiry: toDateInputValue(defaultValues?.license_expiry),
      status: defaultValues?.status || 'Available',
    },
  });

  const submit = (values) => {
    // On create, the backend validator only expects these four fields;
    // on edit, status must be included or the repo query nulls it out.
    const payload = mode === 'edit'
      ? values
      : { name: values.name, phone: values.phone, license_number: values.license_number, license_expiry: values.license_expiry };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Driver name</label>
        <input
          {...register('name', {
            required: 'Driver name is required',
            minLength: { value: 2, message: 'Must be between 2 and 100 characters' },
            maxLength: { value: 100, message: 'Must be between 2 and 100 characters' },
          })}
          className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
        />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Phone</label>
        <input
          {...register('phone', {
            required: 'Phone number is required',
            pattern: { value: /^\+?[0-9\s\-()]{7,20}$/, message: 'Enter a valid phone number' },
          })}
          placeholder="+91 98140 22110"
          className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
        />
        {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">License number</label>
        <input
          {...register('license_number', {
            required: 'License number is required',
            pattern: { value: /^[A-Z0-9\-]+$/i, message: 'Alphanumeric only (dashes allowed)' },
          })}
          className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm font-mono text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
        />
        {errors.license_number && <p className="mt-1 text-xs text-danger">{errors.license_number.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">License expiry</label>
        <input
          type="date"
          {...register('license_expiry', { required: 'License expiry date is required' })}
          className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
        />
        {errors.license_expiry && <p className="mt-1 text-xs text-danger">{errors.license_expiry.message}</p>}
      </div>

      {mode === 'edit' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Status</label>
          <select
            {...register('status', { required: true })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add driver'}
        </Button>
      </div>
    </form>
  );
}