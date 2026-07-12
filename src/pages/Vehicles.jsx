import { useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';

const MOCK_VEHICLES = [
  { id: 1, reg: 'PB10 AB 4521', name: 'Ashok Leyland Dost', type: 'Truck', capacity: '1500 kg', status: 'Available' },
  { id: 2, reg: 'PB65 CT 9087', name: 'Tata Ace Gold', type: 'Van', capacity: '750 kg', status: 'On Trip' },
  { id: 3, reg: 'PB08 GH 1123', name: 'Mahindra Bolero Pickup', type: 'Pickup', capacity: '1000 kg', status: 'In Shop' },
  { id: 4, reg: 'PB02 XY 5567', name: 'Eicher Pro 2049', type: 'Truck', capacity: '4900 kg', status: 'Available' },
  { id: 5, reg: 'PB44 JK 3390', name: 'Force Traveller', type: 'Van', capacity: '1200 kg', status: 'Retired' },
];

const STATUS_TONE = { Available: 'success', 'On Trip': 'info', 'In Shop': 'warn', Retired: 'neutral' };

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_VEHICLES.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.reg.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !filters.status || v.status === filters.status;
      const matchesType = !filters.type || v.type === filters.type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, filters]);

  const columns = [
    { key: 'reg', header: 'Registration', render: (r) => <span className="font-mono">{r.reg}</span> },
    { key: 'name', header: 'Vehicle' },
    { key: 'type', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="FLEET REGISTRY"
        title="Vehicles"
        description="Every unit in the fleet, its capacity, and current status."
        action={<Button><FiPlus size={16} /> Add vehicle</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-700 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or registration…" />
          <FilterBar
            values={filters}
            onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
            filters={[
              { key: 'status', label: 'All statuses', options: ['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => ({ value: s, label: s })) },
              { key: 'type', label: 'All types', options: ['Truck', 'Van', 'Pickup'].map((t) => ({ value: t, label: t })) },
            ]}
          />
        </div>
        <Table columns={columns} data={filtered} emptyLabel="No vehicles match your search" />
        <Pagination page={page} totalPages={1} onChange={setPage} />
      </Card>
    </div>
  );
}
