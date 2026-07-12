import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const CATEGORY_TONE = { Toll: 'info', Repair: 'warn', Parking: 'neutral', Miscellaneous: 'neutral' };

const MOCK_EXPENSES = [
  { id: 1, category: 'Toll', vehicle: 'PB10 AB 4521', amount: 620, date: '2026-07-11' },
  { id: 2, category: 'Repair', vehicle: 'PB08 GH 1123', amount: 4200, date: '2026-07-08' },
  { id: 3, category: 'Parking', vehicle: 'PB65 CT 9087', amount: 150, date: '2026-07-07' },
];

export default function Expenses() {
  const columns = [
    { key: 'category', header: 'Category', render: (r) => <Badge tone={CATEGORY_TONE[r.category]}>{r.category}</Badge> },
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="EXPENSE LOG"
        title="Expenses"
        description="Toll, repairs, parking, and miscellaneous fleet spend."
        action={<Button><FiPlus size={16} /> Add expense</Button>}
      />
      <Card>
        <Table columns={columns} data={MOCK_EXPENSES} />
      </Card>
    </div>
  );
}
