import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { getCustomer, getCustomerCampaignHistory, optOutCustomer, optInCustomer } from '../api';
import { StatusBadge, ChannelBadge, TagBadge } from '../components/ui/Badge';
import { fmt } from '../utils/formatters';
import toast from 'react-hot-toast';

const CHANNELS = ['whatsapp', 'email', 'sms', 'rcs'];

function OptOutToggle({ customerId, channel, optedOut, onSuccess }) {
  const { mutate, isLoading } = useMutation({
    mutationFn: () => optedOut
      ? optInCustomer(customerId, [channel])
      : optOutCustomer(customerId, [channel]),
    onSuccess: () => {
      onSuccess?.();
      toast.success(optedOut ? `Opted back in to ${channel}` : `Opted out of ${channel}`);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <button
      onClick={(e) => { e.stopPropagation(); mutate(); }}
      disabled={isLoading}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${optedOut ? 'var(--danger)' : 'var(--border)'}`,
        background: optedOut ? 'var(--danger-bg)' : 'var(--bg-card-alt)',
        cursor: 'pointer',
        fontSize: 12, fontWeight: 600,
        color: optedOut ? 'var(--danger)' : 'var(--text-2)',
        transition: 'all var(--transition)',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {optedOut ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
      {channel.charAt(0).toUpperCase() + channel.slice(1)}
      <span style={{ fontSize: 10, opacity: 0.7 }}>{optedOut ? 'OUT' : 'IN'}</span>
    </button>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: customerRes, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });

  const { data: historyRes } = useQuery({
    queryKey: ['customer-history', id],
    queryFn: () => getCustomerCampaignHistory(id),
  });

  const customer = customerRes?.data;
  const history = historyRes?.data || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!customer) return null;

  const optedOut = customer.optedOutChannels || [];
  const initials = customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor = `hsl(${customer.name.charCodeAt(0) * 5}, 55%, 28%)`;

  return (
    <div className="animate-fade-up">
      {/* Back */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20, gap: 6 }}
      >
        <ArrowLeft size={14} /> Back to Customers
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Left: Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile Card */}
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff',
                fontFamily: 'var(--font-display)',
                border: '3px solid var(--border)',
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{customer.name}</div>
                <ChannelBadge channel={customer.preferredChannel} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                <Mail size={13} /> {customer.email}
              </div>
              {customer.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                  <Phone size={13} /> {customer.phone}
                </div>
              )}
              {customer.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                  <MapPin size={13} /> {customer.city}, {customer.country}
                </div>
              )}
            </div>

            {customer.tags?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {customer.tags.map(t => <TagBadge key={t} tag={t} />)}
              </div>
            )}
          </div>

          {/* Spend Stats */}
          <div className="card card-orange-border">
            <div className="card-label" style={{ marginBottom: 12 }}>Lifetime Value</div>
            <div style={{ fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--orange)', letterSpacing: -1, lineHeight: 1 }}>
              {fmt.currency(customer.totalSpend)}
            </div>
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>{customer.visitCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>total visits</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.lastVisit ? fmt.relative(customer.lastVisit) : '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>last visit</div>
              </div>
            </div>
          </div>

          {/* Opt-Out Management */}
          <div className="card">
            <div className="card-label" style={{ marginBottom: 12 }}>Channel Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHANNELS.map(ch => (
                <OptOutToggle
                  key={ch}
                  customerId={id}
                  channel={ch}
                  optedOut={optedOut.includes(ch)}
                  onSuccess={() => qc.invalidateQueries(['customer', id])}
                />
              ))}
            </div>
            {optedOut.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)' }}>
                Opted out of: {optedOut.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Right: History + Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Campaign History */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={15} color="var(--text-2)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Campaign History</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{history.length} campaigns</span>
            </div>

            {history.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <MessageSquare className="empty-state-icon" />
                <div className="empty-state-title">No campaigns yet</div>
                <div className="empty-state-sub">This customer hasn't been reached by any campaign</div>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {history.map((h) => (
                  <div key={h._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 24px',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: h.status === 'delivered' ? 'var(--success)' :
                                  h.status === 'clicked' ? 'var(--orange)' :
                                  h.status === 'failed' ? 'var(--danger)' : 'var(--text-3)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{h.campaignId?.name || 'Campaign'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                        {fmt.relative(h.createdAt)} · {h.status}
                      </div>
                    </div>
                    {h.campaignId?.channel && <ChannelBadge channel={h.campaignId.channel} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          {customer.recentOrders?.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={15} color="var(--text-2)" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Recent Orders</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Attributed</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map(o => (
                    <tr key={o._id}>
                      <td><span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{o._id.slice(-8)}</span></td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15 }}>{fmt.currency(o.amount)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{fmt.date(o.purchasedAt)}</td>
                      <td>
                        {o.attributedCampaignId ? (
                          <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>✦ Campaign</span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
