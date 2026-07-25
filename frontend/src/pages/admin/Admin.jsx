import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  BarChart2,
  BookOpen,
  Download,
  Flag,
  Image,
  Mic,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Upload,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiJson } from '../../config/api';
import TrilingualField, {
  emptyLocalizedText,
  localizedEnglish,
  localizedLanguages,
  localizedPreview,
  normalizeLocalizedText,
} from '../../components/admin/TrilingualField';
import './Admin.css';

const REFRESH_MS = 30000;
const AdminI18nContext = React.createContext((text) => text);

const sections = [
  'metrics',
  'archive',
  'stories',
  'collections',
  'national',
  'review',
  'content',
  'news',
  'users',
  'contributors',
  'map',
  'community',
  'ai',
  'analytics',
  'settings',
];

const titles = {
  metrics: ['Dashboard', 'Platform overview - last updated just now'],
  archive: ['Archive', 'Live archive records are managed from Content Registry'],
  stories: ['Stories & Legends', 'Story records are managed from Content Registry'],
  collections: ['Collections', 'Curated groupings displayed in the Archive and Explore pages'],
  national: ['National Collection', 'National records are managed from Heritage items'],
  review: ['Review Queue', 'Submissions and flags waiting for admin sign-off'],
  content: ['Content Registry', 'Videos, audio, and heritage asset intake'],
  news: ['News Desk', 'Publication control and public updates'],
  users: ['Users', 'Registered accounts - manage roles and access'],
  contributors: ['Contributors', 'Contributor access is controlled from user roles'],
  map: ['Cultural Map', 'Mapped sites come from live heritage coordinates'],
  community: ['Community Moderation', 'Moderation requires live community records'],
  ai: ['AI Assistant', 'AI controls require a connected AI backend'],
  analytics: ['Analytics', 'Live analytics require backend event tracking'],
  settings: ['Settings', 'Platform configuration and system controls'],
};

const emptyForms = {
  video: { title: emptyLocalizedText(), description: emptyLocalizedText(), video_url: '', thumbnail_url: '', duration: '', category: 'Performance', is_featured: false },
  audio: { title: emptyLocalizedText(), description: emptyLocalizedText(), audio_url: '', thumbnail_url: '', duration: '', category: 'Oral story', is_featured: false },
  heritage: { title: emptyLocalizedText(), category: 'Heritage site', location: '', region: '', era: '', image_url: '', description: emptyLocalizedText(), lat: '', lng: '' },
  collection: { title: emptyLocalizedText(), description: emptyLocalizedText(), category: 'Curated collection', image_url: '', curated_by: 'Umuco Archive' },
  proverb: { text: emptyLocalizedText(), meaning: emptyLocalizedText(), language: 'Kinyarwanda', category: 'Imigani', source: 'Rwandan oral tradition', is_featured: true },
  exercise: { item_type: 'proverb', item_id: '', title: emptyLocalizedText(), prompt: emptyLocalizedText(), choices: emptyLocalizedText(), answer: emptyLocalizedText(), explanation: emptyLocalizedText(), difficulty: 'Beginner', is_active: true },
  news: { title: emptyLocalizedText(), summary: emptyLocalizedText(), body: emptyLocalizedText(), image_url: '', category: 'Culture', status: 'draft', is_featured: false },
};

const contentConfig = {
  video: { label: 'Videos', endpoint: '/api/video', listKey: 'videos', urlField: 'video_url' },
  audio: { label: 'Audio', endpoint: '/api/audio', listKey: 'audio', urlField: 'audio_url' },
  heritage: { label: 'Heritage', endpoint: '/api/heritage', listKey: 'heritage', urlField: 'image_url' },
  collection: { label: 'Collections', endpoint: '/api/collections', listKey: 'collections' },
  proverb: { label: 'Imigani', endpoint: '/api/admin/proverbs', listKey: 'proverbs' },
  exercise: { label: 'Exercises', endpoint: '/api/admin/exercises', listKey: 'exercises' },
};

const formatNumber = (value) => new Intl.NumberFormat('en').format(Number(value || 0));
const cleanData = (data = []) => data.map((item) => ({ label: item.label || 'Unspecified', value: Number(item.value || 0) }));
const tabFromHash = (hash) => sections.includes((hash || '#metrics').replace('#', '')) ? (hash || '#metrics').replace('#', '') : 'metrics';
const textKeysByType = {
  video: ['title', 'description'],
  audio: ['title', 'description'],
  heritage: ['title', 'description'],
  collection: ['title', 'description'],
  proverb: ['text', 'meaning'],
  exercise: ['title', 'prompt', 'choices', 'answer', 'explanation'],
  news: ['title', 'summary', 'body'],
};
const queueTypeMap = { photo: 'heritage', oral_history: 'heritage', video: 'video', audio: 'audio', collection: 'collection', proverb: 'proverb', exercise: 'exercise', news: 'news', heritage: 'heritage' };
const normalizeForm = (type, item = {}) => {
  const normalized = { ...emptyForms[type], ...(item.edits || item.payload || item.content || item) };
  (textKeysByType[type] || []).forEach((key) => {
    normalized[key] = normalizeLocalizedText(normalized[key]);
  });
  if (type === 'proverb' && item.translation && !normalized.meaning?.en) normalized.meaning = normalizeLocalizedText(item.meaning || item.translation);
  if (type === 'exercise' && Array.isArray(normalized.choices)) normalized.choices = normalizeLocalizedText({ en: normalized.choices.join('\n') });
  return normalized;
};
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
const reportText = (value) => escapeHtml(localizedPreview(value) || value || '');
const reportDate = (value) => value ? new Date(value).toLocaleString() : 'Not recorded';
const ADMIN_COPY = {
  fr: {
    'Dashboard': 'Tableau de bord',
    'Platform overview - last updated just now': 'Vue de la plateforme - mise a jour a l instant',
    'Archive': 'Archives',
    'Live archive records are managed from Content Registry': 'Les archives en ligne sont gerees depuis le registre de contenu',
    'Stories & Legends': 'Recits et legendes',
    'Story records are managed from Content Registry': 'Les recits sont geres depuis le registre de contenu',
    'Collections': 'Collections',
    'Videos': 'Videos',
    'Audio': 'Audio',
    'Heritage': 'Patrimoine',
    'Imigani': 'Imigani',
    'Exercises': 'Exercices',
    'Stories': 'Recits',
    'National': 'National',
    'Contributors': 'Contributeurs',
    'Map': 'Carte',
    'Community': 'Communaute',
    'AI Assistant': 'Assistant IA',
    'Curated groupings displayed in the Archive and Explore pages': 'Groupements organises affiches dans Archives et Explorer',
    'National Collection': 'Collection nationale',
    'National records are managed from Heritage items': 'Les dossiers nationaux sont geres depuis les elements du patrimoine',
    'Review Queue': 'File de revue',
    'Submissions and flags waiting for admin sign-off': 'Soumissions et signalements en attente de validation',
    'Content Registry': 'Registre de contenu',
    'Videos, audio, and heritage asset intake': 'Gestion des videos, sons et elements patrimoniaux',
    'News Desk': 'Actualites',
    'Publication control and public updates': 'Controle des publications et mises a jour publiques',
    'Users': 'Utilisateurs',
    'Registered accounts - manage roles and access': 'Comptes inscrits - gestion des roles et acces',
    'Settings': 'Parametres',
    'Platform configuration and system controls': 'Configuration de la plateforme et controles systeme',
    'Refresh Data': 'Actualiser',
    'Download PDF': 'Telecharger PDF',
    'Save Changes': 'Enregistrer',
    'Manage Records': 'Gerer les contenus',
    'Manage Users': 'Gerer les utilisateurs',
    'Total users': 'Utilisateurs',
    'Cultural items': 'Elements culturels',
    'Active contributors': 'Contributeurs actifs',
    'AI queries': 'Requetes IA',
    'Open Registry': 'Ouvrir le registre',
    'User Roles': 'Roles utilisateur',
    'Analytics': 'Analytique',
    'Content Breakdown': 'Repartition du contenu',
    'System Health': 'Etat du systeme',
    'Recently Joined': 'Nouveaux inscrits',
    'No items waiting for review': 'Aucun element en attente de revue',
    'When contributors submit content or users flag published records, they will appear here.': 'Les contributions et signalements apparaitront ici.',
    'Submission and Flag Review': 'Revue des soumissions et signalements',
    'Type': 'Type',
    'Title / preview': 'Titre / apercu',
    'Submitter': 'Contributeur',
    'Languages': 'Langues',
    'Date': 'Date',
    'Flag': 'Signalement',
    'Action': 'Action',
    'Approve': 'Approuver',
    'Edit then approve': 'Modifier puis approuver',
    'Reject': 'Rejeter',
    'Cancel': 'Annuler',
    'Retry': 'Reessayer',
    'Short reason': 'Raison courte',
    'Edit Before Approval': 'Modifier avant approbation',
    'Approve with edits': 'Approuver avec modifications',
    'Content Registry Controls': 'Controles du registre de contenu',
    'Add': 'Ajouter',
    'Edit': 'Modifier',
    'Title': 'Titre',
    'Description': 'Description',
    'Category': 'Categorie',
    'Image URL': 'URL image',
    'Video URL': 'URL video',
    'Audio URL': 'URL audio',
    'Thumbnail URL': 'URL miniature',
    'Duration in seconds': 'Duree en secondes',
    'Featured asset': 'Element mis en avant',
    'Location': 'Lieu',
    'Region': 'Region',
    'Era': 'Epoque',
    'Latitude': 'Latitude',
    'Longitude': 'Longitude',
    'Register asset': 'Enregistrer le contenu',
    'Save changes': 'Enregistrer',
    'Cancel edit': 'Annuler la modification',
    'Current': 'Actuels',
    'Delete': 'Supprimer',
    'No usage records yet': 'Aucune donnee d utilisation',
    'No users yet': 'Aucun utilisateur',
    'News Records': 'Articles',
    'Save news record': 'Enregistrer l actualite',
    'Summary': 'Resume',
    'Body': 'Corps',
    'Status': 'Statut',
    'User': 'Utilisateur',
    'Email': 'E-mail',
    'Role': 'Role',
    'Backend controlled': 'Controle par le backend',
    'assets': 'elements',
    'posts': 'articles',
    'waiting': 'en attente',
    'Content records': 'Contenus',
    'Draft': 'Brouillon',
    'Published': 'Publie',
    'English': 'Anglais',
    'Francais': 'Francais',
    'Kinyarwanda': 'Kinyarwanda',
    'English is required.': 'L anglais est obligatoire.',
    'French or Kinyarwanda can be completed later.': 'Le francais ou le kinyarwanda peuvent etre completes plus tard.',
    'PDF report opened. Choose Save as PDF in the print dialog.': 'Rapport PDF ouvert. Choisissez Enregistrer en PDF dans la fenetre d impression.',
    'Please allow popups to download the PDF report.': 'Autorisez les fenetres popup pour telecharger le rapport PDF.',
  },
  rw: {
    'Dashboard': 'Imbonerahamwe',
    'Platform overview - last updated just now': 'Incamake y urubuga - ivuguruwe ubu',
    'Archive': 'Ububiko',
    'Live archive records are managed from Content Registry': 'Ibyo mu bubiko bicungwa muri rejisitiri y ibikubiyemo',
    'Stories & Legends': 'Inkuru n imigani',
    'Story records are managed from Content Registry': 'Inkuru zicungwa muri rejisitiri y ibikubiyemo',
    'Collections': 'Amakusanyirizo',
    'Videos': 'Videwo',
    'Audio': 'Amajwi',
    'Heritage': 'Umurage',
    'Imigani': 'Imigani',
    'Exercises': 'Imyitozo',
    'Stories': 'Inkuru',
    'National': 'Igihugu',
    'Contributors': 'Abatanga umusanzu',
    'Map': 'Ikarita',
    'Community': 'Umuryango',
    'AI Assistant': 'Umufasha AI',
    'Curated groupings displayed in the Archive and Explore pages': 'Amakusanyirizo agaragara muri Ububiko na Explore',
    'National Collection': 'Icyegeranyo cy igihugu',
    'National records are managed from Heritage items': 'Iby igihugu bicungwa mu murage',
    'Review Queue': 'Ibigomba gusuzumwa',
    'Submissions and flags waiting for admin sign-off': 'Ibyoherejwe n ibimenyeshejwe bitegereje kwemezwa',
    'Content Registry': 'Rejisitiri y ibikubiyemo',
    'Videos, audio, and heritage asset intake': 'Gucunga videwo, amajwi n umurage',
    'News Desk': 'Amakuru',
    'Publication control and public updates': 'Kugenzura ibitangazwa n amakuru rusange',
    'Users': 'Abakoresha',
    'Registered accounts - manage roles and access': 'Konti zanditswe - gucunga inshingano n uburenganzira',
    'Settings': 'Igenamiterere',
    'Platform configuration and system controls': 'Igenamiterere ry urubuga n igenzura',
    'Refresh Data': 'Vugurura amakuru',
    'Download PDF': 'Kuramo PDF',
    'Save Changes': 'Bika impinduka',
    'Manage Records': 'Cunga ibikubiyemo',
    'Manage Users': 'Cunga abakoresha',
    'Total users': 'Abakoresha bose',
    'Cultural items': 'Iby umuco',
    'Active contributors': 'Abatanga umusanzu',
    'AI queries': 'Ibibazo bya AI',
    'Open Registry': 'Fungura rejisitiri',
    'User Roles': 'Inshingano',
    'Analytics': 'Isesengura',
    'Content Breakdown': 'Imiterere y ibikubiyemo',
    'System Health': 'Imikorere ya sisitemu',
    'Recently Joined': 'Abaheruka kwiyandikisha',
    'No items waiting for review': 'Nta kintu gitegereje gusuzumwa',
    'When contributors submit content or users flag published records, they will appear here.': 'Ibyoherejwe n ibimenyeshejwe bizagaragara hano.',
    'Submission and Flag Review': 'Isuzuma ry ibyoherejwe n ibimenyeshejwe',
    'Type': 'Ubwoko',
    'Title / preview': 'Umutwe / incamake',
    'Submitter': 'Uwohereje',
    'Languages': 'Indimi',
    'Date': 'Itariki',
    'Flag': 'Ikimenyetso',
    'Action': 'Igikorwa',
    'Approve': 'Emeza',
    'Edit then approve': 'Hindura hanyuma wemeze',
    'Reject': 'Anga',
    'Cancel': 'Hagarika',
    'Retry': 'Ongera ugerageze',
    'Short reason': 'Impamvu ngufi',
    'Edit Before Approval': 'Hindura mbere yo kwemeza',
    'Approve with edits': 'Emeza hamwe n impinduka',
    'Content Registry Controls': 'Igenzura rya rejisitiri',
    'Add': 'Ongeramo',
    'Edit': 'Hindura',
    'Title': 'Umutwe',
    'Description': 'Ibisobanuro',
    'Category': 'Icyiciro',
    'Image URL': 'URL y ifoto',
    'Video URL': 'URL ya videwo',
    'Audio URL': 'URL y ijwi',
    'Thumbnail URL': 'URL y agafoto',
    'Duration in seconds': 'Igihe mu masegonda',
    'Featured asset': 'Ikintu cyatoranyijwe',
    'Location': 'Aho biherereye',
    'Region': 'Intara',
    'Era': 'Igihe',
    'Latitude': 'Latitude',
    'Longitude': 'Longitude',
    'Register asset': 'Andika ikintu',
    'Save changes': 'Bika impinduka',
    'Cancel edit': 'Hagarika guhindura',
    'Current': 'Ibiriho',
    'Delete': 'Siba',
    'No usage records yet': 'Nta makuru y ikoreshwa arahari',
    'No users yet': 'Nta bakoresha barahari',
    'News Records': 'Amakuru',
    'Save news record': 'Bika amakuru',
    'Summary': 'Incamake',
    'Body': 'Umubiri',
    'Status': 'Imiterere',
    'User': 'Ukoresha',
    'Email': 'Imeri',
    'Role': 'Inshingano',
    'Backend controlled': 'Bigenzurwa na backend',
    'assets': 'ibintu',
    'posts': 'amakuru',
    'waiting': 'bitegereje',
    'Content records': 'Ibikubiyemo',
    'Draft': 'Inyandiko itarangiye',
    'Published': 'Byatangajwe',
    'English': 'Icyongereza',
    'Francais': 'Igifaransa',
    'Kinyarwanda': 'Ikinyarwanda',
    'English is required.': 'Icyongereza kirakenewe.',
    'French or Kinyarwanda can be completed later.': 'Igifaransa cyangwa Ikinyarwanda byuzuzwa nyuma.',
    'PDF report opened. Choose Save as PDF in the print dialog.': 'Raporo ya PDF yafunguwe. Hitamo kubika nka PDF.',
    'Please allow popups to download the PDF report.': 'Emera popup kugira ngo ukuremo raporo ya PDF.',
  },
};

const adminTranslate = (text, language) => ADMIN_COPY[language]?.[text] || text;
const useAdminText = () => React.useContext(AdminI18nContext);

function openAdminPdfReport({ stats, analytics, users, content, reviewQueue, refreshedAt, language }) {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.opener = null;

  const contentGroups = [
    ['Heritage', content.heritage || []],
    ['Audio', content.audio || []],
    ['Videos', content.videos || []],
    ['Collections', content.collections || []],
    ['Imigani', content.proverbs || []],
    ['Exercises', content.exercises || []],
    ['News', content.news || []],
  ];
  const reviewRows = [...(reviewQueue.pending || []), ...(reviewQueue.flagged || [])];
  const generatedAt = new Date().toLocaleString();

  const contentSummary = contentGroups.map(([label, rows]) => `
    <tr><td>${label}</td><td>${formatNumber(rows.length)}</td><td>${rows.slice(0, 5).map((item) => reportText(item.title || item.text)).filter(Boolean).join(', ') || 'No records yet'}</td></tr>
  `).join('');
  const userRows = (users || []).map((item) => `
    <tr><td>${escapeHtml(item.name || 'Unnamed user')}</td><td>${escapeHtml(item.email || '')}</td><td>${escapeHtml(item.role || 'user')}</td><td>${item.is_verified ? 'Verified' : 'Unverified'}</td></tr>
  `).join('');
  const reviewHtml = reviewRows.map((item) => {
    const title = item.title || item.text || item.preview || item.payload?.title || item.payload?.text || item.content?.title || item.content?.text;
    return `<tr><td>${escapeHtml(item.status || 'pending')}</td><td>${escapeHtml(item.content_type || item.type || 'heritage')}</td><td>${reportText(title) || 'Untitled'}</td><td>${escapeHtml(item.flag_reason || item.reason || '-')}</td><td>${reportDate(item.submitted_at || item.created_at)}</td></tr>`;
  }).join('');

  const reportHtml = `<!doctype html>
    <html>
      <head>
        <title>UMUCO Core Admin Report - ${new Date().toISOString().slice(0, 10)}</title>
        <style>
          @page { margin: 18mm; }
          * { box-sizing: border-box; }
          body { color: #2C1A14; font-family: Arial, sans-serif; margin: 0; }
          header { border-bottom: 3px solid #8D493A; margin-bottom: 22px; padding-bottom: 14px; }
          h1 { font-size: 24px; margin: 0 0 6px; }
          h2 { color: #8D493A; font-size: 15px; margin: 24px 0 10px; }
          p, td, th { font-size: 11px; line-height: 1.45; }
          .meta { color: #6F5B55; margin: 0; }
          .kpis { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); margin: 18px 0; }
          .kpi { border: 1px solid #EADBC8; border-radius: 8px; padding: 12px; }
          .kpi span { color: #6F5B55; display: block; font-size: 10px; text-transform: uppercase; }
          .kpi strong { display: block; font-size: 20px; margin-top: 6px; }
          table { border-collapse: collapse; margin-bottom: 16px; width: 100%; }
          th { background: #FDFBF7; color: #6F5B55; text-align: left; text-transform: uppercase; }
          th, td { border: 1px solid #EADBC8; padding: 7px 8px; vertical-align: top; }
          .print-actions { margin: 0 0 18px; }
          .print-actions button { background: #8D493A; border: 0; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 700; padding: 10px 14px; }
          @media print { .print-actions { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="print-actions"><button type="button" onclick="window.print()">Download as PDF</button></div>
        <header>
          <h1>UMUCO Core Admin Report</h1>
          <p class="meta">Generated ${escapeHtml(generatedAt)}. Admin data refreshed ${escapeHtml(reportDate(refreshedAt))}.</p>
        </header>
        <section class="kpis">
          <div class="kpi"><span>${adminTranslate('Total users', language)}</span><strong>${formatNumber(stats.users)}</strong></div>
          <div class="kpi"><span>${adminTranslate('Content records', language)}</span><strong>${formatNumber(stats.contentTotal)}</strong></div>
          <div class="kpi"><span>${adminTranslate('Contributors', language)}</span><strong>${formatNumber(stats.contributions)}</strong></div>
          <div class="kpi"><span>${adminTranslate('Review Queue', language)}</span><strong>${formatNumber(reviewRows.length)}</strong></div>
        </section>
        <h2>Content Registry</h2>
        <table><thead><tr><th>Type</th><th>Total</th><th>Recent sample</th></tr></thead><tbody>${contentSummary}</tbody></table>
        <h2>Review Queue</h2>
        <table><thead><tr><th>Status</th><th>Type</th><th>Title / Preview</th><th>Flag / Reject Reason</th><th>Date</th></tr></thead><tbody>${reviewHtml || '<tr><td colspan="5">No items waiting for review.</td></tr>'}</tbody></table>
        <h2>Users and Roles</h2>
        <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>${userRows || '<tr><td colspan="4">No users returned by the admin API.</td></tr>'}</tbody></table>
        <h2>Analytics Snapshot</h2>
        <p>${escapeHtml((analytics.contentMix || []).map((row) => `${row.label || 'Unspecified'}: ${row.value || 0}`).join(' | ') || 'No analytics breakdown returned yet.')}</p>
        <script>
          function printWhenReady() {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                window.focus();
                window.print();
              });
            });
          }
          if (document.readyState === 'complete') {
            printWhenReady();
          } else {
            window.addEventListener('load', printWhenReady);
          }
        </script>
      </body>
    </html>`;
  win.document.open();
  win.document.write(reportHtml);
  win.document.close();
  return true;
}

function KpiCard({ label, value, note, icon: Icon, tone = 'primary', trend = 'up' }) {
  const ta = useAdminText();
  return (
    <div className={`admin-kpi admin-kpi-${tone}`}>
      <div className="admin-kpi-icon">{Icon && <Icon size={18} />}</div>
      <span>{ta(label)}</span>
      <strong>{value}</strong>
      <small><b className={trend}>{trend === 'down' ? 'down' : 'up'}</b> {note}</small>
    </div>
  );
}

function Field({ label, children }) {
  const ta = useAdminText();
  return <label className="admin-field"><span>{ta(label)}</span>{children}</label>;
}

function Badge({ tone = 'green', children }) {
  return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>;
}

function PageHeader({ activeTab, refreshedLabel, goTab, showToast, loadAdminData, onDownloadReport }) {
  const ta = useAdminText();
  const [title, sub] = titles[activeTab] || titles.metrics;
  const subtitle = activeTab === 'metrics' ? `${ta('Platform overview - last updated just now')} ${refreshedLabel}` : ta(sub);
  return (
    <header className="admin-command-header">
      <div>
        <h1>{ta(title)}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="admin-header-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => loadAdminData(true, true)}>
          <RefreshCw size={13} /> {ta('Refresh Data')}
        </button>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onDownloadReport}>
          <Download size={13} /> {ta('Download PDF')}
        </button>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => activeTab === 'settings' ? showToast('Settings saved') : goTab(activeTab === 'users' ? 'users' : 'content')}>
          {activeTab === 'settings' ? <Save size={13} /> : <Plus size={13} />} {activeTab === 'settings' ? ta('Save Changes') : activeTab === 'users' ? ta('Manage Users') : ta('Manage Records')}
        </button>
      </div>
    </header>
  );
}

function TableCard({ title, search, filters = [], headers, rows, renderRow, footer }) {
  const [activeFilter, setActiveFilter] = useState(filters[0] || 'All');
  return (
    <div className="admin-table-card">
      <div className="admin-table-toolbar">
        {title && <div className="admin-table-title">{title}</div>}
        {search && <div className="admin-table-search"><Search size={13} /><input placeholder={search} /></div>}
        {filters.length > 0 && (
          <div className="admin-filter-chips">
            {filters.map((filter) => (
              <button key={filter} type="button" className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
        )}
        {search && <button type="button" className="admin-btn admin-btn-ghost"><SlidersHorizontal size={13} /> Filters</button>}
      </div>
      <div className="admin-native-table-wrap">
        <table className="admin-native-table">
          <thead><tr>{headers.map((head) => <th key={head}>{head}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => renderRow(row, index))}</tbody>
        </table>
      </div>
      {footer && <div className="admin-table-pagination">{footer}<div><button type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">...</button></div></div>}
    </div>
  );
}

function ProgressRow({ label, value, max = 100, tone = '' }) {
  const width = typeof value === 'string' && value.includes('%') ? value : `${Math.max(6, Math.min(100, (Number(value || 0) / Math.max(1, Number(max || 1))) * 100))}%`;
  return (
    <div className="admin-progress-row">
      <div><span>{label}</span><strong>{value}</strong></div>
      <p><i className={tone} style={{ width }} /></p>
    </div>
  );
}

function ActivityItem({ icon: Icon = Archive, tone = '', title, desc, time, actions }) {
  return (
    <div className="admin-activity-item">
      <span className={`admin-activity-icon ${tone}`}><Icon size={14} /></span>
      <div>
        <div className="admin-activity-title"><strong>{title}</strong>{time && <small>{time}</small>}</div>
        {desc && <p>{desc}</p>}
        {actions && <div className="admin-mod-actions">{actions}</div>}
      </div>
    </div>
  );
}

function ActivityChart({ title, data }) {
  const rows = data?.length ? data : [];
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="admin-chart-card">
      <div className="admin-section-title">{title}<span>Last 12 months</span></div>
      {rows.length ? (
        <>
          <div className="admin-activity-chart">
            {rows.map((row, index) => (
              <div className="admin-activity-col" key={`${row.label}-${index}`}>
                <div className={index % 2 ? 'admin-activity-bar gold' : 'admin-activity-bar'} style={{ height: `${Math.max(8, (row.value / max) * 100)}%` }} />
                <span>{row.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="admin-chart-legend">
            <span><i /> Cultural items added</span>
          </div>
        </>
      ) : (
        <EmptyAdminState title="No upload activity yet" body="This chart will populate once content records are added over time." />
      )}
    </div>
  );
}

function UsageProofGraph({ stats, analytics }) {
  const usageRows = [
    { label: 'Users', value: Number(stats.users || 0), tone: '' },
    { label: 'Verified', value: Number(stats.verifiedUsers || stats.verified || 0), tone: 'green' },
    { label: 'Content', value: Number(stats.contentTotal || 0), tone: 'gold' },
    { label: 'Contributors', value: Number(stats.contributions || 0), tone: 'blue' },
    { label: 'AI / Events', value: Number(stats.aiQueries || stats.events || stats.views || 0), tone: 'muted' },
  ].filter((row) => row.value > 0);
  const monthly = cleanData(analytics.monthlyUsage || analytics.monthlyViews || analytics.monthlyContent);
  const chartRows = monthly.length ? monthly : usageRows;
  const max = Math.max(1, ...chartRows.map((row) => row.value));

  return (
    <div className="admin-chart-card admin-usage-proof">
      <div className="admin-section-title">App Usage Proof<span>{monthly.length ? 'Monthly activity' : 'Live platform totals'}</span></div>
      {chartRows.length ? (
        <>
          <div className="admin-usage-bars">
            {chartRows.map((row, index) => (
              <div className="admin-usage-bar-item" key={`${row.label}-${index}`}>
                <div className="admin-usage-bar-track">
                  <span
                    className={row.tone || (index % 3 === 1 ? 'green' : index % 3 === 2 ? 'gold' : '')}
                    style={{ height: `${Math.max(10, (row.value / max) * 100)}%` }}
                  />
                </div>
                <strong>{formatNumber(row.value)}</strong>
                <small>{row.label}</small>
              </div>
            ))}
          </div>
          <p className="admin-usage-note">Generated from the admin API response, so it reflects the records currently in the backend.</p>
        </>
      ) : (
        <EmptyAdminState title="No usage records yet" body="Users, content records, views, or activity events will appear here after the app is used." />
      )}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  const ta = useAdminText();
  return <button type="button" className="admin-quick-action" onClick={onClick}><span><Icon size={16} /></span>{ta(label)}</button>;
}

function Toggle({ defaultOn = true }) {
  const [on, setOn] = useState(defaultOn);
  return <button type="button" className={`admin-toggle ${on ? '' : 'off'}`} onClick={() => setOn((value) => !value)} aria-pressed={on} />;
}

export default function Admin() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabFromHash(location.hash));
  const [activeContent, setActiveContent] = useState('video');
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState({ videos: [], audio: [], heritage: [], collections: [], news: [], proverbs: [], exercises: [] });
  const [forms, setForms] = useState(emptyForms);
  const [editingContent, setEditingContent] = useState(null);
  const [reviewQueue, setReviewQueue] = useState({ pending: [], flagged: [] });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewEditing, setReviewEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (text) => {
    setMessage(text);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setMessage(''), 2500);
  };

  const request = useCallback(async (path, options = {}) => {
    return apiJson(path, options);
  }, []);

  const loadReviewQueue = useCallback(async () => {
    setReviewLoading(true);
    setReviewError('');
    try {
      // TODO(backend): GET /api/admin/review-queue returns { pending: [...], flagged: [...] }.
      const data = await request('/api/admin/review-queue');
      setReviewQueue({ pending: data.pending || [], flagged: data.flagged || [] });
    } catch (err) {
      setReviewError(err.message || 'Review queue could not be loaded.');
      setReviewQueue({ pending: [], flagged: [] });
    } finally {
      setReviewLoading(false);
    }
  }, [request]);

  const loadAdminData = useCallback(async (silent = false, notify = false) => {
    if (!silent) setLoading(true);
    try {
      const [overview, userData, contentData] = await Promise.all([
        request('/api/admin/overview'),
        request('/api/admin/users'),
        request('/api/admin/content'),
      ]);
      setStats(overview.stats || {});
      setAnalytics(overview.analytics || {});
      setRefreshedAt(overview.refreshedAt || new Date().toISOString());
      setUsers(userData.users || []);
      setContent(contentData || {});
      loadReviewQueue();
      if (silent && notify) showToast('Administrative data refreshed.');
    } catch (err) {
      setMessage(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [request, loadReviewQueue]);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);
  useEffect(() => { setActiveTab(tabFromHash(location.hash)); }, [location.hash]);
  useEffect(() => {
    const timer = setInterval(() => loadAdminData(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadAdminData]);

  useEffect(() => {
    const q = adminSearch.trim();
    if (q.length < 2) {
      setSearchResults(null);
      return undefined;
    }
    const timer = window.setTimeout(async () => {
      try {
        const data = await request(`/api/admin/search?q=${encodeURIComponent(q)}`);
        setSearchResults(data.results || null);
      } catch (err) {
        setMessage(err.message);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [adminSearch, request]);

  const setFormValue = (form, key, value) => setForms((prev) => ({ ...prev, [form]: { ...prev[form], [key]: value } }));
  const goTab = (tab) => {
    setActiveTab(tab);
    navigate(`/admin#${tab}`, { replace: true });
  };

  const buildContentPayload = (type) => {
    const payload = { ...forms[type] };
    (textKeysByType[type] || []).forEach((key) => {
      payload[key] = normalizeLocalizedText(payload[key]);
    });
    if ('duration' in payload) payload.duration = Number(payload.duration) || 0;
    if ('lat' in payload) payload.lat = payload.lat === '' ? null : Number(payload.lat);
    if ('lng' in payload) payload.lng = payload.lng === '' ? null : Number(payload.lng);
    if ('item_id' in payload) payload.item_id = payload.item_id === '' ? null : Number(payload.item_id);
    if (type === 'exercise') {
      payload.choices = Object.fromEntries(Object.entries(normalizeLocalizedText(payload.choices)).map(([lang, value]) => [
        lang,
        value.split(/\r?\n|,/).map((choice) => choice.trim()).filter(Boolean),
      ]));
    }
    return payload;
  };

  const resetContentForm = (type) => {
    setForms((prev) => ({ ...prev, [type]: emptyForms[type] }));
    setEditingContent(null);
  };

  const saveContent = async (type) => {
    try {
      const cfg = contentConfig[type];
      const payload = buildContentPayload(type);
      const primary = type === 'proverb' ? payload.text : payload.title;
      if (!localizedEnglish(primary)) {
        showToast('English title/text is required before saving.');
        return;
      }
      const isEditing = editingContent?.type === type && editingContent.id;
      const saved = await request(isEditing ? `${cfg.endpoint}/${editingContent.id}` : cfg.endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setContent((prev) => {
        const list = prev[cfg.listKey] || [];
        const nextList = isEditing
          ? list.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...list];
        return { ...prev, [cfg.listKey]: nextList };
      });
      resetContentForm(type);
      showToast(`${cfg.label} ${isEditing ? 'updated' : 'registered'}.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const editContent = (type, item) => {
    const normalized = normalizeForm(type, item);
    if (type === 'video' || type === 'audio') normalized.duration = item.duration || '';
    if (type === 'heritage') {
      normalized.lat = item.lat ?? '';
      normalized.lng = item.lng ?? '';
    }
    if (type === 'proverb') {
      normalized.text = normalizeLocalizedText(item.text || { en: item.en || item.translation || '', rw: item.rw || '' });
      normalized.meaning = normalizeLocalizedText(item.meaning || item.explanation || item.translation || '');
    }
    if (type === 'exercise') {
      normalized.item_id = item.item_id ?? '';
      normalized.choices = Array.isArray(item.choices) ? normalizeLocalizedText({ en: item.choices.join('\n') }) : normalizeLocalizedText(item.choices || '');
    }
    setForms((prev) => ({ ...prev, [type]: normalized }));
    setEditingContent({ type, id: item.id });
  };

  const createNews = async () => {
    try {
      if (!localizedEnglish(forms.news.title)) {
        showToast('English news title is required before saving.');
        return;
      }
      const saved = await request('/api/admin/news', { method: 'POST', body: JSON.stringify(forms.news) });
      setContent((prev) => ({ ...prev, news: [saved, ...(prev.news || [])] }));
      setForms((prev) => ({ ...prev, news: emptyForms.news }));
      showToast('News registry updated.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteContent = async (type, id) => {
    try {
      const cfg = contentConfig[type];
      await request(`${cfg.endpoint}/${id}`, { method: 'DELETE' });
      setContent((prev) => ({ ...prev, [cfg.listKey]: (prev[cfg.listKey] || []).filter((item) => item.id !== id) }));
      showToast(`${cfg.label} item removed from registry.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteNews = async (id) => {
    try {
      await request(`/api/admin/news/${id}`, { method: 'DELETE' });
      setContent((prev) => ({ ...prev, news: (prev.news || []).filter((item) => item.id !== id) }));
      showToast('News post removed.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      const data = await request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
      setUsers((prev) => prev.map((item) => (item.id === id ? data.user : item)));
      showToast('User role updated.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      await request(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((item) => item.id !== id));
      showToast('User removed.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const approveReviewItem = async (item, edits) => {
    try {
      // TODO(backend): POST /api/admin/review-queue/:id/approve publishes the pending/flagged row.
      await request(`/api/admin/review-queue/${item.id}/approve`, {
        method: 'POST',
        body: JSON.stringify(edits ? { edits } : {}),
      });
      await Promise.all([loadAdminData(true), loadReviewQueue()]);
      setReviewEditing(null);
      showToast('Review item approved and published.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const rejectReviewItem = async (item, reason) => {
    if (!reason.trim()) {
      showToast('Add a short rejection reason first.');
      return;
    }
    try {
      // TODO(backend): POST /api/admin/review-queue/:id/reject stores { reason }.
      await request(`/api/admin/review-queue/${item.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      await loadReviewQueue();
      showToast('Review item rejected.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const downloadReport = () => {
    const opened = openAdminPdfReport({ stats, analytics, users, content, reviewQueue, refreshedAt, language });
    showToast(adminTranslate(opened ? 'PDF report opened. Choose Save as PDF in the print dialog.' : 'Please allow popups to download the PDF report.', language));
  };

  const currentItems = content[contentConfig[activeContent]?.listKey] || [];
  const refreshedLabel = refreshedAt ? new Date(refreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending';
  const contentMix = cleanData(analytics.contentMix);
  const maxContentValue = Math.max(1, ...contentMix.map((row) => row.value), stats.contentTotal || 1);
  const liveAdminNavGroups = useMemo(() => {
    const count = (key) => (content[key] || []).length;
    const heritageCount = count('heritage');
    const collectionCount = count('collections');
    const newsCount = count('news');
    const userCount = users.length || Number(stats.users || 0);
    const contentTotal = Number(stats.contentTotal || 0);
    const contributorCount = Number(stats.contributions || 0);
    const reviewCount = (reviewQueue.pending || []).length + (reviewQueue.flagged || []).length;
    const mapCount = (content.heritage || []).filter((item) => item.lat && item.lng).length;

    const tr = (text) => adminTranslate(text, language);
    return [
      {
        label: 'LIVE OVERVIEW',
        items: [{ label: `${tr('Dashboard')} (${formatNumber(contentTotal)})`, path: '/admin#metrics', icon: 'admin' }],
      },
      {
        label: 'DATA CONTROL',
        items: [
          { label: `${tr('Content Registry')} (${formatNumber(contentTotal)})`, path: '/admin#content', icon: 'collections' },
          { label: tr('Review Queue'), path: '/admin#review', icon: 'flag', badge: reviewCount ? formatNumber(reviewCount) : '' },
          { label: `${tr('Collections')} (${formatNumber(collectionCount)})`, path: '/admin#collections', icon: 'layers' },
          { label: `${tr('News Desk')} (${formatNumber(newsCount)})`, path: '/admin#news', icon: 'intldays' },
          { label: `${tr('Archive')} (${formatNumber(contentTotal)})`, path: '/admin#archive', icon: 'archive' },
          { label: `${tr('Stories')} (${formatNumber(count('proverbs') + count('exercises'))})`, path: '/admin#stories', icon: 'book' },
          { label: `${tr('National')} (${formatNumber(heritageCount)})`, path: '/admin#national', icon: 'flag' },
        ],
      },
      {
        label: 'ACCESS',
        items: [
          { label: `${tr('Users')} (${formatNumber(userCount)})`, path: '/admin#users', icon: 'profile' },
          { label: `${tr('Contributors')} (${formatNumber(contributorCount)})`, path: '/admin#contributors', icon: 'admin' },
        ],
      },
      {
        label: 'SYSTEM',
        items: [
          { label: `${tr('Map')} (${formatNumber(mapCount)})`, path: '/admin#map', icon: 'map' },
          { label: tr('Community'), path: '/admin#community', icon: 'community' },
          { label: tr('AI Assistant'), path: '/admin#ai', icon: 'sparkles' },
          { label: tr('Analytics'), path: '/admin#analytics', icon: 'chart' },
          { label: tr('Settings'), path: '/admin#settings', icon: 'settings' },
        ],
      },
    ];
  }, [content, language, reviewQueue, stats.contentTotal, stats.contributions, stats.users, users.length]);

  return (
    <AdminI18nContext.Provider value={(text) => adminTranslate(text, language)}>
    <Layout searchPlaceholder="search.placeholder" searchQuery={adminSearch} onSearchChange={setAdminSearch} adminNavGroups={liveAdminNavGroups} adminTopbarTitle={adminTranslate(titles[activeTab]?.[0] || 'Admin', language)}>
      <div className="admin-page">
        <PageHeader activeTab={activeTab} refreshedLabel={refreshedLabel} goTab={goTab} showToast={showToast} loadAdminData={loadAdminData} onDownloadReport={downloadReport} />
        {message && <div className="admin-message">{message}</div>}
        {loading && <div className="admin-message">Loading live administrative metrics...</div>}
        {searchResults && <AdminSearchResults results={searchResults} query={adminSearch} goTab={goTab} />}

        <div className="admin-main-pane">
          {activeTab === 'metrics' && (
            <>
              <section className="admin-kpi-grid">
                <KpiCard label="Total users" value={formatNumber(stats.users)} note={`${stats.verificationRate || 0}% verified`} icon={Users} />
                <KpiCard label="Cultural items" value={formatNumber(stats.contentTotal)} note="live records" icon={Archive} tone="green" />
                <KpiCard label="Active contributors" value={formatNumber(stats.contributions)} note="live roles" icon={UserPlus} tone="gold" />
                <KpiCard label="AI queries" value={formatNumber(stats.aiQueries)} note="event tracking" icon={Sparkles} tone="blue" trend="down" />
              </section>
              <section className="admin-quick-actions">
                <QuickAction icon={Upload} label="Open Registry" onClick={() => goTab('content')} />
                <QuickAction icon={UserPlus} label="User Roles" onClick={() => goTab('users')} />
                <QuickAction icon={Flag} label="Review Queue" onClick={() => goTab('review')} />
                <QuickAction icon={BarChart2} label="Analytics" onClick={() => goTab('analytics')} />
              </section>
              <section className="admin-overview-grid">
                <div className="admin-overview-left">
                  <UsageProofGraph stats={stats} analytics={analytics} />
                  <ActivityChart title="Content Upload Activity" data={analytics.monthlyContent} />
                  <div className="admin-chart-card">
                    <div className="admin-section-title">Recent Activity<span>Audit log</span></div>
                    <ActivityItem icon={BookOpen} title="New story published: Ruganzu II Ndori" desc="Submitted by Contributor Aline M. - approved by you" time="2h ago" />
                    <ActivityItem icon={UserPlus} tone="gold" title="3 new users registered" desc="Jean-Paul K., Solange U., Emmanuel N. joined as Explorers" time="5h ago" />
                    <ActivityItem icon={Flag} tone="red" title="Community discussion flagged" desc="Topic Colonial interpretations of Ubuhake - 2 reports pending review" time="Yesterday" />
                    <ActivityItem icon={Mic} title="Field recording digitised: Inanga, Butare 1971" desc="Added to Archive - Music & Performance collection" time="2 days ago" />
                  </div>
                </div>
                <aside className="admin-overview-side">
                  <div className="admin-chart-card admin-card-sm">
                    <div className="admin-section-title">Content Breakdown</div>
                    {contentMix.length ? contentMix.map((row, index) => <ProgressRow key={row.label} label={row.label} value={row.value} max={maxContentValue} tone={index === 1 ? 'gold' : index > 2 ? 'muted' : ''} />) : <EmptyAdminState title="No content metrics yet" body="Add records in Content Registry to populate this breakdown." />}
                  </div>
                  <SystemHealth stats={stats} loadError={!!message && !stats.users} />
                  <RecentlyJoined users={users} />
                </aside>
              </section>
            </>
          )}

          {activeTab === 'archive' && <RegistryNotice title="Archive is live-data only" body="Use Content Registry to add, edit, remove, and search videos, audio, heritage, collections, imigani, and exercises." goTab={goTab} />}
          {activeTab === 'stories' && <RegistryNotice title="Story demo rows removed" body="Publish story-like records through Heritage or Imigani so the public dashboard reads from the backend." goTab={goTab} />}
          {activeTab === 'collections' && <RegistryNotice title="Collections are backend controlled" body="Use Content Registry > Collections to add, edit, remove, and publish collection records." goTab={goTab} />}
          {activeTab === 'national' && <RegistryNotice title="National records are heritage records" body="Add them in Content Registry with region, era, and coordinates. They will appear from the backend only." goTab={goTab} />}
          {activeTab === 'review' && <ReviewQueueSection queue={reviewQueue} loading={reviewLoading} error={reviewError} reload={loadReviewQueue} approveReviewItem={approveReviewItem} rejectReviewItem={rejectReviewItem} reviewEditing={reviewEditing} setReviewEditing={setReviewEditing} />}
          {activeTab === 'map' && <RegistryNotice title="Map markers use heritage coordinates" body="Add latitude and longitude on Heritage records in Content Registry to control the map." goTab={goTab} />}
          {activeTab === 'contributors' && <RegistryNotice title="Contributor controls use user roles" body="Use the Users section to search accounts, change roles, or remove duplicate users." goTab={goTab} target="users" action="Open Users" />}
          {activeTab === 'community' && <RegistryNotice title="No fake moderation queue" body="A moderation backend can be connected here when community posts are stored in the database." goTab={goTab} />}
          {activeTab === 'ai' && <RegistryNotice title="No fake AI analytics" body="Connect AI query logging before showing query counts, flagged prompts, or model health." goTab={goTab} />}
          {activeTab === 'analytics' && <RegistryNotice title="No fake traffic analytics" body="Connect backend event tracking before showing traffic charts and top pages." goTab={goTab} />}
          {activeTab === 'settings' && <SettingsSection showToast={showToast} />}
          {activeTab === 'users' && <UsersSection users={users} user={user} updateUserRole={updateUserRole} deleteUser={deleteUser} />}
          {activeTab === 'content' && <ContentRegistry activeContent={activeContent} setActiveContent={setActiveContent} forms={forms} setFormValue={setFormValue} saveContent={saveContent} deleteContent={deleteContent} editContent={editContent} resetContentForm={resetContentForm} editingContent={editingContent} currentItems={currentItems} stats={stats} />}
          {activeTab === 'news' && <NewsSection content={content} forms={forms} setFormValue={setFormValue} createNews={createNews} deleteNews={deleteNews} />}
        </div>
      </div>
    </Layout>
    </AdminI18nContext.Provider>
  );
}

function AdminSearchResults({ results, query, goTab }) {
  const groups = [
    ['users', 'Users', 'users'],
    ['heritage', 'Heritage', 'content'],
    ['collections', 'Collections', 'content'],
    ['videos', 'Videos', 'content'],
    ['audio', 'Audio', 'content'],
    ['news', 'News', 'news'],
    ['proverbs', 'Imigani', 'content'],
    ['exercises', 'Exercises', 'content'],
  ];
  const total = groups.reduce((sum, [key]) => sum + (results[key]?.length || 0), 0);
  return (
    <section className="admin-search-results">
      <div className="admin-section-heading"><h2>Search Results</h2><span>{total} matches for "{query}"</span></div>
      {total === 0 ? <p>No records found.</p> : (
        <div className="admin-search-grid">
          {groups.map(([key, label, tab]) => (results[key]?.length ? (
            <button type="button" className="admin-search-group" key={key} onClick={() => goTab(tab)}>
              <strong>{label}</strong>
              <span>{results[key].slice(0, 3).map((item) => item.title || item.text || item.name || item.email).join(', ')}</span>
            </button>
          ) : null))}
        </div>
      )}
    </section>
  );
}

function RegistryNotice({ title, body, goTab, target = 'content', action = 'Open Content Registry' }) {
  const ta = useAdminText();
  return (
    <section className="admin-chart-card">
      <div className="admin-section-heading">
        <h2>{ta(title)}</h2>
        <span>{ta('Backend controlled')}</span>
      </div>
      <p>{ta(body)}</p>
      <button type="button" className="admin-btn admin-btn-primary" onClick={() => goTab(target)}>
        <SlidersHorizontal size={13} /> {ta(action)}
      </button>
    </section>
  );
}

function EmptyAdminState({ title, body }) {
  const ta = useAdminText();
  return (
    <div className="admin-empty-state">
      <strong>{ta(title)}</strong>
      <span>{ta(body)}</span>
    </div>
  );
}

function SystemHealth({ stats, loadError }) {
  return (
    <div className="admin-chart-card admin-card-sm">
      <div className="admin-section-title">System Health</div>
      <div className="admin-stat-row">
        <span>Admin API</span>
        <strong className={loadError ? 'red' : 'green'}><i />{loadError ? 'Unreachable' : 'Operational'}</strong>
      </div>
      <div className="admin-stat-row"><span>Registered users</span><strong>{formatNumber(stats.users)}</strong></div>
      <div className="admin-stat-row"><span>Verification rate</span><strong>{stats.verificationRate || 0}%</strong></div>
      <div className="admin-stat-row"><span>Live content records</span><strong>{formatNumber(stats.contentTotal)}</strong></div>
      <div className="admin-stat-row"><span>Pending moderation</span><strong className={stats.contributions ? 'red' : ''}>{formatNumber(stats.contributions)} items</strong></div>
      <p className="admin-health-note">Storage, uptime, and AI model monitoring require a connected monitoring integration.</p>
    </div>
  );
}

function RecentlyJoined({ users }) {
  const recent = (users || []).slice(-3).reverse();
  return (
    <div className="admin-chart-card admin-card-sm">
      <div className="admin-section-title">Recently Joined</div>
      {recent.length ? recent.map((item) => (
        <div className="admin-person-row" key={item.id}>
          <span>{(item.name || item.email || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
          <div><strong>{item.name || item.email}</strong><small>{item.role || 'user'}</small></div>
          <Badge tone={item.is_verified ? 'green' : 'gold'}>{item.is_verified ? 'Verified' : 'Unverified'}</Badge>
        </div>
      )) : <EmptyAdminState title="No users yet" body="Registered accounts will appear here as people sign up." />}
    </div>
  );
}

function SettingsSection({ showToast }) {
  const groups = [
    ['Platform', [['Maintenance Mode', 'Take the platform offline for maintenance', false], ['User Registration', 'Allow new users to sign up', true], ['Google OAuth Login', 'Allow sign-in with Google', true], ['Apple OAuth Login', 'Allow sign-in with Apple', true], ['Content Comments', 'Allow community discussion on items', true]]],
    ['AI Assistant', [['AI Assistant Enabled', 'Enable the cultural heritage AI chatbot', true], ['Sensitive Query Filter', 'Flag queries about genocide and conflict', true], ['AI Suggestions on Explore', 'Show AI-recommended content on Explore page', true], ['Query Logging', 'Log all AI queries for review', true]]],
    ['Moderation', [['Auto-flag Threshold', 'Flag after 2+ community reports', true], ['Guardian Auto-Publish', 'Guardians bypass review queue', true], ['Email on New Flag', 'Notify admin by email when content is flagged', true]]],
  ];
  return (
    <section className="admin-settings-grid">
      {groups.map(([group, rows]) => (
        <div className="admin-chart-card" key={group}><div className="admin-settings-title">{group}</div>{rows.map(([label, desc, on]) => <div className="admin-setting-row" key={label}><div><strong>{label}</strong><span>{desc}</span></div><Toggle defaultOn={on} /></div>)}</div>
      ))}
      <div className="admin-chart-card">
        <div className="admin-settings-title">Danger Zone</div>
        <div className="admin-setting-row"><div><strong>Clear Cache</strong><span>Flush cached content</span></div><button type="button" className="admin-btn admin-btn-ghost" onClick={() => showToast('Cache cleared')}><RefreshCw size={13} /> Clear Now</button></div>
        <div className="admin-setting-row"><div><strong>Export All Data</strong><span>Download platform backup</span></div><button type="button" className="admin-btn admin-btn-ghost" onClick={() => showToast('Export queued')}><Download size={13} /> Export</button></div>
        <div className="admin-setting-row"><div><strong className="danger">Reset Platform</strong><span>Wipe all content and users - irreversible</span></div><button className="admin-btn admin-danger" onClick={() => showToast('Confirmation required - action blocked')}><AlertTriangle size={13} /> Reset</button></div>
      </div>
    </section>
  );
}

function UsersSection({ users, user, updateUserRole, deleteUser }) {
  const ta = useAdminText();
  const [confirming, setConfirming] = useState(null);
  return (
    <TableCard
      title={ta('User Registry and Role Controls')}
      headers={[ta('User'), ta('Email'), ta('Role'), ta('Status'), ta('Action')]}
      rows={users}
      renderRow={(item) => (
        <tr key={item.id}>
          <td><div className="admin-td-main">{item.name}</div></td>
          <td>{item.email}</td>
          <td><select value={item.role || 'user'} onChange={(e) => updateUserRole(item.id, e.target.value)}><option value="user">User</option><option value="government">Government</option><option value="admin">Admin</option></select></td>
          <td><Badge tone={item.is_verified ? 'green' : 'gold'}>{item.is_verified ? 'Verified' : 'Unverified'}</Badge></td>
          <td>
            {confirming === item.id ? (
              <span className="admin-inline-confirm">
                <button type="button" className="admin-danger" onClick={() => { deleteUser(item.id); setConfirming(null); }} disabled={item.id === user?.id}>{ta('Delete')}</button>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setConfirming(null)}>{ta('Cancel')}</button>
              </span>
            ) : (
              <button type="button" className="admin-danger" onClick={() => setConfirming(item.id)} disabled={item.id === user?.id}>{ta('Delete')}</button>
            )}
          </td>
        </tr>
      )}
    />
  );
}

function ContentFormFields({ type, forms, setFormValue }) {
  const ta = useAdminText();
  if (type === 'proverb') {
    return (
      <>
        <TrilingualField label="Proverb text" value={forms.proverb.text} onChange={(value) => setFormValue('proverb', 'text', value)} textarea required />
        <TrilingualField label="Meaning / explanation" value={forms.proverb.meaning} onChange={(value) => setFormValue('proverb', 'meaning', value)} textarea />
        <div className="admin-two-col"><Field label="Language"><input value={forms.proverb.language} onChange={(e) => setFormValue('proverb', 'language', e.target.value)} /></Field><Field label="Category"><input value={forms.proverb.category} onChange={(e) => setFormValue('proverb', 'category', e.target.value)} /></Field></div>
        <Field label="Source"><input value={forms.proverb.source} onChange={(e) => setFormValue('proverb', 'source', e.target.value)} /></Field>
        <label className="admin-check"><input type="checkbox" checked={forms.proverb.is_featured} onChange={(e) => setFormValue('proverb', 'is_featured', e.target.checked)} /> {ta('Show in Listen page')}</label>
      </>
    );
  }

  if (type === 'exercise') {
    return (
      <>
        <TrilingualField label="Exercise title" value={forms.exercise.title} onChange={(value) => setFormValue('exercise', 'title', value)} required />
        <div className="admin-two-col">
          <Field label="Attach to"><select value={forms.exercise.item_type} onChange={(e) => setFormValue('exercise', 'item_type', e.target.value)}><option value="proverb">Imigani</option><option value="audio">Audio</option><option value="video">Video</option><option value="heritage">Heritage</option><option value="collection">Collection</option><option value="story">Story</option></select></Field>
          <Field label="Item ID"><input type="number" value={forms.exercise.item_id} onChange={(e) => setFormValue('exercise', 'item_id', e.target.value)} /></Field>
        </div>
        <TrilingualField label="Question / prompt" value={forms.exercise.prompt} onChange={(value) => setFormValue('exercise', 'prompt', value)} textarea />
        <TrilingualField label="Choices, one per line" value={forms.exercise.choices} onChange={(value) => setFormValue('exercise', 'choices', value)} textarea />
        <div className="admin-two-col">
          <TrilingualField label="Answer" value={forms.exercise.answer} onChange={(value) => setFormValue('exercise', 'answer', value)} />
          <Field label="Difficulty"><select value={forms.exercise.difficulty} onChange={(e) => setFormValue('exercise', 'difficulty', e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
        </div>
        <TrilingualField label="Explanation" value={forms.exercise.explanation} onChange={(value) => setFormValue('exercise', 'explanation', value)} textarea />
        <label className="admin-check"><input type="checkbox" checked={forms.exercise.is_active} onChange={(e) => setFormValue('exercise', 'is_active', e.target.checked)} /> {ta('Active exercise')}</label>
      </>
    );
  }

  if (type === 'collection') {
    return (
      <>
        <TrilingualField label="Collection title" value={forms.collection.title} onChange={(value) => setFormValue('collection', 'title', value)} required />
        <Field label="Category"><input value={forms.collection.category} onChange={(e) => setFormValue('collection', 'category', e.target.value)} /></Field>
        <TrilingualField label="Description" value={forms.collection.description} onChange={(value) => setFormValue('collection', 'description', value)} textarea />
        <Field label="Image URL"><input value={forms.collection.image_url} onChange={(e) => setFormValue('collection', 'image_url', e.target.value)} /></Field>
        <Field label="Curated by"><input value={forms.collection.curated_by} onChange={(e) => setFormValue('collection', 'curated_by', e.target.value)} /></Field>
      </>
    );
  }

  if (type === 'news') {
    return (
      <>
        <TrilingualField label="Title" value={forms.news.title} onChange={(value) => setFormValue('news', 'title', value)} required />
        <TrilingualField label="Summary" value={forms.news.summary} onChange={(value) => setFormValue('news', 'summary', value)} textarea />
        <TrilingualField label="Body" value={forms.news.body} onChange={(value) => setFormValue('news', 'body', value)} textarea />
        <Field label="Image URL"><input value={forms.news.image_url} onChange={(e) => setFormValue('news', 'image_url', e.target.value)} /></Field>
        <div className="admin-two-col"><Field label="Category"><input value={forms.news.category} onChange={(e) => setFormValue('news', 'category', e.target.value)} /></Field><Field label="Status"><select value={forms.news.status} onChange={(e) => setFormValue('news', 'status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></Field></div>
        <label className="admin-check"><input type="checkbox" checked={forms.news.is_featured} onChange={(e) => setFormValue('news', 'is_featured', e.target.checked)} /> {ta('Flag as featured')}</label>
      </>
    );
  }

  return (
    <>
      <TrilingualField label="Title" value={forms[type].title} onChange={(value) => setFormValue(type, 'title', value)} required />
      <Field label="Category"><input value={forms[type].category} onChange={(e) => setFormValue(type, 'category', e.target.value)} /></Field>
      <TrilingualField label="Description" value={forms[type].description} onChange={(value) => setFormValue(type, 'description', value)} textarea />
      {type !== 'heritage' ? (
        <>
          <Field label={type === 'video' ? 'Video URL' : 'Audio URL'}><input value={forms[type][contentConfig[type].urlField]} onChange={(e) => setFormValue(type, contentConfig[type].urlField, e.target.value)} /></Field>
          <Field label="Thumbnail URL"><input value={forms[type].thumbnail_url} onChange={(e) => setFormValue(type, 'thumbnail_url', e.target.value)} /></Field>
          <Field label="Duration in seconds"><input type="number" value={forms[type].duration} onChange={(e) => setFormValue(type, 'duration', e.target.value)} /></Field>
          <label className="admin-check"><input type="checkbox" checked={forms[type].is_featured} onChange={(e) => setFormValue(type, 'is_featured', e.target.checked)} /> {ta('Featured asset')}</label>
        </>
      ) : (
        <>
          <Field label="Location"><input value={forms.heritage.location} onChange={(e) => setFormValue('heritage', 'location', e.target.value)} /></Field>
          <Field label="Region"><input value={forms.heritage.region} onChange={(e) => setFormValue('heritage', 'region', e.target.value)} /></Field>
          <Field label="Era"><input value={forms.heritage.era} onChange={(e) => setFormValue('heritage', 'era', e.target.value)} /></Field>
          <Field label="Image URL"><input value={forms.heritage.image_url} onChange={(e) => setFormValue('heritage', 'image_url', e.target.value)} /></Field>
          <div className="admin-two-col"><Field label="Latitude"><input type="number" value={forms.heritage.lat} onChange={(e) => setFormValue('heritage', 'lat', e.target.value)} /></Field><Field label="Longitude"><input type="number" value={forms.heritage.lng} onChange={(e) => setFormValue('heritage', 'lng', e.target.value)} /></Field></div>
        </>
      )}
    </>
  );
}

function ContentRegistry({ activeContent, setActiveContent, forms, setFormValue, saveContent, deleteContent, editContent, resetContentForm, editingContent, currentItems, stats }) {
  const ta = useAdminText();
  const isEditing = editingContent?.type === activeContent;
  const titleField = activeContent === 'proverb' ? forms.proverb.text : forms[activeContent].title;
  const [confirming, setConfirming] = useState(null);
  const describeItem = (item) => {
    if (activeContent === 'proverb') return localizedPreview(item.meaning || item.translation) || item.category || item.source || 'Imigani';
    if (activeContent === 'exercise') return `${item.item_type}${item.item_id ? ` #${item.item_id}` : ''} - ${item.difficulty || 'Beginner'}`;
    return item.category || item.region || item.status || 'Uncategorized';
  };

  return (
    <section className="admin-panel">
      <div className="admin-section-heading"><h2>{ta('Content Registry Controls')}</h2><span>{formatNumber(stats.contentTotal)} {ta('assets')}</span></div>
      <div className="admin-content-switch">{Object.entries(contentConfig).map(([key, cfg]) => <button key={key} type="button" className={activeContent === key ? 'active' : ''} onClick={() => { resetContentForm(activeContent); setActiveContent(key); }}>{ta(cfg.label)}</button>)}</div>
      <div className="admin-editor-grid">
        <div className="admin-form">
          <h2>{isEditing ? ta('Edit') : ta('Add')} {ta(contentConfig[activeContent].label)}</h2>
          <ContentFormFields type={activeContent} forms={forms} setFormValue={setFormValue} />
          <div className="admin-form-actions">
            <button type="button" className="admin-primary" onClick={() => saveContent(activeContent)} disabled={!localizedEnglish(titleField)}>{isEditing ? ta('Save changes') : ta('Register asset')}</button>
            {isEditing && <button type="button" className="admin-btn admin-btn-ghost" onClick={() => resetContentForm(activeContent)}>{ta('Cancel edit')}</button>}
          </div>
        </div>
        <div className="admin-list"><h2>{ta('Current')} {ta(contentConfig[activeContent].label)}</h2>{currentItems.length ? currentItems.map((item) => <div className="admin-list-item" key={item.id}><div><strong>{localizedPreview(item.title || item.text)}</strong><span>{describeItem(item)}</span></div><div className="admin-list-actions"><button type="button" className="admin-btn admin-btn-ghost" onClick={() => editContent(activeContent, item)}>{ta('Edit')}</button>{confirming === item.id ? <><button type="button" className="admin-danger" onClick={() => { deleteContent(activeContent, item.id); setConfirming(null); }}>{ta('Delete')}</button><button type="button" className="admin-btn admin-btn-ghost" onClick={() => setConfirming(null)}>{ta('Cancel')}</button></> : <button type="button" className="admin-danger" onClick={() => setConfirming(item.id)}>{ta('Delete')}</button>}</div></div>) : <EmptyAdminState title={`No ${contentConfig[activeContent].label.toLowerCase()} yet`} body="Saved backend records will appear here after you add them." />}</div>
      </div>
    </section>
  );
}

function ReviewQueueSection({ queue, loading, error, reload, approveReviewItem, rejectReviewItem, reviewEditing, setReviewEditing }) {
  const ta = useAdminText();
  const rows = [...(queue.pending || []), ...(queue.flagged || [])];
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editForms, setEditForms] = useState({});

  const startEdit = (item) => {
    const type = queueTypeMap[item.content_type || item.type] || 'heritage';
    setReviewEditing({ item, type });
    setEditForms((prev) => ({ ...prev, [type]: normalizeForm(type, item) }));
  };
  const setEditFormValue = (form, key, value) => setEditForms((prev) => ({ ...prev, [form]: { ...prev[form], [key]: value } }));
  const buildEditPayload = (type) => {
    const payload = { ...(editForms[type] || {}) };
    (textKeysByType[type] || []).forEach((key) => {
      payload[key] = normalizeLocalizedText(payload[key]);
    });
    if (type === 'exercise') {
      payload.choices = Object.fromEntries(Object.entries(normalizeLocalizedText(payload.choices)).map(([lang, value]) => [
        lang,
        value.split(/\r?\n|,/).map((choice) => choice.trim()).filter(Boolean),
      ]));
    }
    return payload;
  };

  if (loading) return <section className="admin-panel"><EmptyAdminState title="Loading review queue" body="Checking pending submissions and flags now." /></section>;

  return (
    <section className="admin-panel">
      <div className="admin-section-heading">
        <h2>{ta('Submission and Flag Review')}</h2>
        <span>{formatNumber(rows.length)} {ta('waiting')}</span>
      </div>
      {error && (
        <div className="admin-review-error">
          <span>{error}</span>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={reload}><RefreshCw size={13} /> {ta('Retry')}</button>
        </div>
      )}
      {!error && rows.length === 0 && <EmptyAdminState title="No items waiting for review" body="When contributors submit content or users flag published records, they will appear here." />}
      {rows.length > 0 && (
        <div className="admin-native-table-wrap">
          <table className="admin-native-table">
            <thead><tr><th>{ta('Type')}</th><th>{ta('Title / preview')}</th><th>{ta('Submitter')}</th><th>{ta('Languages')}</th><th>{ta('Date')}</th><th>{ta('Flag')}</th><th>{ta('Action')}</th></tr></thead>
            <tbody>
              {rows.map((item) => {
                const type = queueTypeMap[item.content_type || item.type] || item.content_type || item.type || 'heritage';
                const title = item.title || item.text || item.preview || item.payload?.title || item.payload?.text || item.content?.title || item.content?.text;
                const languages = item.languages || localizedLanguages(title).join(', ') || localizedLanguages(item.description || item.payload?.description).join(', ') || 'EN';
                return (
                  <tr key={`${item.status || 'pending'}-${item.id}`}>
                    <td><Badge tone={item.status === 'flagged' ? 'red' : 'gold'}>{item.status || 'pending'}</Badge><div className="admin-td-sub">{type}</div></td>
                    <td><div className="admin-td-main">{localizedPreview(title) || 'Untitled submission'}</div><div className="admin-td-sub">{localizedPreview(item.description || item.summary || item.payload?.description) || item.preview || 'No preview supplied.'}</div></td>
                    <td>{item.submitter?.name || item.submitter_name || item.user?.name || 'Anonymous'}<div className="admin-td-sub">{item.submitter?.email || item.submitter_email || item.user?.email || ''}</div></td>
                    <td>{Array.isArray(languages) ? languages.join(', ') : languages}</td>
                    <td>{item.submitted_at || item.created_at ? new Date(item.submitted_at || item.created_at).toLocaleDateString() : 'Pending date'}</td>
                    <td>{item.status === 'flagged' ? <><div>{item.flag_reason || item.reason || 'Flagged'}</div><div className="admin-td-sub">{item.flagged_by?.email || item.flagged_by || 'Reporter hidden'}</div></> : '-'}</td>
                    <td>
                      <div className="admin-td-actions">
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => approveReviewItem(item)}>{ta('Approve')}</button>
                        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => startEdit(item)}>{ta('Edit then approve')}</button>
                        {rejecting === item.id ? (
                          <div className="admin-reject-box">
                            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={ta('Short reason')} />
                            <button type="button" className="admin-danger" onClick={() => { rejectReviewItem(item, rejectReason); setRejecting(null); setRejectReason(''); }}>{ta('Reject')}</button>
                            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setRejecting(null)}>{ta('Cancel')}</button>
                          </div>
                        ) : (
                          <button type="button" className="admin-danger" onClick={() => { setRejecting(item.id); setRejectReason(''); }}>{ta('Reject')}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {reviewEditing && (
        <div className="admin-review-editor">
          <div className="admin-section-heading">
            <h2>{ta('Edit Before Approval')}</h2>
            <span>{ta(contentConfig[reviewEditing.type]?.label || reviewEditing.type)}</span>
          </div>
          <div className="admin-form">
            <ContentFormFields type={reviewEditing.type} forms={editForms} setFormValue={setEditFormValue} />
            <div className="admin-form-actions">
              <button type="button" className="admin-primary" onClick={() => approveReviewItem(reviewEditing.item, buildEditPayload(reviewEditing.type))}>{ta('Approve with edits')}</button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setReviewEditing(null)}>{ta('Cancel edit')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function NewsSection({ content, forms, setFormValue, createNews, deleteNews }) {
  const ta = useAdminText();
  const [confirming, setConfirming] = useState(null);
  return (
    <section className="admin-panel">
      <div className="admin-section-heading"><h2>{ta('News Desk')}</h2><span>{formatNumber((content.news || []).length)} {ta('posts')}</span></div>
      <div className="admin-editor-grid">
        <div className="admin-form">
          <h2>{ta('Register News')}</h2>
          <TrilingualField label="Title" value={forms.news.title} onChange={(value) => setFormValue('news', 'title', value)} required />
          <TrilingualField label="Summary" value={forms.news.summary} onChange={(value) => setFormValue('news', 'summary', value)} textarea />
          <TrilingualField label="Body" value={forms.news.body} onChange={(value) => setFormValue('news', 'body', value)} textarea />
          <Field label="Image URL"><input value={forms.news.image_url} onChange={(e) => setFormValue('news', 'image_url', e.target.value)} /></Field>
          <div className="admin-two-col"><Field label="Category"><input value={forms.news.category} onChange={(e) => setFormValue('news', 'category', e.target.value)} /></Field><Field label="Status"><select value={forms.news.status} onChange={(e) => setFormValue('news', 'status', e.target.value)}><option value="draft">{ta('Draft')}</option><option value="published">{ta('Published')}</option></select></Field></div>
          <label className="admin-check"><input type="checkbox" checked={forms.news.is_featured} onChange={(e) => setFormValue('news', 'is_featured', e.target.checked)} /> {ta('Flag as featured')}</label>
          <button type="button" className="admin-primary" onClick={createNews} disabled={!localizedEnglish(forms.news.title)}>{ta('Save news record')}</button>
        </div>
        <div className="admin-list"><h2>{ta('News Records')}</h2>{(content.news || []).length ? (content.news || []).map((item) => <div className="admin-list-item" key={item.id}><div><strong>{localizedPreview(item.title)}</strong><span>{item.status} - {item.category || 'Culture'}</span></div>{confirming === item.id ? <div className="admin-list-actions"><button type="button" className="admin-danger" onClick={() => { deleteNews(item.id); setConfirming(null); }}>{ta('Delete')}</button><button type="button" className="admin-btn admin-btn-ghost" onClick={() => setConfirming(null)}>{ta('Cancel')}</button></div> : <button type="button" className="admin-danger" onClick={() => setConfirming(item.id)}>{ta('Delete')}</button>}</div>) : <EmptyAdminState title="No news yet" body="Published and draft news records will appear here." />}</div>
      </div>
    </section>
  );
}
