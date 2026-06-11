import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Megaphone, DollarSign, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { RevenueAreaChart, ChannelDonut, EngagementFunnel, CampaignBarChart } from '../components/charts/Charts';
import { StatusBadge, ChannelBadge } from '../components/ui/Badge';
import { getAnalyticsOverview, getRevenueTrend, getCampaignPerformance } from '../api';
import { fmt, pct } from '../utils/formatters';

function SectionLabel({ children }) {
  return <div className="section-label" style={{ marginBottom: 16 }}>{children}</div>;
}

function LoadingCard({ height = 200 }) {
  return (
    <div className="card" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
    refetchInterval: 60000,
  });

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => getRevenueTrend(12),
  });

  const { data: campPerf, isLoading: campLoading } = useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => getCampaignPerformance(6),
  });

  const ov = overview?.data;

  return (
    <div className="animate-fade-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 01 Overview</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time view of your CRM performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}>
          <Zap size={14} />
          New Campaign
        </button>
      </div>

      {/* KPI Row */}
      <div className="bento-grid bento-4" style={{ marginBottom: 20 }}>
        {ovLoading ? (
          Array(4).fill(0).map((_, i) => <LoadingCard key={i} height={130} />)
        ) : ov ? (
          <>
            <StatCard
              label="Total Revenue"
              value={fmt.currency(ov.orders?.totalRevenue)}
              sub={`${fmt.number(ov.orders?.total)} orders`}
              change={ov.orders?.revenueGrowth}
              orange
              icon={DollarSign}
            />
            <StatCard
              label="Active Customers"
              value={fmt.number(ov.customers?.active)}
              sub={`${fmt.number(ov.customers?.newThisMonth)} new this month`}
              icon={Users}
            />
            <StatCard
              label="Campaigns"
              value={fmt.number(ov.campaigns?.total)}
              sub={`${ov.campaigns?.running || 0} running now`}
              icon={Megaphone}
            />
            <StatCard
              label="Avg Open Rate"
              value={fmt.percent(ov.engagementFunnel?.overallOpenRate)}
              sub={`${fmt.percent(ov.engagementFunnel?.overallClickRate)} click rate`}
              icon={TrendingUp}
            />
          </>
        ) : null}
      </div>

      {/* Revenue Chart + Channel Donut */}
      <div className="bento-grid bento-3" style={{ marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div className="card col-span-2" style={{ padding: '24px 24px 16px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div>
              <SectionLabel>Revenue Trend</SectionLabel>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: -0.5 }}>
                {ov ? fmt.currency(ov.orders?.totalRevenue) : '—'}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginLeft: 8 }}>lifetime</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: '#FF4D00', display: 'inline-block' }} />
                Total
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: '#3B82F6', borderTop: '2px dashed #3B82F6', display: 'inline-block' }} />
                Attributed
              </span>
            </div>
          </div>
          {revLoading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          ) : (
            <RevenueAreaChart data={revenueData?.data || []} />
          )}
        </div>

        {/* Channel Donut */}
        <div className="card">
          <SectionLabel>Channel Mix</SectionLabel>
          <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 20, letterSpacing: -0.3 }}>
            {ov ? fmt.number(ov.customers?.active) : '—'}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginLeft: 6 }}>active</span>
          </div>
          {ovLoading ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : (
            <ChannelDonut data={ov?.customers?.channelDistribution || []} />
          )}
        </div>
      </div>

      {/* Engagement Funnel + Campaign Leaderboard + Churn Risk */}
      <div className="bento-grid bento-3" style={{ marginBottom: 20 }}>
        {/* Engagement Funnel */}
        <div className="card">
          <SectionLabel>Engagement Funnel</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>
            {ov ? `${fmt.percent(ov.engagementFunnel?.overallDeliveryRate)} delivery · ${fmt.percent(ov.engagementFunnel?.overallOpenRate)} open` : 'Loading...'}
          </div>
          {ovLoading ? (
            <div className="spinner" />
          ) : (
            <EngagementFunnel data={ov?.engagementFunnel} />
          )}
        </div>

        {/* Campaign Leaderboard */}
        <div className="card">
          <SectionLabel>Top Campaigns</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>by open rate</div>
          {campLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : (
            <CampaignBarChart data={campPerf?.data || []} />
          )}
        </div>

        {/* Right column: Churn Risk + Recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Churn Risk */}
          {ov && (
            <div className="card card-orange-border" style={{ flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={14} color="var(--orange)" />
                <span className="card-label" style={{ color: 'var(--orange)' }}>Churn Risk</span>
              </div>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-1)' }}>
                {fmt.number(ov.customers?.inactive90Days)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                customers inactive 90+ days
              </div>
              <button
                className="btn btn-ghost-orange btn-sm"
                style={{ marginTop: 14, width: '100%' }}
                onClick={() => navigate('/ai')}
              >
                Create Win-Back Campaign →
              </button>
            </div>
          )}

          {/* Attribution */}
          {ov && (
            <div className="card" style={{ flex: 1 }}>
              <div className="card-label" style={{ marginBottom: 10 }}>Attribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--orange)' }}>
                    {fmt.currency(ov.orders?.attributedRevenue)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>campaign-attributed revenue</div>
                </div>
                <div className="divider" />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt.number(ov.orders?.attributedOrders)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>attributed orders</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Campaigns Table */}
      {ov?.recentCampaigns?.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <SectionLabel>Recent Campaigns</SectionLabel>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')}>
              View all →
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Delivered</th>
                <th>Open Rate</th>
              </tr>
            </thead>
            <tbody>
              {ov.recentCampaigns.map((c) => (
                <tr key={c._id} onClick={() => navigate(`/campaigns/${c._id}`)}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><ChannelBadge channel={c.channel} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{fmt.number(c.stats?.sent)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{fmt.number(c.stats?.delivered)}</td>
                  <td style={{ color: 'var(--orange)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    {pct(c.stats?.opened, c.stats?.delivered)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
