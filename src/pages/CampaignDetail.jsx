import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Copy, Calendar, X, Users } from 'lucide-react';
import { getCampaign, getCampaignCommunications, sendCampaign, cloneCampaign, scheduleCampaign, unscheduleCampaign } from '../api';
import { StatusBadge, ChannelBadge } from '../components/ui/Badge';
import { EngagementFunnel } from '../components/charts/Charts';
import { fmt, pct } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const { data: campRes, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id),
    refetchInterval: (data) => data?.data?.status === 'running' ? 5000 : false,
  });

  const { data: commsRes } = useQuery({
    queryKey: ['campaign-comms', id],
    queryFn: () => getCampaignCommunications(id, { limit: 20 }),
  });

  const sendMut = useMutation({
    mutationFn: () => sendCampaign(id),
    onSuccess: () => { qc.invalidateQueries(['campaign', id]); toast.success('Campaign dispatched!'); },
    onError: (err) => toast.error(err.message),
  });

  const cloneMut = useMutation({
    mutationFn: () => cloneCampaign(id),
    onSuccess: (res) => { qc.invalidateQueries(['campaigns']); toast.success('Campaign cloned!'); navigate(`/campaigns/${res.data._id}`); },
    onError: (err) => toast.error(err.message),
  });

  const scheduleMut = useMutation({
    mutationFn: () => scheduleCampaign(id, new Date(scheduleDate).toISOString()),
    onSuccess: (res) => { qc.invalidateQueries(['campaign', id]); toast.success(res.message); setShowSchedule(false); },
    onError: (err) => toast.error(err.message),
  });

  const unscheduleMut = useMutation({
    mutationFn: () => unscheduleCampaign(id),
    onSuccess: () => { qc.invalidateQueries(['campaign', id]); toast.success('Schedule cancelled'); },
    onError: (err) => toast.error(err.message),
  });

  const c = campRes?.data;
  const comms = commsRes?.data || [];

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner spinner-lg" /></div>
  );
  if (!c) return null;

  const funnelData = {
    totalMessages: c.stats?.sent || 0,
    delivered: c.stats?.delivered || 0,
    opened: c.stats?.opened || 0,
    read: c.stats?.read || 0,
    clicked: c.stats?.clicked || 0,
  };

  const metrics = [
    { label: 'Sent',        value: fmt.number(c.stats?.sent),      sub: 'total queued' },
    { label: 'Delivered',   value: fmt.number(c.stats?.delivered),  sub: `${pct(c.stats?.delivered, c.stats?.sent)}% rate` },
    { label: 'Failed',      value: fmt.number(c.stats?.failed),     sub: `${pct(c.stats?.failed, c.stats?.sent)}% rate` },
    { label: 'Opened',      value: fmt.number(c.stats?.opened),     sub: `${pct(c.stats?.opened, c.stats?.delivered)}% rate`, orange: true },
    { label: 'Clicked',     value: fmt.number(c.stats?.clicked),    sub: `${pct(c.stats?.clicked, c.stats?.delivered)}% rate` },
    { label: 'Revenue',     value: fmt.currency(c.stats?.revenue),  sub: `${fmt.number(c.stats?.conversions)} conversions`, orange: true },
  ];

  return (
    <div className="animate-fade-up">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20, gap: 6 }}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <StatusBadge status={c.status} />
            <ChannelBadge channel={c.channel} />
            {c.sentAt && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Sent {fmt.relative(c.sentAt)}</span>}
            {c.scheduledAt && <span style={{ fontSize: 12, color: 'var(--warning)' }}>⏰ Scheduled {fmt.dateTime(c.scheduledAt)}</span>}
          </div>
          <h1 className="page-title" style={{ fontSize: 30 }}>{c.name}</h1>
          <p className="page-subtitle">
            {c.audienceSize ? `${fmt.number(c.audienceSize)} recipients` : 'Draft campaign'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {c.status === 'draft' && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowSchedule(true)}>
                <Calendar size={14} /> Schedule
              </button>
              <button className="btn btn-primary" onClick={() => sendMut.mutate()} disabled={sendMut.isLoading}>
                <Send size={14} /> {sendMut.isLoading ? 'Sending...' : 'Send Now'}
              </button>
            </>
          )}
          {c.status === 'scheduled' && (
            <button className="btn btn-ghost" onClick={() => unscheduleMut.mutate()}>
              <X size={14} /> Cancel Schedule
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => cloneMut.mutate()}>
            <Copy size={14} /> Clone
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row" style={{ marginBottom: 20 }}>
        {metrics.map(({ label, value, sub, orange }) => (
          <div key={label} className="metric-cell">
            <div className={`metric-cell-value${orange ? ' orange' : ''}`}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
            <div className="metric-cell-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bento-grid bento-2" style={{ marginBottom: 20 }}>
        {/* Engagement Funnel */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Engagement Funnel</div>
          <EngagementFunnel data={funnelData} />
        </div>

        {/* Message Preview */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Campaign Message</div>
          <div style={{
            background: 'var(--bg-card-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-1)',
            whiteSpace: 'pre-wrap',
          }}>
            {c.message}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
            {c.message?.length} characters
          </div>
        </div>
      </div>

      {/* Communications Table */}
      {comms.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} color="var(--text-2)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Individual Messages</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>showing {comms.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Opened</th>
                <th>Clicked</th>
              </tr>
            </thead>
            <tbody>
              {comms.map((msg) => (
                <tr key={msg._id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{msg.customerId?.name || msg.customerId}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 600,
                      color: msg.status === 'delivered' ? 'var(--success)' :
                             msg.status === 'clicked' ? 'var(--orange)' :
                             msg.status === 'failed' ? 'var(--danger)' : 'var(--text-2)',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {msg.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{fmt.relative(msg.createdAt)}</td>
                  <td>{msg.openedAt ? <span style={{ color: 'var(--success)', fontSize: 12 }}>✓ {fmt.relative(msg.openedAt)}</span> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}</td>
                  <td>{msg.clickedAt ? <span style={{ color: 'var(--orange)', fontSize: 12 }}>✓ {fmt.relative(msg.clickedAt)}</span> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSchedule(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule Campaign</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowSchedule(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
                Send Date & Time
              </label>
              <input
                type="datetime-local"
                className="input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-2)' }}>
                The campaign will auto-send at the specified time
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!scheduleDate || scheduleMut.isLoading}
                onClick={() => scheduleMut.mutate()}
              >
                <Calendar size={14} />
                {scheduleMut.isLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
