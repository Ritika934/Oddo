import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const MOCK_MAINTENANCE = [
  { id: 1, vehicle: 'PB08 GH 1123', issue: 'Brake pad replacement', cost: 4200, start: '2026-07-08', end: null, status: 'Open' },
  { id: 2, vehicle: 'PB44 JK 3390', issue: 'Engine overhaul', cost: 18500, start: '2026-06-20', end: '2026-07-01', status: 'Closed' },
];

export default function Maintenance() {
  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'issue', header: 'Issue' },
    { key: 'cost', header: 'Cost', render: (r) => formatCurrency(r.cost) },
    { key: 'start', header: 'Start', render: (r) => formatDate(r.start) },
    { key: 'end', header: 'End', render: (r) => formatDate(r.end) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={r.status === 'Open' ? 'warn' : 'success'}>{r.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="SERVICE BAY"
        title="Maintenance"
        description="Open work orders and full service history per vehicle."
        action={<Button><FiPlus size={16} /> Log maintenance</Button>}
      />
      <Card>
        <Table columns={columns} data={MOCK_MAINTENANCE} />
      </Card>
    </div>
  );
}
