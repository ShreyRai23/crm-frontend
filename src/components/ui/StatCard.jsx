import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, sub, change, changeLabel, orange, icon: Icon, className = '' }) {
  const changeNum = parseFloat(change);
  const isUp = changeNum > 0;
  const isDown = changeNum < 0;

  return (
    <div className={`card card-hover animate-fade-up ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="card-label">
          {label}
        </div>
        {Icon && (
          <div style={{
            width: 32, height: 32,
            background: orange ? 'var(--orange-glow)' : 'var(--bg-card-alt)',
            border: `1px solid ${orange ? 'rgba(255,77,0,0.2)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={orange ? 'var(--orange)' : 'var(--text-2)'} />
          </div>
        )}
      </div>

      <div className={`stat-number${orange ? ' orange' : ''}`}>{value}</div>

      {sub && <div className="stat-label">{sub}</div>}

      {change !== undefined && (
        <div className={`stat-change ${isUp ? 'up' : isDown ? 'down' : ''}`} style={{ marginTop: 6 }}>
          {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
          {Math.abs(changeNum).toFixed(1)}% {changeLabel || 'vs last month'}
        </div>
      )}
    </div>
  );
}
