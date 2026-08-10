import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import SurvivorTestimonyGallery from '../components/SurvivorTestimonyGallery';
import './SurvivorTestimoniesPage.css';

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function SurvivorTestimoniesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="survivor-testimonies-page">
        <button 
          type="button"
          onClick={() => navigate('/kwibuka')} 
          className="testimonies-page-back-btn"
        >
          <ArrowLeftIcon />
          {t('testimonies.backToKwibuka')}
        </button>
        <SurvivorTestimonyGallery />
      </div>
    </Layout>
  );
}
