import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Users, Zap, MessageSquare, Bot, RefreshCw } from 'lucide-react';
import { getAISuggestions, nlQuery, generateContent } from '../api';
import { ChannelBadge } from '../components/ui/Badge';
import { fmt } from '../utils/formatters';
import toast from 'react-hot-toast';

const CHANNEL_OPTS = ['whatsapp', 'email', 'sms', 'rcs'];

// ── Tab 1: AI Suggestions ─────────────────────────────────────────────────────
function SuggestionsTab() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: getAISuggestions,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const suggestions = data?.data?.suggestions || [];

  const handleUse = (s) => {
    navigate('/campaigns/new', {
      state: {
        // Pre-fill every field the wizard needs
        name: s.name,
        audienceQuery: s.audienceQuery,
        audienceSize: s.audienceSize,
        channel: s.suggestedChannel || 'whatsapp',
        nlPrompt: s.description,        // used by AI content generation
        suggestionRationale: s.rationale,
        fromSuggestion: true,
      },
    });
    toast.success(`Opening "${s.name}" — audience & channel pre-filled!`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 500 }}>
            Gemini analyzes your CRM data — customer spend patterns, inactivity, channel preferences, and revenue trends — then generates data-driven campaign ideas.
          </div>
          {data?.data?.basedOn && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
              Based on {fmt.number(data.data.basedOn.totalCustomers)} customers · {fmt.number(data.data.basedOn.inactiveCount)} inactive · generated {fmt.relative(data.data.generatedAt)}
            </div>
          )}
        </div>
        <button className="btn btn-ghost" onClick={() => refetch()} disabled={isFetching} style={{ flexShrink: 0 }}>
          <RefreshCw size={13} style={{ animation: isFetching ? 'spin 0.7s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {isLoading || isFetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div className="spinner spinner-lg" />
            <Bot size={16} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--orange)' }} />
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>Analyzing your CRM data...</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Gemini is reading 997 customers, revenue trends, and engagement metrics</div>
        </div>
      ) : isError ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
            AI service is temporarily unavailable. This is usually due to high demand on the Gemini API.
          </div>
          <button className="btn btn-ghost-orange" onClick={() => refetch()}>
            <RefreshCw size={13} /> Try Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {suggestions.map((s, i) => (
            <div key={i} className="ai-suggestion-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5,
                  color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Sparkles size={10} /> AI Suggestion
                </div>
                <ChannelBadge channel={s.suggestedChannel} />
              </div>

              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, marginBottom: 10, lineHeight: 1.3 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
                {s.rationale}
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--orange)' }}>
                    {fmt.number(s.audienceSize)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>customers</div>
                </div>
                {s.estimatedImpact && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{s.estimatedImpact}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>est. impact</div>
                  </div>
                )}
              </div>

              <button className="btn btn-ghost-orange" style={{ width: '100%' }} onClick={() => handleUse(s)}>
                Use This Suggestion <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: NL Query ───────────────────────────────────────────────────────────
function NLQueryTab() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await nlQuery(prompt);
      setResult(res);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(`Query failed: ${serverMsg}`);
    } finally { setLoading(false); }
  };

  const EXAMPLES = [
    'Customers who spent over ₹5000 but haven\'t visited in 60 days',
    'High-value customers in Mumbai and Delhi',
    'New customers from the last 30 days who bought at least twice',
  ];

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
        Describe your target audience in plain English. Gemini converts it into a MongoDB query and counts matching customers.
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Try an example
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              className="btn btn-ghost btn-sm"
              style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 12 }}
              onClick={() => setPrompt(ex)}
            >
              → {ex}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <textarea
          className="input textarea"
          style={{ minHeight: 100 }}
          placeholder="Describe your audience in natural language..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleQuery(); }}
        />
      </div>
      <button className="btn btn-primary" onClick={handleQuery} disabled={!prompt.trim() || loading}>
        {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Querying...</> : <><Sparkles size={14} /> Execute Query</>}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: 'var(--orange-glow)', border: '1px solid rgba(255,77,0,0.2)',
              borderRadius: 'var(--radius-md)', padding: '16px 24px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Users size={20} color="var(--orange)" />
              <div>
                <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--orange)', lineHeight: 1 }}>
                  {fmt.number(result.data?.count)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>matching customers</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/campaigns/new', { state: { nl: prompt, count: result.data?.count, pipeline: result.data?.pipeline } })}
            >
              <Zap size={14} /> Use for Campaign
            </button>
          </div>

          {result.data?.results?.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                SAMPLE RESULTS
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Channel</th><th>Total Spend</th><th>Last Visit</th></tr>
                </thead>
                <tbody>
              {result.data.results.slice(0, 5).map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>{c.preferredChannel}</span></td>
                      <td style={{ fontWeight: 700 }}>{fmt.currency(c.totalSpend)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.lastVisit ? fmt.relative(c.lastVisit) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.data?.pipeline && (
            <details style={{ marginTop: 12, fontSize: 12 }}>
              <summary style={{ color: 'var(--text-3)', cursor: 'pointer', marginBottom: 8 }}>View pipeline JSON</summary>
              <pre style={{
                background: 'var(--bg-card-alt)', padding: 16, borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', overflow: 'auto',
              }}>
                {JSON.stringify(result.data.pipeline, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Content Generator ──────────────────────────────────────────────────
function ContentGeneratorTab() {
  const [audienceDesc, setAudienceDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!audienceDesc.trim() || !goal.trim()) return;
    setLoading(true);
    try {
      const res = await generateContent({
        audienceDescription: audienceDesc,
        campaignGoal: goal,   // ← correct field name matching backend requireFields
        channel,
      });
      // Interceptor unwraps HTTP body → res = { success, data: { body, subject?, ctaText } }
      const content = res.data;
      const text = channel === 'email' && content?.subject
        ? `Subject: ${content.subject}\n\n${content.body}`
        : (content?.body || '');
      if (!text) {
        toast.error('AI returned empty content — check API quota');
        return;
      }
      setResult(text);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(`Generation failed: ${serverMsg}`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
        Generate personalized message copy for any audience and goal.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Audience Description</div>
          <input className="input" placeholder="High-value customers inactive for 90 days..." value={audienceDesc} onChange={(e) => setAudienceDesc(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Campaign Goal</div>
          <input className="input" placeholder="Win-back with exclusive 20% discount..." value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Channel</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {CHANNEL_OPTS.map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                  border: `1px solid ${channel === ch ? 'var(--orange)' : 'var(--border)'}`,
                  background: channel === ch ? 'var(--orange-glow)' : 'var(--bg-card-alt)',
                  color: channel === ch ? 'var(--orange)' : 'var(--text-2)',
                  fontSize: 12, fontWeight: 600, textTransform: 'capitalize', transition: 'all var(--transition)',
                }}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleGenerate} disabled={!audienceDesc.trim() || !goal.trim() || loading}>
        {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating...</> : <><Sparkles size={14} /> Generate Message</>}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Generated Message
          </div>
          <div style={{
            background: 'var(--bg-card-alt)', border: '1px solid rgba(255,77,0,0.2)',
            borderRadius: 'var(--radius-md)', padding: 20,
            fontSize: 14, lineHeight: 1.7, color: 'var(--text-1)',
            whiteSpace: 'pre-wrap', position: 'relative',
          }}>
            {result}
            <button
              onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: 'var(--text-2)',
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AI Studio ────────────────────────────────────────────────────────────
export default function AIStudio() {
  const [tab, setTab] = useState('suggestions');

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 04 AI Studio</div>
          <h1 className="page-title">AI Studio</h1>
          <p className="page-subtitle">Powered by Gemini · Real data · Actionable insights</p>
        </div>
      </div>

      <div className="tabs">
        {[
          { id: 'suggestions', label: '✦ Campaign Suggestions' },
          { id: 'query',       label: '⌨ NL Query' },
          { id: 'content',     label: '✍ Content Generator' },
        ].map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'suggestions' && <SuggestionsTab />}
      {tab === 'query' && <NLQueryTab />}
      {tab === 'content' && <ContentGeneratorTab />}
    </div>
  );
}
