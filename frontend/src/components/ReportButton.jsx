import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiUrl } from '../config/api';

export default function ReportButton({ itemType, itemId, itemTitle }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(apiUrl('/api/contributions/report'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'report',
          item_type: itemType,
          item_id: itemId,
          title: itemTitle,
          description: reason,
          contributor_name: 'User Report',
          contributor_email: 'report@system',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setReason('');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  if (submitted) {
    return (
      <div className="report-success">
        {language === 'rw' ? 'Wagize' : language === 'fr' ? 'Merci' : 'Thank you'}!
      </div>
    );
  }

  return (
    <div className="report-button-container">
      <button
        type="button"
        className="report-button"
        onClick={() => setIsOpen(!isOpen)}
        title={language === 'rw' ? 'Raporo' : language === 'fr' ? 'Signaler' : 'Report'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>

      {isOpen && (
        <div className="report-modal">
          <div className="report-modal-content">
            <h3>
              {language === 'rw' ? 'Raporo' : language === 'fr' ? 'Signaler un problème' : 'Report Issue'}
            </h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={language === 'rw' ? 'Sobanura ikibazo...' : language === 'fr' ? 'Décrivez le problème...' : 'Describe the issue...'}
                required
                rows="4"
              />
              <div className="report-modal-actions">
                <button type="button" onClick={() => setIsOpen(false)}>
                  {language === 'rw' ? 'Kureka' : language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="submit-btn">
                  {language === 'rw' ? 'Kohereza' : language === 'fr' ? 'Envoyer' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}