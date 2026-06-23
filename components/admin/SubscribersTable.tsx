import { formatSubscriberDate, type Subscriber } from '@/lib/admin/subscribers';

// Server component — pure display (no interactivity), so it renders to static
// HTML with no hydration. Email + RO date + source, plus a "Dezabonat" badge
// when unsubscribed_at is set (D5). MVP: no search/filter/pagination.

export default function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  if (subscribers.length === 0) {
    return (
      <p className="font-lora" style={{ color: 'var(--ink-soft)', padding: '32px 0' }}>
        Niciun abonat încă. Cei care se înscriu pe site apar aici.
      </p>
    );
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0 12px 10px',
    borderBottom: '1px solid rgba(92,58,32,0.2)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '13px 12px',
    borderBottom: '1px solid rgba(92,58,32,0.12)',
    verticalAlign: 'middle',
  };

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr>
            {['Email', 'Data înscrierii', 'Sursă'].map((h) => (
              <th key={h} className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id}>
              <td style={tdStyle}>
                <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                  {s.email}
                </span>
                {s.unsubscribed_at ? (
                  <span
                    className="label-caps"
                    style={{
                      marginLeft: 10,
                      backgroundColor: 'rgba(159,45,32,0.1)',
                      color: '#9F2D20',
                      borderRadius: 999,
                      padding: '2px 9px',
                      fontSize: '0.55rem',
                    }}
                  >
                    Dezabonat
                  </span>
                ) : null}
              </td>
              <td style={tdStyle}>
                <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                  {formatSubscriberDate(s.created_at) || '—'}
                </span>
              </td>
              <td style={tdStyle}>
                <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                  {s.source}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
