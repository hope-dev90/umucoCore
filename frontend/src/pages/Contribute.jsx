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
} from 'lucide-react';
import './Contribute.css';
import insightWeaving from '../assets/explore/weaving_agaseke.jpg';
import insightInanga from '../assets/home/inanga.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/i18n';

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
  const { getToken } = useAuth();
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
      if (selectedFile) {
        formPayload.append('file', selectedFile);
      }
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`http://localhost:5000${endpoint}`, {
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
      <div className="contribute-page">
        <div className="contribute-hero">
          <h1>{t('contribute.heroTitle')}</h1>
          <p>{t('contribute.heroSub')}</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {stats.map(({ Icon, value, labelKey }, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon-badge">
                <Icon size={20} strokeWidth={2} />
              </div>
              <span className="stat-value">{value}</span>
              <span className="stat-label">{t(labelKey)}</span>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="action-cards">
          {actions.map(({ cls, Icon, titleKey, descKey }, i) => (
            <div
              key={i}
              className={`action-card ${cls}`}
              role="button"
              tabIndex={0}
              onClick={() => handleAction(cls)}
              onKeyDown={(e) => handleActionKeyDown(e, cls)}
            >
              <span className="action-card-icon-badge">
                <Icon size={22} strokeWidth={2} />
              </span>
              <div className="action-card-title">{t(titleKey)}</div>
              <div className="action-card-desc">{t(descKey)}</div>
            </div>
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

        {/* Bottom */}
        <div className="contribute-bottom">
          <div className="pipeline-card">
            <div className="pipeline-header">
              <span className="pipeline-title">{t('contribute.pipelineTitle')}</span>
              <span className="pipeline-badge">3 {language === 'rw' ? 'Ibyo' : 'Tasks'} {language === 'rw' ? 'Biri' : 'Active'}</span>
            </div>
            {filteredPipelineItems.map((p, i) => (
              <div key={i} className="pipeline-item">
                <div className="pipeline-item-title">{getLocalizedText(p.title, language)}</div>
                <div className="pipeline-item-sub">{getLocalizedText(p.sub, language)}</div>
                <div className="progress-bar-wrap">
                  <div className="pipeline-progress">
                    <div className={`pipeline-progress-fill ${p.cls}`} style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="pipeline-pct">{p.pct}% {language === 'rw' ? 'Byasohotse' : 'Complete'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="insights-card">
            <div className="insights-title">{t('contribute.insightsTitle')}</div>
            {filteredInsights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-thumb">
                  <img
                    src={ins.img}
                    alt={getLocalizedText(ins.title, language)}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="insight-thumb-placeholder" style={{ display: 'none' }}>
                    <Music size={18} strokeWidth={2} color="#fff" />
                  </div>
                </div>
                <div className="insight-info">
                  <h4>{getLocalizedText(ins.title, language)}</h4>
                  <p>{getLocalizedText(ins.desc, language)}</p>
                </div>
              </div>
            ))}
            <button type="button" className="view-hub-link" onClick={handleViewResourceHub}>
              {t('contribute.viewResourceHubLink')}
            </button>
          </div>
        </div>

        {message && <div className="contribute-toast">{message}</div>}

        <div className="contribute-footer">
          {t('contribute.footer')}
        </div>
      </div>
    </Layout>
  );
}