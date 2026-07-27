import React, { useMemo, useState } from 'react';
import { Flag } from 'lucide-react';
import { apiJson } from '../config/api';
import './FlagControl.css';

const REASONS = ['Inaccurate', 'Offensive/inappropriate', 'Wrong translation', 'Other'];

export default function FlagControl({ type, itemId, title, onToast }) {
  const storageKey = useMemo(() => `umuco_flagged_${type}_${itemId}`, [type, itemId]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [flagged, setFlagged] = useState(() => localStorage.getItem(storageKey) === '1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!itemId) return null;

  const submitFlag = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFlagged(true);
    localStorage.setItem(storageKey, '1');
    onToast?.('Thanks, our team will review this.');
    try {
      // TODO(backend): POST /api/content/:type/:id/flag creates a flagged review-queue row and enforces one flag per user per item.
      await apiJson(`/api/content/${type}/${itemId}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason, note: reason === 'Other' ? note : note || undefined }),
      });
      setOpen(false);
    } catch (err) {
      setError(err.message || 'We could not send that report yet.');
      setFlagged(false);
      localStorage.removeItem(storageKey);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flag-control">
      <button
        type="button"
        className="flag-trigger"
        onClick={(e) => {
          e.stopPropagation();
          if (!flagged) setOpen((value) => !value);
        }}
        disabled={flagged}
        aria-label={flagged ? `${title || 'Item'} already reported` : `Report ${title || 'item'}`}
        title={flagged ? 'Already reported' : 'Report this item'}
      >
        <Flag size={14} aria-hidden="true" />
        <span>{flagged ? 'Reported' : 'Report'}</span>
      </button>
      {open && !flagged && (
        <form className="flag-popover" onClick={(e) => e.stopPropagation()} onSubmit={submitFlag}>
          <label>
            <span>Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Note</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a short note" />
          </label>
          {error && <p className="flag-error">{error}</p>}
          <div className="flag-actions">
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
