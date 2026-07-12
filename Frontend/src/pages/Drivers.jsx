import { useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import { daysUntil, formatDate } from '../utils/formatDate';

const MOCK_DRIVERS = [
  { id: 1, name: 'Ranveer Singh', phone: '98140 22110', license: 'PB-0420190001234', expiry: '2026-08-02', score: 92, status: 'Available' },
  { id: 2, name: 'Amanpreet Kaur', phone: '98720 11245', license: 'PB-0620210004512', expiry: '2027-01-15', score: 88, status: 'On Trip' },
  { id: 3, name: 'Harjit Singh', phone: '99150 33221', license: 'PB-0320180007781', expiry: '2026-07-20', score: 76, status: 'Off Duty' },
  { id: 4, name: 'Manpreet Sidhu', phone: '90410 88712', license: 'PB-0920220002290', expiry: '2028-03-11', score: 95, status: 'Suspended' },
];

const STATUS_TONE = { Available: 'success', 'On Trip': 'info', 'Off Duty': 'neutral', Suspended: 'danger' };

export default function Drivers() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => MOCK_DRIVERS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const columns = [
    { key: 'name', header: 'Driver' },
    { key: 'phone', header: 'Phone' },
    { key: 'license', header: 'License No.', render: (r) => <span className="font-mono text-xs">{r.license}</span> },
    {
      key: 'expiry',
      header: 'License expiry',
      render: (r) => {
        const days = daysUntil(r.expiry);
        const soon = days !== null && days <= 30;
        return (
          <span className={soon ? 'font-medium text-danger' : ''}>
            {formatDate(r.expiry)} {soon && <span className="ml-1 font-mono text-[10px]">({days}d)</span>}
          </span>
        );
      },
    },
    { key: 'score', header: 'Safety score', render: (r) => <span className="font-mono">{r.score}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="DRIVER ROSTER"
        title="Drivers"
        description="License status, safety scores, and current assignments."
        action={<Button><FiPlus size={16} /> Add driver</Button>}
      />
      <Card>
        <div className="border-b border-ink-100 dark:border-ink-700 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search drivers…" />
        </div>
        <Table columns={columns} data={filtered} emptyLabel="No drivers match your search" />
      </Card>
    </div>
  );
}
