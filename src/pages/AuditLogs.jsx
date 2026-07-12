import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';

const LOGS = [
  { id: 1, user: 'Ritika', action: 'Created Vehicle PB10 AB 4521', time: '10:30 AM', date: 'Today' },
  { id: 2, user: 'Alex', action: 'Completed Trip TRP-1041', time: '12:20 PM', date: 'Today' },
  { id: 3, user: 'Harjit Singh', action: 'Closed Maintenance for PB44 JK 3390', time: '9:05 AM', date: 'Yesterday' },
  { id: 4, user: 'Ritika', action: 'Marked Vehicle PB44 JK 3390 as Retired', time: '4:40 PM', date: 'Yesterday' },
];

export default function AuditLogs() {
  return (
    <div>
      <PageHeader
        eyebrow="ACCOUNTABILITY"
        title="Audit logs"
        description="Every meaningful action, timestamped and attributed."
      />
      <Card className="p-5">
        <ol className="relative border-l border-ink-100 dark:border-ink-700 pl-6">
          {LOGS.map((log, i) => (
            <li key={log.id} className="mb-6 last:mb-0">
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-ink-800 bg-signal" />
              <p className="text-sm text-ink-900 dark:text-paper-50">
                <span className="font-semibold">{log.user}</span> {log.action}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-400">{log.date} · {log.time}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
