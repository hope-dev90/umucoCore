import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Flag } from 'lucide-react';
import { apiJson } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './FlagControl.css';

// Reason ids; the report sent to admins uses the English label, the form shows a translated one.
const REASONS = ['inaccurate', 'offensive', 'translation', 'other'];
const REASON_EN = {
  inaccurate: 'Inaccurate',
  offensive: 'Offensive/inappropriate',
  translation: 'Wrong translation',
  other: 'Other',
};

export default function FlagControl({ type, itemId, title, onToast }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const storageKey = useMemo(() => `umuco_flagged_${type}_${itemId}`, [type, itemId]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [flagged, setFlagged] = useState(() => {
    try { return localStorage.getItem(storageKey) === '1'; } catch { return false; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!itemId) return null;

  const submitFlag = async (e) => {
    e.preventDefault();
    if (reason === 'other' && !note.trim()) {
      setError(t('flag.noteRequired'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Same endpoint as ReportButton: saves the report to the admin review queue.
      await apiJson('/api/contributions/report', {
        method: 'POST',
        body: JSON.stringify({
          type: 'report',
          item_type: type,
          item_id: String(itemId),
          title: title || `${type} ${itemId}`,
          description: `[${REASON_EN[reason]}] ${note.trim()}`.trim(),
          contributor_name: user?.name || 'Anonymous',
          contributor_email: user?.email || 'anonymous@system',
        }),
      });
      setFlagged(true);
      try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
      setOpen(false);
      setNote('');
      onToast?.(t('flag.thanks'));
    } catch {
      setError(t('flag.sendFailed'));
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
        aria-label={flagged ? t('flag.alreadyReported') : t('flag.reportItem')}
        title={flagged ? t('flag.alreadyReported') : t('flag.reportItem')}
      >
        <Flag size={14} aria-hidden="true" />
        <span>{flagged ? t('flag.reported') : t('flag.report')}</span>
      </button>
      {open && !flagged && ReactDOM.createPortal(
        <>
          <div
            className="flag-backdrop"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-hidden="true"
          />
          <form className="flag-popover" onClick={(e) => e.stopPropagation()} onSubmit={submitFlag}>
            <div className="flag-popover-header">
              <span className="flag-popover-title">{t('flag.title')}</span>
              <button
                type="button"
                className="flag-close-btn"
                onClick={() => setOpen(false)}
                aria-label={t('flag.close')}
              >✕</button>
            </div>
            <label>
              <span>{t('flag.reasonLabel')}</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((id) => <option key={id} value={id}>{t(`flag.reason.${id}`)}</option>)}
              </select>
            </label>
            <label>
              <span>{t('flag.noteLabel')}</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('flag.notePlaceholder')} />
            </label>
            {error && <p className="flag-error">{error}</p>}
            <div className="flag-actions">
              <button type="button" onClick={() => setOpen(false)}>{t('flag.cancel')}</button>
              <button type="submit" disabled={submitting}>{submitting ? t('flag.sending') : t('flag.send')}</button>
            </div>
          </form>
        </>,
        document.body
      )}
    </div>
  );
}
