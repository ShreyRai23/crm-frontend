import { STATUS_MAP, CHANNEL_LABELS } from '../../utils/formatters';

export function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'badge-draft' };
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" style={{
        background: cls.includes('completed') ? 'var(--success)' :
                    cls.includes('running')   ? 'var(--blue)'    :
                    cls.includes('scheduled') ? 'var(--warning)' :
                    cls.includes('failed')    ? 'var(--danger)'  : 'var(--text-3)',
      }} />
      {label}
    </span>
  );
}

export function ChannelBadge({ channel }) {
  return (
    <span className={`badge badge-${channel}`}>
      {CHANNEL_LABELS[channel] || channel}
    </span>
  );
}

export function TagBadge({ tag }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11,
      fontWeight: 500,
      background: 'var(--bg-card-alt)',
      border: '1px solid var(--border)',
      color: 'var(--text-2)',
    }}>
      {tag}
    </span>
  );
}
