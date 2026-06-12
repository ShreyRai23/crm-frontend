import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Sparkles, Users,
  CheckCircle, Zap
} from 'lucide-react';
import { nlQuery, generateContent, getSegmentPresets, previewSegmentPreset, createCampaign } from '../api';
import { fmt } from '../utils/formatters';
import toast from 'react-hot-toast';

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#22C55E' },
  { id: 'email',    label: 'Email',    color: '#3B82F6' },
  { id: 'sms',      label: 'SMS',      color: '#F59E0B' },
  { id: 'rcs',      label: 'RCS',      color: '#A855F7' },
];

const STEPS = ['Audience', 'Content', 'Launch'];

function WizardSteps({ current }) {
  return (
    <div className="wizard-steps">
      {STEPS.map((s, i) => (
        <Fragment key={s}>
          <div className={`wizard-step${i === current ? ' active' : i < current ? ' done' : ''}`}>
            <div className="wizard-step-num">
              {i < current ? <CheckCircle size={12} fill="white" stroke="none" /> : i + 1}
            </div>
            <div className="wizard-step-label">{s}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`wizard-connector${i < current ? ' done' : ''}`} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ── Step 1: Audience ──────────────────────────────────────────────────────────
function Step1({ state, setState, onNext }) {
  const [mode, setMode] = useState('presets'); // 'nl' | 'presets'
  const [nlInput, setNlInput] = useState(state.nlPrompt || '');
  const [nlResult, setNlResult] = useState(null);
  const [nlLoading, setNlLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(state.presetId || null);
  const [previewData, setPreviewData] = useState(state.previewData || null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: presetsRes, isLoading: presetsLoading } = useQuery({
    queryKey: ['presets'],
    queryFn: () => getSegmentPresets(), // arrow wrapper prevents QueryFunctionContext being passed as arg
  });
  const presets = presetsRes?.data || [];

  // Auto-select the first preset when presets load and nothing is selected yet
  useEffect(() => {
    if (mode === 'presets' && presets.length > 0 && !selectedPreset) {
      handlePresetSelect(presets[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presets.length, mode]);

  const handleNLQuery = async () => {
    if (!nlInput.trim()) return;
    setNlLoading(true);
    try {
      const res = await nlQuery(nlInput);
      setNlResult(res);
      setState(s => ({
        ...s,
        nlPrompt: nlInput,
        audienceQuery: res.data?.pipeline,
        audienceSize: res.data?.count,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally { setNlLoading(false); }
  };

  const handlePresetSelect = async (preset) => {
    setSelectedPreset(preset.id);
    setPreviewLoading(true);
    try {
      const res = await previewSegmentPreset(preset.id);
      setPreviewData(res.data);
      setState(s => ({
        ...s,
        presetId: preset.id,
        audienceQuery: preset.pipeline,
        audienceSize: res.data.audienceSize,
        channel: preset.suggestedChannel || s.channel,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally { setPreviewLoading(false); }
  };

  // canContinue: either an audienceQuery is set (preset or NL) or a preset is actively selected
  const canContinue = state.audienceQuery || (mode === 'presets' && selectedPreset);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
        Define your audience
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 28 }}>
        Choose a pre-built segment or describe your audience in natural language
      </p>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'presets', label: '📋 Segment Presets', desc: '10 pre-built audiences' },
          { id: 'nl',      label: '🤖 AI Query', desc: 'Describe in natural language' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              border: `2px solid ${mode === m.id ? 'var(--orange)' : 'var(--border)'}`,
              background: mode === m.id ? 'var(--orange-glow)' : 'var(--bg-card-alt)',
              textAlign: 'left', transition: 'all var(--transition)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: mode === m.id ? 'var(--orange)' : 'var(--text-1)', marginBottom: 3 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Preset Grid */}
      {mode === 'presets' && (
        presetsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : (
          <>
            <div className="preset-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {presets.map(p => (
                <div
                  key={p.id}
                  className={`preset-card${selectedPreset === p.id ? ' selected' : ''}`}
                  onClick={() => handlePresetSelect(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div className="preset-card-name">{p.name}</div>
                    {p.category && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--orange)', textTransform: 'uppercase' }}>{p.category}</span>
                    )}
                  </div>
                  <div className="preset-card-desc">{p.description}</div>
                  {p.suggestedChannel && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                      Suggested: {p.suggestedChannel}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {previewLoading && <div style={{ textAlign: 'center', marginTop: 16 }}><div className="spinner" style={{ display: 'inline-block' }} /></div>}
            {previewData && (
              <div style={{
                marginTop: 16, padding: '14px 16px',
                background: 'var(--orange-glow)', border: '1px solid rgba(255,77,0,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Users size={18} color="var(--orange)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--orange)' }}>
                    {fmt.number(previewData.audienceSize)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>customers match this segment</div>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* NL Query */}
      {mode === 'nl' && (
        <div>
          <div style={{ position: 'relative' }}>
            <textarea
              className="input textarea"
              style={{ minHeight: 100, paddingRight: 100 }}
              placeholder="E.g. Customers who spent more than ₹10,000 in the last 90 days and visited at least 3 times..."
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleNLQuery}
            disabled={!nlInput.trim() || nlLoading}
          >
            {nlLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</> : <><Sparkles size={14} /> Execute Query</>}
          </button>

          {nlResult && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                padding: '14px 16px',
                background: 'var(--orange-glow)', border: '1px solid rgba(255,77,0,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              }}>
                <Users size={18} color="var(--orange)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--orange)' }}>
                    {fmt.number(nlResult.data?.count)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>customers match your query</div>
                </div>
              </div>
              {nlResult.data?.pipeline && (
                <details style={{ fontSize: 12 }}>
                  <summary style={{ color: 'var(--text-3)', cursor: 'pointer', marginBottom: 8 }}>View generated pipeline</summary>
                  <pre style={{
                    background: 'var(--bg-card-alt)', padding: 12, borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)', overflow: 'auto', fontSize: 11, color: 'var(--text-2)',
                  }}>
                    {JSON.stringify(nlResult.data.pipeline, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={onNext} disabled={!canContinue}>
          Next: Content <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Content ───────────────────────────────────────────────────────────
function Step2({ state, setState, onNext, onBack }) {
  const [generating, setGenerating] = useState(false);
  const channel = state.channel || 'whatsapp';

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Derive the best available audience description
      const audienceDescription =
        state.nlPrompt ||
        (state.presetId ? state.presetId.replace(/-/g, ' ') : null) ||
        'general customers';

      // Derive a campaign goal — name may not exist yet at Step 2, so use a smart fallback
      const campaignGoal =
        state.name ||
        (state.presetId
          ? `Re-engage ${state.presetId.replace(/-/g, ' ')} with a personalised offer`
          : 'Drive engagement and increase repeat purchases');

      const res = await generateContent({
        audienceDescription,
        campaignGoal,   // ← correct field name (was incorrectly named "goal")
        channel,
      });
      const content = res.data;   // interceptor already unwraps: res = { success, data: { body,... } }
      // For email, prepend the subject line so marketers see it in the textarea
      const text = channel === 'email' && content?.subject
        ? `Subject: ${content.subject}\n\n${content.body}`
        : (content?.body || '');

      if (!text) {
        toast.error('AI returned an empty message — check Gemini API key/quota and try again');
        return;
      }
      setState(s => ({ ...s, message: text }));
      toast.success('Message generated!');
    } catch (err) {
      // Axios wraps server errors — dig into the response envelope for the real message
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(`AI generation failed: ${serverMsg}`);
    } finally { setGenerating(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
        Craft your message
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 28 }}>
        Write your campaign message or generate it with AI
      </p>

      {/* Channel Selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Channel</div>
        <div className="channel-options">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              className={`channel-option${channel === ch.id ? ' selected' : ''}`}
              onClick={() => setState(s => ({ ...s, channel: ch.id }))}
              style={{ '--ch-color': ch.color }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: ch.color,
                boxShadow: channel === ch.id ? `0 0 8px ${ch.color}` : 'none',
                transition: 'box-shadow 0.2s',
              }} />
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Message</div>
          <button className="btn btn-ghost-orange btn-sm" onClick={handleGenerate} disabled={generating}>
            {generating
              ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Generating...</>
              : <><Sparkles size={12} /> Generate with AI</>
            }
          </button>
        </div>
        <textarea
          className="input textarea"
          style={{ minHeight: 140 }}
          placeholder="Hi {name}, we have an exclusive offer just for you..."
          value={state.message || ''}
          onChange={(e) => setState(s => ({ ...s, message: e.target.value }))}
        />
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
          {(state.message || '').length} characters
        </div>
      </div>

      {/* Preview */}
      {state.message && (
        <div style={{
          background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Preview — {channel}
          </div>
          <div style={{
            background: channel === 'whatsapp' ? 'rgba(34,197,94,0.08)' : 'var(--bg-card)',
            border: `1px solid ${channel === 'whatsapp' ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 14px',
            fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            maxWidth: 360, color: 'var(--text-1)',
          }}>
            {state.message}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost btn-lg" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext} disabled={!state.message?.trim()}>
          Next: Launch <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Launch ────────────────────────────────────────────────────────────
function Step3({ state, setState, onBack, onLaunch, isLoading }) {
  const [scheduleMode, setScheduleMode] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
        Ready to launch
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 28 }}>
        Give your campaign a name and choose when to send
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
        {/* Campaign Name */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Campaign Name *</div>
          <input
            className="input"
            style={{ fontSize: 16 }}
            placeholder="e.g. Summer Sale Win-Back"
            value={state.name || ''}
            onChange={(e) => setState(s => ({ ...s, name: e.target.value }))}
          />
        </div>

        {/* Send Mode */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>When to Send</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { id: 'now', label: '⚡ Send Now' },
              { id: 'schedule', label: '⏰ Schedule' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setScheduleMode(m.id)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${scheduleMode === m.id ? 'var(--orange)' : 'var(--border)'}`,
                  background: scheduleMode === m.id ? 'var(--orange-glow)' : 'var(--bg-card-alt)',
                  fontWeight: 700, fontSize: 13,
                  color: scheduleMode === m.id ? 'var(--orange)' : 'var(--text-2)',
                  cursor: 'pointer', transition: 'all var(--transition)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          {scheduleMode === 'schedule' && (
            <input
              type="datetime-local"
              className="input"
              style={{ marginTop: 12 }}
              value={scheduleDate}
              onChange={(e) => { setScheduleDate(e.target.value); setState(s => ({ ...s, scheduledAt: e.target.value })); }}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            />
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div style={{
        background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: 28,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          Campaign Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Audience</div>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--orange)' }}>
              {fmt.number(state.audienceSize || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Channel</div>
            <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize' }}>{state.channel || '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost btn-lg" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button
          className="btn btn-primary btn-lg"
          disabled={!state.name?.trim() || (scheduleMode === 'schedule' && !scheduleDate) || isLoading}
          onClick={() => onLaunch(scheduleMode === 'schedule' ? scheduleDate : null)}
        >
          {isLoading
            ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating...</>
            : <><Zap size={16} /> {scheduleMode === 'schedule' ? 'Schedule Campaign' : 'Launch Campaign'}</>
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function CampaignNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSuggestion = location.state?.fromSuggestion || false;

  // If arriving from an AI Studio suggestion, pre-fill state and jump to Step 1
  const [step, setStep] = useState(fromSuggestion ? 1 : 0);
  const [state, setState] = useState(() => {
    if (fromSuggestion && location.state) {
      const s = location.state;
      return {
        name:           s.name        || '',
        audienceQuery:  s.audienceQuery || [],
        audienceSize:   s.audienceSize  || 0,
        channel:        s.channel       || 'whatsapp',
        nlPrompt:       s.nlPrompt      || '',
        suggestionRationale: s.suggestionRationale || '',
      };
    }
    return { channel: 'whatsapp' };
  });

  const createMut = useMutation({
    mutationFn: createCampaign,
    onError: (err) => toast.error(err.message),
  });

  const handleLaunch = async (scheduleDate) => {
    try {
      const payload = {
        name: state.name,
        message: state.message,
        channel: state.channel,
        audienceQuery: state.audienceQuery,
        audienceSize: state.audienceSize,
      };
      const res = await createMut.mutateAsync(payload);
      const campId = res.data?._id || res._id;
      if (scheduleDate) {
        const { scheduleCampaign } = await import('../api');
        await scheduleCampaign(campId, new Date(scheduleDate).toISOString());
        toast.success('Campaign scheduled!');
      } else {
        const { sendCampaign } = await import('../api');
        await sendCampaign(campId);
        toast.success('Campaign launched!');
      }
      navigate(`/campaigns/${campId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-up">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24, gap: 6 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>// 03 New Campaign</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, letterSpacing: -1, marginBottom: 4 }}>
            Create Campaign
          </h1>
          {fromSuggestion && (
            <div style={{
              marginTop: 10, padding: '10px 16px',
              background: 'var(--orange-glow)', border: '1px solid rgba(255,77,0,0.25)',
              borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--orange)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Sparkles size={14} />
              <span>AI suggestion pre-loaded: <strong>{state.name}</strong> · {fmt.number(state.audienceSize)} customers · {state.channel}</span>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 36 }}>
          <WizardSteps current={step} />

          {step === 0 && <Step1 state={state} setState={setState} onNext={() => setStep(1)} />}
          {step === 1 && <Step2 state={state} setState={setState} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && (
            <Step3
              state={state}
              setState={setState}
              onBack={() => setStep(1)}
              onLaunch={handleLaunch}
              isLoading={createMut.isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
