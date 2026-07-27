import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import FlagControl from '../components/FlagControl';
import './Collections.css';
import inanga from '../assets/collections/inanga (2).jpg';
import royalCourt from '../assets/collections/royal-court.jpg';
import imigongo from '../assets/collections/imigongo.jpg';
import sacredSpaces from '../assets/collections/sacred-spaces.jpg';
import weaving from '../assets/collections/weaving.jpg';
import curatorAvatar from '../assets/collections/curator.jpg';

const IMG = {
  inanga,
  royalCourt,
  imigongo,
  sacredSpaces,
  weaving,
  curatorAvatar,
};

export default function Collections() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [managedCollections, setManagedCollections] = useState([]);

  const handleOpenArchive = () => {
    navigate("/explore"); // Navigate to explore for now
  };

  const handleSubscribe = () => {
    setMessage("Thank you for subscribing!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleContact = () => {
    setMessage("Opening contact form...");
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/api/collections'), { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : data.collections || data.items || [];
        setManagedCollections(rows);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const collections = useMemo(() => {
    const prototypeCollections = [
      {
        title: 'The Inanga Tradition',
        title_rw: "Umuco w'Inanga",
        title_fr: "La tradition de l'inanga",
        cat: '',
        catLabel: t('collections.oralTradition'),
        count: `24 ${t('collections.items')}`,
        desc: t('collections.inangaDesc'),
        desc_rw: "Icyegeranyo cy'inanga, ibisigo, amajwi y'ibwami n'uburyo umuziki watwaye amateka.",
        desc_fr: "Une collection sur l'inanga, la poesie, les voix de cour et la maniere dont la musique porte la memoire.",
        img: IMG.inanga,
        curator: t('collections.curatedBy'),
      },
      {
        title: t('collections.royalCourtTitle'),
        cat: '',
        catLabel: t('collections.history'),
        count: `42 ${t('collections.items')}`,
        desc: t('collections.royalCourtQuote'),
        img: IMG.royalCourt,
        curator: t('collections.curatedBy'),
      },
      {
        title: 'Imigongo Patterns',
        title_rw: "Ibishushanyo by'Imigongo",
        title_fr: "Motifs d'imigongo",
        cat: '',
        catLabel: t('collections.visualArt'),
        count: `115 ${t('collections.items')}`,
        desc: 'A prototype catalog of geometric variants used in traditional wall art.',
        desc_rw: "Icyegeranyo cy'igerageza cy'ibishushanyo by'imirongo bikoreshwa mu buhanzi gakondo bwo ku nkuta.",
        desc_fr: "Un catalogue prototype de variantes geometriques utilisees dans l'art mural traditionnel.",
        img: IMG.imigongo,
        curator: t('collections.curatedBy'),
      },
      {
        title: 'Sacred Spaces',
        title_rw: 'Ahantu Hatagatifu',
        title_fr: 'Espaces sacres',
        cat: '',
        catLabel: t('collections.architecture'),
        count: `18 ${t('collections.items')}`,
        desc: "Prototype archive of palace, ritual, and traditional architectural spaces.",
        desc_rw: "Ububiko bw'igerageza bw'ingoro, imihango n'ahantu h'ubwubatsi gakondo.",
        desc_fr: "Archive prototype des palais, rites et espaces d'architecture traditionnelle.",
        img: IMG.sacredSpaces,
        curator: t('collections.curatedBy'),
      },
      {
        title: 'Woven Narratives',
        title_rw: 'Inkuru Ziboshye',
        title_fr: 'Recits tisses',
        cat: '',
        catLabel: t('collections.craftsmanship'),
        count: `56 ${t('collections.items')}`,
        desc: 'Prototype stories around Agaseke baskets, symbolism, and everyday craft.',
        desc_rw: "Inkuru z'igerageza ku gaseke, ibimenyetso byako n'ubukorikori bwa buri munsi.",
        desc_fr: "Histoires prototypes autour de l'agaseke, de ses symboles et de l'artisanat quotidien.",
        img: IMG.weaving,
        curator: t('collections.curatedBy'),
      },
    ].map((collection) => ({
      ...collection,
      title: collection[`title_${language}`] || collection.title,
      desc: collection[`desc_${language}`] || collection.desc,
    }));
    if (!managedCollections.length) return prototypeCollections;
    return managedCollections.map((item) => ({
      title: item.title,
      id: item.id,
      cat: '',
      catLabel: item.category || t('collections.visualArt'),
      count: item.item_count ? `${item.item_count} ${t('collections.items')}` : t('collections.items'),
      desc: item.description || '',
      img: item.image_url || '',
      curator: item.curated_by || t('collections.curatedBy'),
    }));
  }, [managedCollections, t, language]);

  const featuredMain = collections[0];
  const featuredSide = collections[1];
  const gridCollections = collections.slice(2);

  return (
    <Layout searchPlaceholder={t('search.placeholder')}>
      <div className="collections-page">
        <div className="collections-header">
          <h1>{t('collections.title')}</h1>
          <p>{t('collections.subtitle')}</p>
        </div>

        <div className="featured-row">
          <div className="featured-main">
            <div className="featured-main-img">
              {featuredMain?.img ? <img src={featuredMain.img} alt={featuredMain.title} /> : null}
              <span className="coll-badge">{featuredMain?.catLabel}</span>
            </div>
            <div className="featured-main-body">
              <div className="featured-main-meta">
                <h2 className="featured-main-title">{featuredMain?.title}</h2>
                <span className="featured-item-count">{featuredMain?.count}</span>
              </div>
              <p className="featured-main-desc">
                {featuredMain?.desc}
              </p>
              <div className="featured-curator">
                <div className="curator-info">
                  <div className="curator-avatar">
                    <img src={IMG.curatorAvatar} alt="Dr. Aimé N." />
                  </div>
                  <span className="curator-name">{featuredMain?.curator || t('collections.curatedBy')}</span>
                </div>
                <span className="open-archive-link" onClick={handleOpenArchive} style={{ cursor: 'pointer' }}>{t('collections.openArchive')}</span>
                {featuredMain?.id && <FlagControl type="collection" itemId={featuredMain.id} title={featuredMain.title} onToast={(text) => { setMessage(text); setTimeout(() => setMessage(''), 3000); }} />}
              </div>
            </div>
          </div>

          {featuredSide && <div className="featured-side">
            <div className="featured-side-img">
              {featuredSide.img ? <img src={featuredSide.img} alt={featuredSide.title} /> : null}
              <div className="featured-side-title">{featuredSide.title}</div>
            </div>
            <div className="featured-side-body">
              <div className="featured-side-count">{featuredSide.count}</div>
              <p className="featured-side-quote">
                "{featuredSide.desc}"
              </p>
              <div className="featured-side-tags">
                <span className="side-tag">{featuredSide.catLabel}</span>
                {featuredSide.id && <FlagControl type="collection" itemId={featuredSide.id} title={featuredSide.title} onToast={(text) => { setMessage(text); setTimeout(() => setMessage(''), 3000); }} />}
              </div>
            </div>
          </div>}
        </div>

        <div className="coll-grid">
          {gridCollections.map((c, i) => (
            <div key={i} className="coll-card">
              <div className="coll-card-img">
                {c.img ? <img src={c.img} alt={c.title} /> : null}
              </div>
              <div className="coll-card-body">
                <h3 className="coll-card-title">{c.title}</h3>
                <div className="coll-card-cat">
                  {c.cat} <span>{c.catLabel}</span> · {c.count}
                </div>
                <p className="coll-card-desc">{c.desc}</p>
                {c.id && <FlagControl type="collection" itemId={c.id} title={c.title} onToast={(text) => { setMessage(text); setTimeout(() => setMessage(''), 3000); }} />}
              </div>
            </div>
          ))}
        </div>

        <div className="cant-find-box">
          <div className="cant-find-text">
            <h3>{t('collections.cantFindTitle')}</h3>
            <p>{t('collections.cantFindDesc')}</p>
          </div>
          <div className="cant-find-actions">
            <button className="btn-subscribe" onClick={handleSubscribe}>{t('collections.subscribe')}</button>
            <button className="btn-contact" onClick={handleContact}>{t('collections.contactArchive')}</button>
          </div>
          {message && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#8D493A',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
