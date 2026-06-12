import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Send, Calendar, ChevronRight, Megaphone } from 'lucide-react';
import { getCampaigns, sendCampaign, cloneCampaign } from '../api';
import { StatusBadge, ChannelBadge } from '../components/ui/Badge';
import { fmt, pct } from '../utils/formatters';
import toast from 'react-hot-toast';

const TABS = ['all', 'draft', 'scheduled', 'running', 'completed', 'failed'];

export default function Campaigns() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const params = activeTab !== 'all' ? { status: activeTab, limit: 50 } : { limit: 50 };

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', activeTab],
    queryFn: () => getCampaigns(params),
  });

  const sendMutation = useMutation({
    mutationFn: (id) => sendCampaign(id),
    onSuccess: () => { qc.invalidateQueries(['campaigns']); toast.success('Campaign sent!'); },
    onError: (err) => toast.error(err.message),
  });

  const cloneMutation = useMutation({
    mutationFn: (id) => cloneCampaign(id),
    onSuccess: () => { qc.invalidateQueries(['campaigns']); toast.success('Campaign cloned!'); },
    onError: (err) => toast.error(err.message),
  });

  const campaigns = data?.data || [];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 03 Campaigns</div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Design, schedule, and track your marketing campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}>
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`tab${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Megaphone className="empty-state-icon" />
            <div className="empty-state-title">No campaigns yet</div>
            <div className="empty-state-sub">
              {activeTab !== 'all' ? `No ${activeTab} campaigns` : 'Create your first campaign to get started'}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/campaigns/new')}>
              <Plus size={14} /> Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map((c, i) => (
            <div
              key={c._id}
              className="campaign-card"
              onClick={() => navigate(`/campaigns/${c._id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Counter */}
                <div className="campaign-card-counter" style={{ minWidth: 36 }}>
                  <span>//</span> {String(i + 1).padStart(2, '0')}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }} className="truncate">
                      {c.name}
                    </span>
                    <StatusBadge status={c.status} />
                    <ChannelBadge channel={c.channel} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {c.audienceSize ? `${fmt.number(c.audienceSize)} recipients` : 'Not sent yet'}
                    {c.sentAt && ` · sent ${fmt.relative(c.sentAt)}`}
                    {c.scheduledAt && ` · scheduled ${fmt.relative(c.scheduledAt)}`}
                  </div>
                </div>

                {/* Stats */}
                {c.status === 'completed' && (
                  <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                    {[
                      { label: 'Delivered', value: `${pct(c.stats?.delivered, c.stats?.sent)}%` },
                      { label: 'Opened',    value: `${pct(c.stats?.opened, c.stats?.delivered)}%`, orange: true },
                      { label: 'Clicked',   value: `${pct(c.stats?.clicked, c.stats?.delivered)}%` },
                    ].map(({ label, value, orange }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 800,
                          color: orange ? 'var(--orange)' : 'var(--text-1)',
                        }}>{value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {c.status === 'draft' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => sendMutation.mutate(c._id)}
                      disabled={sendMutation.isLoading}
                    >
                      <Send size={12} /> Send
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    title="Clone campaign"
                    onClick={() => cloneMutation.mutate(c._id)}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => navigate(`/campaigns/${c._id}`)}
                    title="View details"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
