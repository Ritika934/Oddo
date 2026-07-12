import { FiDownload } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';

const REPORTS = {
  utilization: [
    { id: 1, vehicle: 'PB10 AB 4521', trips: 24, distance: '3,120 km', utilization: '82%' },
    { id: 2, vehicle: 'PB65 CT 9087', trips: 18, distance: '2,210 km', utilization: '64%' },
  ],
  roi: [
    { id: 1, vehicle: 'PB02 XY 5567', acquisitionCost: 1250000, revenue: 480000, roi: '38.4%' },
    { id: 2, vehicle: 'PB44 JK 3390', acquisitionCost: 640000, revenue: 96000, roi: '15.0%' },
  ],
};

export default function Reports() {
  const utilColumns = [
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'trips', header: 'Trips' },
    { key: 'distance', header: 'Distance' },
    { key: 'utilization', header: 'Utilization' },
  ];

  const roiColumns = [
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono text-xs">{r.vehicle}</span> },
    { key: 'acquisitionCost', header: 'Acquisition cost', render: (r) => formatCurrency(r.acquisitionCost) },
    { key: 'revenue', header: 'Revenue generated', render: (r) => formatCurrency(r.revenue) },
    { key: 'roi', header: 'ROI' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ANALYTICS"
        title="Reports"
        description="Fleet utilization, ROI, and cost analytics for the period."
        action={
          <div className="flex gap-2">
            <Button variant="secondary"><FiDownload size={16} /> Export CSV</Button>
            <Button variant="secondary"><FiDownload size={16} /> Export PDF</Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-ink-100 dark:border-ink-700 px-5 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Fleet utilization</h3>
        </div>
        <Table columns={utilColumns} data={REPORTS.utilization} />
      </Card>

      <Card>
        <div className="border-b border-ink-100 dark:border-ink-700 px-5 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-paper-50">Vehicle ROI</h3>
        </div>
        <Table columns={roiColumns} data={REPORTS.roi} />
      </Card>
    </div>
  );
}
