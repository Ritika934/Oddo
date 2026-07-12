import { FiPlus, FiArrowRight } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';

const MOCK_TRIPS = [
  { id: 1, code: 'TRP-1042', route: 'Ludhiana → Chandigarh', vehicle: 'PB10 AB 4521', driver: 'Ranveer Singh', status: 'Dispatched' },
  { id: 2, code: 'TRP-1041', route: 'Amritsar → Jalandhar', vehicle: 'PB65 CT 9087', driver: 'Amanpreet Kaur', status: 'Completed' },
  { id: 3, code: 'TRP-1040', route: 'Patiala → Ferozepur', vehicle: 'PB02 XY 5567', driver: 'Harjit Singh', status: 'Draft' },
  { id: 4, code: 'TRP-1039', route: 'Bathinda → Moga', vehicle: 'PB44 JK 3390', driver: 'Manpreet Sidhu', status: 'Cancelled' },
];

const STATUS_TONE = { Draft: 'neutral', Dispatched: 'info', Completed: 'success', Cancelled: 'danger' };

export default function Trips() {
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
        <Table columns={columns} data={MOCK_TRIPS} />
      </Card>
    </div>
  );
}
