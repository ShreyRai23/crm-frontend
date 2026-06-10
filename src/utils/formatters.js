import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export const fmt = {
  currency: (v) => {
    const n = Number(v) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  },
  currencyFull: (v) => `₹${(Number(v) || 0).toLocaleString('en-IN')}`,
  number: (v) => (Number(v) || 0).toLocaleString('en-IN'),
  percent: (v, decimals = 1) => `${(Number(v) || 0).toFixed(decimals)}%`,
  date: (v) => {
    if (!v) return '—';
    try { return format(typeof v === 'string' ? parseISO(v) : new Date(v), 'dd MMM yyyy'); }
    catch { return '—'; }
  },
  dateTime: (v) => {
    if (!v) return '—';
    try { return format(typeof v === 'string' ? parseISO(v) : new Date(v), 'dd MMM yyyy, HH:mm'); }
    catch { return '—'; }
  },
  relative: (v) => {
    if (!v) return '—';
    try { return formatDistanceToNow(typeof v === 'string' ? parseISO(v) : new Date(v), { addSuffix: true }); }
    catch { return '—'; }
  },
};

export const CHANNEL_LABELS = {
  whatsapp: 'WhatsApp',
  email:    'Email',
  sms:      'SMS',
  rcs:      'RCS',
};

export const CHANNEL_COLORS = {
  whatsapp: '#22C55E',
  email:    '#3B82F6',
  sms:      '#F59E0B',
  rcs:      '#A855F7',
};

export const STATUS_MAP = {
  completed: { label: 'Completed', cls: 'badge-completed' },
  running:   { label: 'Running',   cls: 'badge-running'   },
  scheduled: { label: 'Scheduled', cls: 'badge-scheduled' },
  draft:     { label: 'Draft',     cls: 'badge-draft'     },
  failed:    { label: 'Failed',    cls: 'badge-failed'    },
};

export const pct = (num, den) => den > 0 ? ((num / den) * 100).toFixed(1) : '0.0';
