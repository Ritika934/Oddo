import Card from '../common/Card';

export default function KpiCard({ label, value, icon: Icon, tone = 'default', trend }) {
  const tones = {
    default: 'text-ink-900 dark:text-paper-50',
    signal: 'text-signal-dark dark:text-signal',
    transit: 'text-transit-dark dark:text-transit-light',
    success: 'text-success',
    danger: 'text-danger',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
          <p className={`mt-2 font-display text-2xl font-semibold ${tones[tone]}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-current/10 ${tones[tone]}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      {trend && (
        <p className={`mt-3 text-xs ${trend.startsWith('-') ? 'text-danger' : 'text-success'}`}>
          {trend} vs last week
        </p>
      )}
    </Card>
  );
}
