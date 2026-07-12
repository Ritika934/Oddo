import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Button from '../common/Button';

export default function VehicleForm({ initialData, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        registration_number: initialData.registration_number || '',
        vehicle_name: initialData.vehicle_name || '',
        model: initialData.model || '',
        vehicle_type: initialData.vehicle_type || 'Truck',
        max_load_capacity: initialData.max_load_capacity || '',
        odometer: initialData.odometer || 0,
        acquisition_cost: initialData.acquisition_cost || '',
        status: initialData.status || 'available',
      });
    } else {
      reset({
        registration_number: '',
        vehicle_name: '',
        model: '',
        vehicle_type: 'Truck',
        max_load_capacity: '',
        odometer: 0,
        acquisition_cost: '',
        status: 'available',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Registration Number
          </label>
          <input
            type="text"
            {...register('registration_number', { required: 'Registration is required' })}
            placeholder="e.g. PB10 AB 4521"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.registration_number && (
            <p className="mt-1 text-xs text-danger">{errors.registration_number.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Vehicle Name
          </label>
          <input
            type="text"
            {...register('vehicle_name', { required: 'Vehicle name is required' })}
            placeholder="e.g. Ashok Leyland Dost"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.vehicle_name && (
            <p className="mt-1 text-xs text-danger">{errors.vehicle_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Model
          </label>
          <input
            type="text"
            {...register('model')}
            placeholder="e.g. 2024 Plus"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Vehicle Type
          </label>
          <select
            {...register('vehicle_type', { required: 'Vehicle type is required' })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          >
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Capacity (kg)
          </label>
          <input
            type="number"
            step="any"
            {...register('max_load_capacity', {
              required: 'Capacity is required',
              min: { value: 0.1, message: 'Must be > 0' },
              valueAsNumber: true,
            })}
            placeholder="1500"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.max_load_capacity && (
            <p className="mt-1 text-xs text-danger">{errors.max_load_capacity.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Odometer (km)
          </label>
          <input
            type="number"
            {...register('odometer', {
              min: { value: 0, message: 'Cannot be negative' },
              valueAsNumber: true,
            })}
            placeholder="0"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.odometer && (
            <p className="mt-1 text-xs text-danger">{errors.odometer.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Acquisition Cost (₹)
          </label>
          <input
            type="number"
            step="any"
            {...register('acquisition_cost', {
              required: 'Cost is required',
              min: { value: 0, message: 'Cannot be negative' },
              valueAsNumber: true,
            })}
            placeholder="750000"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.acquisition_cost && (
            <p className="mt-1 text-xs text-danger">{errors.acquisition_cost.message}</p>
          )}
        </div>
      </div>

      {initialData && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          >
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" tone="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Vehicle'}
        </Button>
      </div>
    </form>
  );
}
