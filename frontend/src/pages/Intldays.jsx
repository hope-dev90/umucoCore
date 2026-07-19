import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import './IntlDays.css';
import themeImg from '../assets/international/imigongo.jpg';
import spotlightImg from '../assets/international/nyanza.jpg';
import harvestImg from '../assets/international/umuganura.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Flag, Leaf, Search } from 'lucide-react';

const IMG = {
  theme: themeImg,
  spotlight: spotlightImg,
  harvest: harvestImg,
};

const NATIONAL_EVENTS_2026 = [
  {
    date: '2026-01-01',
    type: 'civic',
    title: { en: "New Year's Day", fr: 'Jour de l An', rw: "Umunsi wa mbere w'umwaka" },
    desc: { en: 'The year opens with rest, family, and public celebration.', fr: "Ouverture de l'annee, repos et moments en famille.", rw: "Umwaka utangira abantu baruhuka kandi bizihiza mu miryango." },
  },
  {
    date: '2026-01-02',
    type: 'civic',
    title: { en: "Day after New Year's Day", fr: 'Lendemain du Nouvel An', rw: "Umunsi ukurikira uwa mbere w'umwaka" },
    desc: { en: 'A continuation of the New Year public holiday period.', fr: 'Suite de la periode feriee du Nouvel An.', rw: "Ikiruhuko gikomeza nyuma y'umunsi wa mbere w'umwaka." },
  },
  {
    date: '2026-02-01',
    type: 'civic',
    title: { en: 'National Heroes Day', fr: 'Journee nationale des heros', rw: "Umunsi w'Intwari z'Igihugu" },
    desc: { en: 'Honors Rwandans remembered for patriotism, courage, and sacrifice.', fr: 'Rend hommage aux personnes reconnues pour leur patriotisme et leur sacrifice.', rw: "Hibukwa intwari zagaragaje gukunda igihugu, ubutwari n'ubwitange." },
  },
  {
    date: '2026-02-02',
    type: 'civic',
    title: { en: 'National Heroes Day observed', fr: 'Jour des heros observe', rw: "Ikiruhuko cy'Intwari z'Igihugu" },
    desc: { en: 'Observed public holiday because Heroes Day falls on Sunday in 2026.', fr: 'Jour ferie observe car la date tombe un dimanche en 2026.', rw: "Ikiruhuko gikurikizwa kuko umunsi nyirizina uri ku cyumweru muri 2026." },
  },
  {
    date: '2026-03-20',
    type: 'faith',
    title: { en: 'Eid al-Fitr', fr: 'Aid al-Fitr', rw: 'Eid al-Fitr' },
    desc: { en: 'A public holiday marking the end of Ramadan. Date may be confirmed by moon sighting.', fr: 'Jour ferie marquant la fin du Ramadan. La date depend de la lune.', rw: "Ikiruhuko gisoza Ramadan. Itariki yemezwa hashingiwe ku mboneko y'ukwezi." },
  },
  {
    date: '2026-03-28',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel le dernier samedi matin.', rw: "Igikorwa rusange kiba buri wa gatandatu wa nyuma w'ukwezi." },
  },
  {
    date: '2026-04-03',
    type: 'faith',
    title: { en: 'Good Friday', fr: 'Vendredi saint', rw: 'Ku wa Gatanu Mutagatifu' },
    desc: { en: 'Christian public holiday before Easter.', fr: 'Jour ferie chretien avant Paques.', rw: 'Ikiruhuko cya gikristu kibanziriza Pasika.' },
  },
  {
    date: '2026-04-06',
    type: 'faith',
    title: { en: 'Easter Monday', fr: 'Lundi de Paques', rw: 'Ku wa Mbere wa Pasika' },
    desc: { en: 'Public holiday after Easter Sunday.', fr: 'Jour ferie suivant le dimanche de Paques.', rw: 'Ikiruhuko gikurikira Pasika.' },
  },
  {
    date: '2026-04-07',
    type: 'remembrance',
    title: { en: 'Genocide against the Tutsi Memorial Day', fr: 'Commemoration du Genocide contre les Tutsi', rw: 'Kwibuka Jenoside yakorewe Abatutsi' },
    desc: { en: 'Begins the national period of remembrance and mourning.', fr: 'Debut de la periode nationale de memoire et de deuil.', rw: "Itangiza igihe cy'igihugu cyo kwibuka no kunamira abazize Jenoside." },
  },
  {
    date: '2026-04-25',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community service and local dialogue.', fr: 'Service communautaire et dialogue local.', rw: "Umuganda n'ibiganiro by'abaturage." },
  },
  {
    date: '2026-05-01',
    type: 'civic',
    title: { en: 'Labor Day', fr: 'Fete du travail', rw: "Umunsi w'Umurimo" },
    desc: { en: 'Recognizes workers and national development.', fr: 'Celebre les travailleurs et le developpement national.', rw: "Hizihizwa umurimo n'uruhare rw'abakozi mu iterambere." },
  },
  {
    date: '2026-05-27',
    type: 'faith',
    title: { en: 'Eid al-Adha', fr: 'Aid al-Adha', rw: 'Eid al-Adha' },
    desc: { en: 'A public holiday observed by the Muslim community. Date may be confirmed by moon sighting.', fr: 'Jour ferie observe par la communaute musulmane. Date selon la lune.', rw: "Ikiruhuko cy'abayisilamu. Itariki yemezwa hashingiwe ku mboneko y'ukwezi." },
  },
  {
    date: '2026-05-30',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-06-27',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-07-01',
    type: 'civic',
    title: { en: 'Independence Day', fr: "Jour de l'independance", rw: "Umunsi w'Ubwigenge" },
    desc: { en: 'Marks Rwanda becoming independent on 1 July 1962.', fr: "Marque l'independance du Rwanda le 1 juillet 1962.", rw: "Hizihizwa ubwigenge u Rwanda rwabonye ku wa 1 Nyakanga 1962." },
  },
  {
    date: '2026-07-04',
    type: 'civic',
    title: { en: 'Liberation Day', fr: 'Jour de la Liberation', rw: 'Umunsi wo Kwibohora' },
    desc: { en: 'Commemorates the liberation of Rwanda and the end of the 1994 Genocide against the Tutsi.', fr: 'Commemore la liberation du Rwanda et la fin du Genocide contre les Tutsi.', rw: "Hizihizwa Kwibohora no guhagarika Jenoside yakorewe Abatutsi mu 1994." },
  },
  {
    date: '2026-07-06',
    type: 'civic',
    title: { en: 'Liberation Day observed', fr: 'Jour de la Liberation observe', rw: "Ikiruhuko cyo Kwibohora" },
    desc: { en: 'Observed public holiday because Liberation Day falls on Saturday in 2026.', fr: 'Jour ferie observe car la date tombe un samedi en 2026.', rw: "Ikiruhuko gikurikizwa kuko umunsi nyirizina uri ku wa gatandatu muri 2026." },
  },
  {
    date: '2026-07-25',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-08-07',
    type: 'culture',
    title: { en: 'Umuganura Day', fr: 'Jour Umuganura', rw: "Umunsi w'Umuganura" },
    desc: { en: 'A national harvest and cultural thanksgiving festival, observed on the first Friday of August.', fr: "Fete nationale des recoltes et de gratitude culturelle.", rw: "Umunsi w'isarura no gushimira Imana n'abaturage ku musaruro." },
  },
  {
    date: '2026-08-15',
    type: 'faith',
    title: { en: 'Assumption Day', fr: "Assomption", rw: "Asomusiyo" },
    desc: { en: 'Christian public holiday.', fr: 'Jour ferie chretien.', rw: 'Ikiruhuko cya gikristu.' },
  },
  {
    date: '2026-08-17',
    type: 'faith',
    title: { en: 'Assumption Day observed', fr: "Assomption observee", rw: "Ikiruhuko cya Asomusiyo" },
    desc: { en: 'Observed public holiday because Assumption Day falls on Saturday in 2026.', fr: 'Jour ferie observe car la date tombe un samedi en 2026.', rw: "Ikiruhuko gikurikizwa kuko umunsi nyirizina uri ku wa gatandatu muri 2026." },
  },
  {
    date: '2026-08-29',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-09-26',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-10-31',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-11-28',
    type: 'community',
    title: { en: 'Umuganda', fr: 'Umuganda', rw: 'Umuganda' },
    desc: { en: 'Monthly community work held on the last Saturday morning.', fr: 'Travail communautaire mensuel.', rw: "Igikorwa rusange cya buri kwezi." },
  },
  {
    date: '2026-12-25',
    type: 'faith',
    title: { en: 'Christmas Day', fr: 'Noel', rw: 'Noheli' },
    desc: { en: 'Christian public holiday.', fr: 'Jour ferie chretien.', rw: 'Ikiruhuko cya gikristu.' },
  },
  {
    date: '2026-12-26',
    type: 'faith',
    title: { en: 'Boxing Day', fr: 'Lendemain de Noel', rw: 'Umunsi ukurikira Noheli' },
    desc: { en: 'Public holiday following Christmas.', fr: 'Jour ferie suivant Noel.', rw: 'Ikiruhuko gikurikira Noheli.' },
  },
  {
    date: '2026-12-28',
    type: 'faith',
    title: { en: 'Boxing Day observed', fr: 'Lendemain de Noel observe', rw: 'Ikiruhuko gikurikira Noheli' },
    desc: { en: 'Observed public holiday because Boxing Day falls on Saturday in 2026.', fr: 'Jour ferie observe car la date tombe un samedi en 2026.', rw: "Ikiruhuko gikurikizwa kuko umunsi nyirizina uri ku wa gatandatu muri 2026." },
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_LABELS = {
  en: {
    long: MONTHS,
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  fr: {
    long: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
    short: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  rw: {
    long: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
    short: ['Mut', 'Gas', 'Wer', 'Mat', 'Gic', 'Kam', 'Nya', 'Kan', 'Nze', 'Ukw', 'Ugu', 'Uku'],
  },
};

const TYPE_META = {
  all: { labelKey: 'national.filterAll', icon: Filter },
  civic: { labelKey: 'national.filterCivic', icon: Flag },
  remembrance: { labelKey: 'national.filterRemembrance', icon: CalendarDays },
  culture: { labelKey: 'national.filterCulture', icon: Leaf },
  community: { labelKey: 'national.filterCommunity', icon: CalendarDays },
  faith: { labelKey: 'national.filterFaith', icon: CalendarDays },
};

const formatDay = (iso) => new Date(`${iso}T12:00:00`).getDate();
const getMonthIndex = (iso) => new Date(`${iso}T12:00:00`).getMonth();
const monthLabel = (index, language, length = 'long') => (MONTH_LABELS[language] || MONTH_LABELS.en)[length][index];

export default function Intldays() {
  const { t, language } = useLanguage();
  const [activeType, setActiveType] = useState('all');
  const [activeMonth, setActiveMonth] = useState(6);
  const [topbarSearch, setTopbarSearch] = useState('');

  const filteredEvents = useMemo(() => {
    const q = topbarSearch.trim().toLowerCase();
    return NATIONAL_EVENTS_2026.filter((event) => {
      const matchesType = activeType === 'all' || event.type === activeType;
      const title = getLocalizedText(event.title, language).toLowerCase();
      const desc = getLocalizedText(event.desc, language).toLowerCase();
      return matchesType && (!q || title.includes(q) || desc.includes(q));
    });
  }, [activeType, language, topbarSearch]);

  const activeMonthEvents = filteredEvents.filter(event => getMonthIndex(event.date) === activeMonth);
  const featuredEvent = activeMonthEvents[0] || filteredEvents[0] || NATIONAL_EVENTS_2026[0];
  const spotlightEvents = filteredEvents.filter(event => event.type !== 'community').slice(0, 5);

  const monthCards = MONTHS.map((month, index) => ({
    month,
    index,
    events: filteredEvents.filter(event => getMonthIndex(event.date) === index),
  }));

  const changeMonth = (step) => {
    setActiveMonth((current) => (current + step + 12) % 12);
  };

  return (
    <Layout searchPlaceholder="national.searchPlaceholder" searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="national-page">
        <section className="national-hero">
          <div className="national-hero-copy">
            <span className="national-kicker">{t('national.kicker')}</span>
            <h1>{t('national.title')}</h1>
            <p>{t('national.subtitle')}</p>
            <div className="national-filter-chips">
              {Object.entries(TYPE_META).map(([type, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    className={`national-chip ${type} ${activeType === type ? 'active' : ''}`}
                    onClick={() => setActiveType(type)}
                  >
                    <Icon size={14} />
                    {t(meta.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="national-theme-card">
            <img src={IMG.theme} alt="" aria-hidden="true" />
            <div>
              <span>{t('national.yearLabel')}</span>
              <strong>2026</strong>
              <p>{filteredEvents.length} {t('national.eventsFound')}</p>
            </div>
          </div>
        </section>

        <section className="national-layout">
          <div className="national-calendar-panel">
            <div className="national-calendar-toolbar">
              <div>
                <span>{t('national.calendarLabel')}</span>
                <strong>{monthLabel(activeMonth, language)} 2026</strong>
              </div>
              <div className="national-month-controls">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="national-month-grid">
              {monthCards.map((month) => (
                <button
                  key={month.month}
                  type="button"
                  className={`national-month-card ${month.index === activeMonth ? 'active' : ''}`}
                  onClick={() => setActiveMonth(month.index)}
                >
                  <span>{monthLabel(month.index, language, 'short')}</span>
                  <strong>{month.events.length}</strong>
                  <small>{t('national.eventsShort')}</small>
                </button>
              ))}
            </div>

            <div className="national-events-list">
              {activeMonthEvents.length ? activeMonthEvents.map((event) => (
                <article key={`${event.date}-${getLocalizedText(event.title, 'en')}`} className={`national-event-card ${event.type}`}>
                  <div className="national-event-date">
                    <span>{formatDay(event.date)}</span>
                    <small>{monthLabel(getMonthIndex(event.date), language, 'short')}</small>
                  </div>
                  <div>
                    <div className="national-event-type">{t(TYPE_META[event.type]?.labelKey || 'national.filterAll')}</div>
                    <h3>{getLocalizedText(event.title, language)}</h3>
                    <p>{getLocalizedText(event.desc, language)}</p>
                  </div>
                </article>
              )) : (
                <div className="national-empty">
                  <Search size={18} />
                  {t('national.noEvents')}
                </div>
              )}
            </div>
          </div>

          <aside className="national-side-panel">
            <div className="national-feature-card">
              <img src={featuredEvent.type === 'culture' ? IMG.harvest : IMG.spotlight} alt="" aria-hidden="true" />
              <span>{t('national.featured')}</span>
              <h2>{getLocalizedText(featuredEvent.title, language)}</h2>
              <p>{getLocalizedText(featuredEvent.desc, language)}</p>
            </div>

            <div className="national-agenda-card">
              <span>{t('national.yearAgenda')}</span>
              {spotlightEvents.map((event) => (
                <button
                  key={`agenda-${event.date}-${getLocalizedText(event.title, 'en')}`}
                  type="button"
                  className="national-agenda-item"
                  onClick={() => setActiveMonth(getMonthIndex(event.date))}
                >
                  <strong>{formatDay(event.date)} {monthLabel(getMonthIndex(event.date), language, 'short')}</strong>
                  <span>{getLocalizedText(event.title, language)}</span>
                </button>
              ))}
            </div>

            <div className="national-note">
              {t('national.note')}
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  );
}
