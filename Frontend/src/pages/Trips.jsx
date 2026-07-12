import { useState } from 'react';
import { FiPlus, FiArrowRight } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';

const STATUS_TONE = { Draft: 'neutral', Dispatched: 'info', Completed: 'success', Cancelled: 'danger' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const columns = [
    { key: 'code', header: 'Trip', render: (r) => <span className="font-mono">{r.code}</span> },
    {
      key: 'route',
      header: 'Route',
      render: (r) => (
        <span className="flex items-center gap-1.5">
          {r.route.split(' → ')[0]} <FiArrowRight size={12} className="text-ink-400" /> {r.route.split(' → ')[1]}
        </span>
      ),
    },
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'driver', header: 'Driver' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="DISPATCH BOARD"
        title="Trips"
        description="Draft, dispatch, and track every trip through completion."
        action={<Button><FiPlus size={16} /> Create trip</Button>}
      />
      <Card>
        <Table columns={columns} data={trips} />
      </Card>
    </div>
  );
}
