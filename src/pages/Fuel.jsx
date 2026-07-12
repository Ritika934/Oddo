import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const MOCK_FUEL = [
  { id: 1, vehicle: 'PB10 AB 4521', liters: 42, cost: 4830, date: '2026-07-10', odometer: 58210, efficiency: '11.2 km/l' },
  { id: 2, vehicle: 'PB65 CT 9087', liters: 28, cost: 3220, date: '2026-07-09', odometer: 31450, efficiency: '13.6 km/l' },
];

export default function Fuel() {
  const totalLiters = MOCK_FUEL.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = MOCK_FUEL.reduce((sum, f) => sum + f.cost, 0);

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'liters', header: 'Fuel (L)' },
    { key: 'cost', header: 'Cost', render: (r) => formatCurrency(r.cost) },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'odometer', header: 'Odometer', render: (r) => <span className="font-mono">{r.odometer.toLocaleString('en-IN')} km</span> },
    { key: 'efficiency', header: 'Efficiency' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="FUEL LEDGER"
        title="Fuel logs"
        description={`Total this period: ${totalLiters} L · ${formatCurrency(totalCost)}`}
        action={<Button><FiPlus size={16} /> Add fuel log</Button>}
      />
      <Card>
        <Table columns={columns} data={MOCK_FUEL} />
      </Card>
    </div>
  );
}
