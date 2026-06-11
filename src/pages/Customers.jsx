import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Users } from 'lucide-react';
import { getCustomers, getCustomerStats } from '../api';
import { ChannelBadge, TagBadge } from '../components/ui/Badge';
import { fmt } from '../utils/formatters';
import CreateCustomerModal from '../components/customers/CreateCustomerModal';

const CHANNELS = ['whatsapp', 'email', 'sms', 'rcs'];

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cursor, setCursor] = useState(null);       // cursor-based pagination
  const [allCustomers, setAllCustomers] = useState([]);

  // TanStack Query v5 — no onSuccess. Drive state from data directly.
  const { data: statsData } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['customers', search, channel, cursor],
    queryFn: () => {
      const params = { limit: 20 };
      if (search)  params.search  = search;
      if (channel) params.channel = channel;
      if (cursor)  params.cursor  = cursor;   // backend uses _id as cursor
      return getCustomers(params);
    },
    placeholderData: (prev) => prev,
  });

  // Accumulate pages — reset when cursor is null (filter change), append otherwise
  useEffect(() => {
    if (!data?.data) return;
    if (!cursor) {
      setAllCustomers(data.data);
    } else {
      setAllCustomers(prev => {
        const ids = new Set(prev.map(c => c._id));
        return [...prev, ...data.data.filter(c => !ids.has(c._id))];
      });
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasNext = data?.pagination?.hasNextPage || false;

  const handleSearch = (v) => {
    setSearch(v);
    setCursor(null);      // reset to first page
    setAllCustomers([]);
  };

  const handleChannel = (v) => {
    setChannel(v);
    setCursor(null);      // reset to first page
    setAllCustomers([]);
  };

  // Pass the cursor from the last response to fetch the next batch
  const loadMore = () => {
    const nextCursor = data?.pagination?.cursor;
    if (nextCursor) setCursor(nextCursor);
  };

  const stats = statsData?.data?.overview;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 02 Audience</div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            {stats
              ? `${fmt.number(stats.activeCustomers)} active · ${fmt.currency(Math.round(stats.avgSpend))} avg spend`
              : 'Your customer database'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="bento-grid bento-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Customers', value: fmt.number(stats.totalCustomers) },
            { label: 'Active',          value: fmt.number(stats.activeCustomers) },
            { label: 'Total Revenue',   value: fmt.currency(stats.totalSpend) },
            { label: 'Avg Spend',       value: fmt.currency(Math.round(stats.avgSpend)) },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '18px 20px' }}>
              <div className="card-label" style={{ marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: -0.5 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
        <div className="input-wrapper input-icon-left" style={{ flex: 1, maxWidth: 360 }}>
          <Search className="input-icon" />
          <input
            className="input"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              style={{ position: 'absolute', right: 10, color: 'var(--text-3)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className="select"
          value={channel}
          onChange={(e) => handleChannel(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">All Channels</option>
          {CHANNELS.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        {(search || channel) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { handleSearch(''); handleChannel(''); }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Channel</th>
              <th>Tags</th>
              <th>Total Spend</th>
              <th>Visits</th>
              <th>Last Visit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && allCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : allCustomers.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Users className="empty-state-icon" />
                    <div className="empty-state-title">No customers found</div>
                    <div className="empty-state-sub">Try adjusting your filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              allCustomers.map((c) => (
                <tr key={c._id} onClick={() => navigate(`/customers/${c._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `hsl(${c.name.charCodeAt(0) * 5}, 55%, 30%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><ChannelBadge channel={c.preferredChannel} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.tags || []).slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                      {c.tags?.length > 2 && (
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>+{c.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15 }}>
                    {fmt.currency(c.totalSpend)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                    {c.visitCount}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {c.lastVisit ? fmt.relative(c.lastVisit) : '—'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 600,
                      color: c.isActive ? 'var(--success)' : 'var(--text-3)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: c.isActive ? 'var(--success)' : 'var(--text-3)',
                      }} />
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Load More */}
        {hasNext && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={loadMore} disabled={isFetching}>
              {isFetching
                ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Loading...</>
                : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <CreateCustomerModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
