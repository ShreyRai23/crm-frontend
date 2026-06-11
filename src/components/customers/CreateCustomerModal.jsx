import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createCustomer } from '../../api';
import toast from 'react-hot-toast';

const CHANNELS = ['email', 'whatsapp', 'sms', 'rcs'];

export default function CreateCustomerModal({ onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const { mutate, isLoading } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries(['customers']);
      qc.invalidateQueries(['customer-stats']);
      toast.success('Customer created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message),
  });

  const onSubmit = (data) => {
    mutate({
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  // Portal: mount directly on document.body to escape any ancestor stacking context
  // (CSS animations with transform on parent break position:fixed otherwise)
  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Customer</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                Full Name *
              </label>
              <input
                className="input"
                placeholder="John Doe"
                {...register('name', { required: true })}
                style={{ borderColor: errors.name ? 'var(--danger)' : undefined }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                Email *
              </label>
              <input
                className="input"
                type="email"
                placeholder="john@example.com"
                {...register('email', { required: true })}
                style={{ borderColor: errors.email ? 'var(--danger)' : undefined }}
              />
            </div>
            <div className="bento-grid bento-2">
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Phone</label>
                <input className="input" placeholder="+91 98765 43210" {...register('phone')} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>City</label>
                <input className="input" placeholder="Mumbai" {...register('city')} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                Preferred Channel
              </label>
              <select className="select" style={{ width: '100%' }} {...register('preferredChannel')}>
                {CHANNELS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                Tags <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(comma separated)</span>
              </label>
              <input className="input" placeholder="vip, loyal, premium" {...register('tags')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading
                ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating...</>
                : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body   // ← renders outside all page stacking contexts
  );
}
