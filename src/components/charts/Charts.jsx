import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line,
  CartesianGrid, Legend
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card-alt)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: 13,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      {label && <div style={{ color: 'var(--text-2)', marginBottom: 6, fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-1)', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
          {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value?.toLocaleString('en-IN')}`}
        </div>
      ))}
    </div>
  );
};

// ─── Revenue Area Chart ───────────────────────────────────────────────────────
export function RevenueAreaChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="attributedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: 'var(--text-3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : `₹${(v/1000).toFixed(0)}K`}
        />
        <Tooltip content={<DarkTooltip formatter={(v, n) => [
          `₹${v?.toLocaleString('en-IN')}`,
          n === 'revenue' ? 'Total Revenue' : 'Attributed'
        ]} />} />
        <Area type="monotone" dataKey="revenue" stroke="#FF4D00" strokeWidth={2} fill="url(#revenueGrad)" name="revenue" />
        <Area type="monotone" dataKey="attributed" stroke="#3B82F6" strokeWidth={1.5} fill="url(#attributedGrad)" strokeDasharray="4 2" name="attributed" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Channel Donut ────────────────────────────────────────────────────────────
const CHANNEL_PIE_COLORS = {
  whatsapp: '#22C55E',
  email:    '#3B82F6',
  sms:      '#F59E0B',
  rcs:      '#A855F7',
};

export function ChannelDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="_id"
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={65}
            strokeWidth={0}
            paddingAngle={3}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={CHANNEL_PIE_COLORS[d._id] || '#444'} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip formatter={(v, n) => [`${v} customers`, n]} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHANNEL_PIE_COLORS[d._id] || '#444', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize' }}>{d._id}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
              {total > 0 ? `${((d.count / total) * 100).toFixed(0)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Engagement Funnel ────────────────────────────────────────────────────────
export function EngagementFunnel({ data }) {
  if (!data) return null;
  const { totalMessages = 0, delivered = 0, opened = 0, read = 0, clicked = 0 } = data;
  const stages = [
    { label: 'Sent',      value: totalMessages, color: 'var(--text-3)', max: totalMessages },
    { label: 'Delivered', value: delivered,      color: '#3B82F6',      max: totalMessages },
    { label: 'Opened',    value: opened,         color: '#F59E0B',      max: totalMessages },
    { label: 'Read',      value: read,           color: 'var(--orange)', max: totalMessages },
    { label: 'Clicked',   value: clicked,        color: 'var(--orange)', max: totalMessages },
  ];

  return (
    <div className="funnel-bar-wrap">
      {stages.map(({ label, value, color, max }) => (
        <div className="funnel-bar-row" key={label}>
          <span className="funnel-bar-label">{label}</span>
          <div className="funnel-bar-track">
            <div
              className="funnel-bar-fill"
              style={{
                width: max > 0 ? `${(value / max) * 100}%` : '0%',
                background: color,
              }}
            />
          </div>
          <span className="funnel-bar-value">{value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Campaign Bar Chart (Leaderboard) ────────────────────────────────────────
export function CampaignBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
        <Tooltip content={<DarkTooltip formatter={(v) => [`${v}%`, 'Open Rate']} />} />
        <Bar dataKey="openRate" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#FF4D00' : i === 1 ? '#FF7033' : 'var(--border-strong)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Spend Histogram ──────────────────────────────────────────────────────────
export function SpendHistogram({ data = [] }) {
  const formatted = data.map(d => ({
    label: d._id === '50000+' ? '₹50K+' :
           d._id === 0 ? '₹0' :
           d._id >= 1000 ? `₹${d._id/1000}K` : `₹${d._id}`,
    count: d.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<DarkTooltip formatter={(v) => [`${v} customers`, 'Count']} />} />
        <Bar dataKey="count" fill="#FF4D00" radius={[3,3,0,0]} fillOpacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}
