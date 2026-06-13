import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getAnalyticsOverview, getRevenueTrend, getCampaignPerformance, getCustomerHealth } from '../api';
import { RevenueAreaChart, CampaignBarChart, SpendHistogram } from '../components/charts/Charts';
import { fmt, pct } from '../utils/formatters';

function SectionLabel({ children }) {
  return <div className="section-label" style={{ marginBottom: 14 }}>{children}</div>;
}

export default function Analytics() {
  const navigate = useNavigate();

  const { data: ov } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: getAnalyticsOverview });
  const { data: rev, isLoading: revLoading } = useQuery({ queryKey: ['analytics', 'revenue'], queryFn: () => getRevenueTrend(12) });
  const { data: camps } = useQuery({ queryKey: ['analytics', 'campaigns'], queryFn: () => getCampaignPerformance(8) });
  const { data: health } = useQuery({ queryKey: ['analytics', 'customers'], queryFn: getCustomerHealth });

  const o = ov?.data;
  const h = health?.data;

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 05 Insights</div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep-dive into your CRM performance metrics</p>
        </div>
      </div>

      {/* Overview KPI row */}
      {o && (
        <div className="bento-grid bento-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Revenue', value: fmt.currency(o.orders?.totalRevenue), sub: `${fmt.currency(o.orders?.revenueThisMonth)} this month`, orange: true },
            { label: 'Revenue Growth', value: o.orders?.revenueGrowth ? `${o.orders.revenueGrowth > 0 ? '+' : ''}${o.orders.revenueGrowth}%` : '—', sub: 'vs last month', color: o.orders?.revenueGrowth >= 0 ? 'var(--success)' : 'var(--danger)' },
            { label: 'Attributed Revenue', value: fmt.currency(o.orders?.attributedRevenue), sub: `${fmt.number(o.orders?.attributedOrders)} attributed orders` },
            { label: 'Avg Order Value', value: fmt.currency(Math.round(o.orders?.avgOrderValue)), sub: `${fmt.number(o.orders?.total)} total orders` },
          ].map(({ label, value, sub, orange, color }) => (
            <div key={label} className="card">
              <div className="card-label" style={{ marginBottom: 10 }}>{label}</div>
              <div style={{
                fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: -0.5, lineHeight: 1,
                color: orange ? 'var(--orange)' : color || 'var(--text-1)',
              }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Trend (full width) */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionLabel>12-Month Revenue Trend</SectionLabel>
        {revLoading ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <RevenueAreaChart data={rev?.data || []} />
        )}
      </div>

      <div className="bento-grid bento-2" style={{ marginBottom: 20 }}>
        {/* Campaign Leaderboard */}
        <div className="card">
          <SectionLabel>Campaign Leaderboard</SectionLabel>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>Ranked by open rate</div>
          {camps?.data?.length ? (
            <CampaignBarChart data={camps.data} />
          ) : (
            <div className="empty-state"><div className="empty-state-title">No completed campaigns</div></div>
          )}
        </div>

        {/* Engagement Overview */}
        {o && (
          <div className="card">
            <SectionLabel>Engagement Overview</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Delivery Rate', value: o.engagementFunnel?.overallDeliveryRate, max: 100 },
                { label: 'Open Rate',     value: o.engagementFunnel?.overallOpenRate, max: 100 },
                { label: 'Click Rate',    value: o.engagementFunnel?.overallClickRate, max: 100 },
              ].map(({ label, value, max }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>{fmt.percent(value)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(value || 0, 100)}%` }} />
                  </div>
                </div>
              ))}

              <div className="divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    {fmt.number(o.engagementFunnel?.totalMessages)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>total messages sent</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    {o.customers?.totalOptedOut || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>customers opted out</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Health Section */}
      {h && (
        <>
          <div className="bento-grid bento-3" style={{ marginBottom: 20 }}>
            {/* Spend Distribution */}
            <div className="card">
              <SectionLabel>Spend Distribution</SectionLabel>
              <SpendHistogram data={h.spendDistribution || []} />
            </div>

            {/* Top Cities */}
            <div className="card">
              <SectionLabel>Top Cities</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(h.topCities || []).slice(0, 8).map((city, i) => {
                  const maxCount = h.topCities?.[0]?.count || 1;
                  return (
                    <div key={city._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 18, fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-1)', flex: 1 }}>{city._id}</span>
                      <div style={{ flex: 1, maxWidth: 100 }}>
                        <div className="progress-bar" style={{ height: 3 }}>
                          <div className="progress-fill" style={{ width: `${(city.count / maxCount) * 100}%`, opacity: 0.7 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', minWidth: 32, textAlign: 'right' }}>{city.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Churn Risk */}
            <div className="card card-orange-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={14} color="var(--orange)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Churn Risk Alert
                </span>
              </div>

              <div style={{ fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--orange)', lineHeight: 1, marginBottom: 6 }}>
                {fmt.number(h.churnRisk?.count || 0)}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
                customers at risk<br />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Active 60–90 days ago · {fmt.currency(h.churnRisk?.totalSpend)} at-risk spend
                </span>
              </div>

              <div className="divider" />

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>Avg spend at risk</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {fmt.currency(Math.round(h.churnRisk?.avgSpend || 0))}
                </div>
              </div>

              <button
                className="btn btn-ghost-orange"
                style={{ marginTop: 20, width: '100%' }}
                onClick={() => navigate('/ai')}
              >
                Generate Win-Back →
              </button>
            </div>
          </div>

          {/* Customer Segments */}
          {o && (
            <div className="bento-grid bento-4" style={{ marginBottom: 20 }}>
              {[
                { label: 'Total Customers', value: fmt.number(o.customers?.total) },
                { label: 'Active',          value: fmt.number(o.customers?.active) },
                { label: 'New This Month',  value: fmt.number(o.customers?.newThisMonth) },
                { label: 'Inactive 90d',    value: fmt.number(o.customers?.inactive90Days) },
              ].map(({ label, value }) => (
                <div key={label} className="card" style={{ padding: '18px 20px' }}>
                  <div className="card-label" style={{ marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: -0.5 }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
