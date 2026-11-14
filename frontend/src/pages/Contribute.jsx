import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Camera,
  FileText,
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  Music,
  HeartHandshake,
  X,
  ArrowRight,
} from 'lucide-react';
import './Contribute.css';
import insightWeaving from '../assets/explore/weaving_agaseke.jpg';
import insightInanga from '../assets/home/inanga.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/i18n';
import { apiUrl } from '../config/api';

const IMG = {
  insight1: insightWeaving,
  insight2: insightInanga,
};

// Icon components replace the old emoji strings — same lucide set used
// across the rest of the app, so this page reads as one product.
const stats = [
  { Icon: BookOpen, value: '42', labelKey: 'contribute.statsStoriesRecorded' },
  { Icon: CheckCircle2, value: '156', labelKey: 'contribute.statsItemsVerified' },
  { Icon: Users, value: '1.2k', labelKey: 'contribute.statsCommunityReach' },
  { Icon: Award, value: 'Gold', labelKey: 'contribute.statsChampionStatus' },
];

const actions = [
  { cls: 'upload', Icon: Mic, titleKey: 'contribute.uploadAudioTitle', descKey: 'contribute.uploadAudioDesc' },
  { cls: 'capture', Icon: Camera, titleKey: 'contribute.capturePhotoTitle', descKey: 'contribute.capturePhotoDesc' },
  { cls: 'submit', Icon: FileText, titleKey: 'contribute.submitOralHistoryTitle', descKey: 'contribute.submitOralHistoryDesc' },
];

const pipelineItems = [
  {
    title: { en: 'The Song of Nyiranseti (Audio)', rw: 'Indirimbo ya Nyiranseti (Umva)' },
    sub: { en: 'Currently under Peer Review by Elder Sibani.', rw: 'Icyo kijya kugenzura na Nyakuru Sibani.' },
    pct: 85,
    cls: 'fill-primary',
  },
  {
    title: { en: 'Nyanza Palace Digital Restoration (Photos)', rw: 'Ubwiyunge wa Ingoro y\'Nyanza (Ishusho)' },
    sub: { en: 'Waiting for metadata tagging on 12 items.', rw: 'Kugena ibintu byo kumenya ibintu 12.' },
    pct: 42,
    cls: 'fill-warn',
  },
];

const insights = [
  {
    img: IMG.insight1,
    title: { en: 'The Logic of Zig-Zag', rw: 'Ubwenge bw\'Umwuga' },
    desc: { en: 'Special seminar on the research behind the geometric motif in...', rw: 'Ishusho y\'imyaka ya research nyuma y\'ubushobozi bw\'...' },
  },
  {
    img: IMG.insight2,
    title: { en: 'Preserving Inanga Melodies', rw: 'Kubika Indirimbo z\'Inanga' },
    desc: { en: 'A guide on recording the delicate strings of...', rw: 'Urufunguzo rwo kumenya amajwi angana y\'...' },
  },
];

export default function Contribute() {
  const { t, language } = useLanguage();
  const { getToken, user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || t('contribute.champion');
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [topbarSearch, setTopbarSearch] = useState("");

  const filteredPipelineItems = pipelineItems.filter(item => {
    const query = topbarSearch.toLowerCase();
    return getLocalizedText(item.title, language).toLowerCase().includes(query) || 
           getLocalizedText(item.sub, language).toLowerCase().includes(query);
  });

  const filteredInsights = insights.filter(ins => {
    const query = topbarSearch.toLowerCase();
    return getLocalizedText(ins.title, language).toLowerCase().includes(query) || 
           getLocalizedText(ins.desc, language).toLowerCase().includes(query);
  });
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'audio',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAction = (type) => {
    if (type === 'upload') {
      setShowForm(true);
      setFormData(prev => ({ ...prev, type: 'audio' }));
    } else if (type === 'capture') {
      setShowForm(true);
      setFormData(prev => ({ ...prev, type: 'photo' }));
    } else if (type === 'submit') {
      setShowForm(true);
      setFormData(prev => ({ ...prev, type: 'oral_history' }));
    }
  };

  const handleActionKeyDown = (e, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction(type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((formData.type === 'audio' || formData.type === 'photo' || formData.type === 'video') && !selectedFile) {
      setMessage(language === 'rw' ? 'Hitamo ubwihererane bwawe' : 'Please select a file to upload');
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      const token = getToken();
      const endpoint = formData.type === 'audio' ? '/api/contributions/upload-audio'
        : formData.type === 'photo' ? '/api/contributions/capture-photo'
        : formData.type === 'video' ? '/api/contributions/upload-video'
        : '/api/contributions/oral-history';
      const formPayload = new FormData();
      formPayload.append('contributor_name', formData.name);
      formPayload.append('contributor_email', formData.email);
      formPayload.append('description', formData.description);
      formPayload.append('status', 'pending');
      if (selectedFile) {
        formPayload.append('file', selectedFile);
      }
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // TODO(backend): POST /api/contributions/* should create pending review-queue rows, not live content.
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers,
        body: formPayload,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      setSubmitted(true);
      setShowForm(false);
      setSelectedFile(null);
      setFileName('');
      setFormData({ name: '', email: '', type: 'audio', description: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Contribution submit failed:", err);
      setMessage(err.message || (language === 'rw' ? 'Byanze' : 'Submission failed'));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleViewResourceHub = () => {
    navigate("/explore");
  };

  return (
    <Layout searchPlaceholder={t('contribute.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="ds-page contribute-page contribute-ds">
        <section className="ds-hero">
          <div className="ds-hero-glow" aria-hidden="true" />
          <span className="ds-pill">{t('contribute.activePreserver')}</span>
          <h1>{t('contribute.greeting', { name: firstName })}</h1>
          <p>{t('contribute.heroSub')}</p>
        </section>

        {/* Stats */}
        <div className="ds-stats">
          {stats.map(({ value, labelKey }, i) => (
            <div key={labelKey} className={`ds-stat ${i === 0 ? 'ds-stat--brand' : ''}`}>
              <span>{t(labelKey)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <span className="ds-section-label contribute-actions-label">{t('home.actions')}</span>
        <div className="ds-actions">
          {actions.map(({ cls, Icon, titleKey, descKey }) => (
            <button key={cls} type="button" className="ds-action" onClick={() => handleAction(cls)}>
              <span className="ds-action-icon"><Icon size={15} strokeWidth={2} /></span>
              <span>
                <strong>{t(titleKey)} <ArrowRight size={12} /></strong>
                <small>{t(descKey)}</small>
              </span>
            </button>
          ))}
        </div>

        {/* Contribution Form Modal */}
        {showForm && (
          <div className="form-backdrop" onClick={() => setShowForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="form-close" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={18} />
              </button>
              <h2>{language === 'rw' ? 'Ohereza Umwanzuro' : 'Submit Your Contribution'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{language === 'rw' ? 'Amazina' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'rw' ? 'Injiza amazina yawe' : 'Enter your full name'}
                  />
                </div>
                <div className="form-group">
                  <label>{language === 'rw' ? 'Imeri' : 'Email'}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={language === 'rw' ? 'Injiza imeri yawe' : 'Enter your email'}
                  />
                </div>
                <div className="form-group">
                  <label>{language === 'rw' ? 'Ubwoko bw\'Ibyo Ushaka Gutanga' : 'Type of Contribution'}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="audio">{language === 'rw' ? 'Amajwi / Indirimbo' : 'Audio / Music'}</option>
                    <option value="photo">{language === 'rw' ? 'Ishusho' : 'Photo'}</option>
                    <option value="video">{language === 'rw' ? 'Videwo' : 'Video'}</option>
                    <option value="oral_history">{language === 'rw' ? 'Amateka y\'Abarundi' : 'Oral History'}</option>
                  </select>
                </div>
                {(formData.type === 'audio' || formData.type === 'photo' || formData.type === 'video') && (
                  <div className="form-group">
                    <label>{formData.type === 'audio'
                      ? (language === 'rw' ? 'Amajwi / Indirimbo' : 'Audio / Music File')
                      : formData.type === 'video'
                        ? (language === 'rw' ? 'Videwo' : 'Video File')
                        : (language === 'rw' ? 'Ishusho' : 'Photo')
                    }</label>
                    <input
                      type="file"
                      accept={formData.type === 'audio' ? 'audio/*' : formData.type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileChange}
                      className="form-file-input"
                    />
                    {fileName && (
                      <div className="file-name-display">
                        {formData.type === 'audio' ? '\u266B' : formData.type === 'video' ? '\uD83C\uDFAC' : '\uD83D\uDDBC'} {fileName}
                      </div>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label>{language === 'rw' ? 'Ibisobanuro' : 'Description'}</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'rw' ? 'Sobanura icyo ushaka gutanga...' : 'Describe what you are contributing...'}
                  />
                </div>
                <button type="submit" className="form-submit">
                  {language === 'rw' ? 'Ohereza' : 'Submit Contribution'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Thank You Card */}
        {submitted && (
          <div className="thankyou-card">
            <div className="thankyou-icon-badge">
              <HeartHandshake size={30} strokeWidth={2} />
            </div>
            <h3>{language === 'rw' ? 'Murakoze cyane!' : 'Thank You!'}</h3>
            <p>{language === 'rw'
              ? 'Twishimiye ko watanze ku bw\'umuco w\'u Rwanda. Ibyo wasanze bizagenzurwa mu buryo buhoraho.'
              : 'We appreciate your contribution to Rwandan culture. Your submission will be reviewed by our team shortly.'}
            </p>
            <button onClick={() => setSubmitted(false)} className="thankyou-btn">
              {language === 'rw' ? 'Nibyiza' : 'Close'}
            </button>
          </div>
        )}

        {message && <div className="contribute-toast">{message}</div>}

      </div>
    </Layout>
  );
}
