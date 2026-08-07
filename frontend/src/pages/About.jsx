import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function About() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const text = {
    title: {
      en: "About UmucoCore.",
      fr: "À propos d'UmucoCore.",
      rw: "Ibyerekeye UmucoCore."
    },
    subtitle: {
      en: "A digital cultural archive dedicated to preserving, documenting, and promoting Rwanda's heritage for future generations.",
      fr: "Une archive culturelle numérique dédiée à la préservation et promotion du patrimoine rwandais.",
      rw: "Ububiko bw'umuco bw'ikoranabuhanga bugamije kubungabunga umurage w'u Rwanda."
    },
    mission: {
      en: "Our Mission",
      fr: "Notre mission",
      rw: "Intego yacu"
    },
    history: {
      en: "History",
      fr: "Histoire",
      rw: "Amateka"
    },
    what: {
      en: "What We Do",
      fr: "Ce que nous faisons",
      rw: "Icyo Dukora"
    },
    contact: {
      en: "Contact Us",
      fr: "Contactez-nous",
      rw: "Twandikire"
    }
  };

  const backLabel = language === 'rw' ? 'Subira' : language === 'fr' ? 'Retour' : 'Back';

  return (
    <div className="min-h-screen bg-[var(--primary-bg)] px-6 py-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[#8D493A] hover:text-[var(--primary-dark)] transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="font-medium">{backLabel}</span>
        </button>

        {/* HERO */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div>
            <div className="mb-4 inline-block bg-[#f1e4d6] px-4 py-2 rounded-full text-sm">
              {language === 'rw' ? 'Irembo ryacu' : language === 'fr' ? 'Notre espace' : 'Our Space'}
            </div>

            <h1 className="font-serif text-5xl md:text-6xl font-bold text-[var(--primary-dark)] leading-tight">
              {text.title[language]}
            </h1>

            <p className="mt-6 text-[var(--text-secondary)] max-w-lg">
              {text.subtitle[language]}
            </p>

            <div className="flex gap-6 mt-8 items-center">
              <button className="bg-[#8D493A] text-white px-6 py-3 rounded-lg">
                {language === 'rw' ? 'Tangira' : language === 'fr' ? 'Commencer' : 'Join the Mission'}
              </button>
              <span className="text-[#8D493A] cursor-pointer">
                {language === 'rw' ? 'Soma byinshi' : language === 'fr' ? 'En savoir plus' : 'Learn More'}
              </span>
            </div>
          </div>

          {/* RIGHT IMAGES */}
          <div className="relative flex justify-center">
            <div className="w-64 h-80 rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1609220136736-443140cffec6"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-56 h-72 rounded-xl overflow-hidden shadow-xl absolute -left-10 top-10">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* MISSION + HISTORY */}
        <div className="grid md:grid-cols-2 gap-8 mt-20 bg-[#f8f1e7] p-8 rounded-2xl border">

          <div>
            <h2 className="font-serif text-xl font-bold mb-3 text-[var(--primary-dark)]">
              {text.mission[language]}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {language === 'rw'
                ? "Kubungabunga no guteza imbere umuco w'u Rwanda mu buryo bw'ikoranabuhanga."
                : language === 'fr'
                ? "Préserver et promouvoir la culture rwandaise à travers le numérique."
                : "Preserving and promoting Rwanda’s culture through digital innovation."}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold mb-3 text-[var(--primary-dark)]">
              {text.history[language]}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {language === 'rw'
                ? "Yatangijwe n'abanyarwanda bakunda umuco wabo kandi bashaka kuwusigasira."
                : language === 'fr'
                ? "Créé par des Rwandais passionnés par leur patrimoine."
                : "Created by Rwandans passionate about preserving their heritage."}
            </p>
          </div>

        </div>

        {/* WHAT WE DO */}
        <div className="mt-20">
          <h2 className="font-serif text-3xl font-bold text-[var(--primary-dark)] mb-10">
            {text.what[language]}
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">📖</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'rw'
                  ? "Kubika amateka n'inkuru z'abakuru"
                  : language === 'fr'
                  ? "Histoires orales"
                  : "Oral histories"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">🗂</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'rw'
                  ? "Kubika ibintu by'umuco"
                  : language === 'fr'
                  ? "Archives culturelles"
                  : "Cultural digitization"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">🎓</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'rw'
                  ? "Kwigisha umuco"
                  : language === 'fr'
                  ? "Éducation"
                  : "Education"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">🌍</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'rw'
                  ? "Guhuza abanyarwanda"
                  : language === 'fr'
                  ? "Connexion diaspora"
                  : "Global connection"}
              </p>
            </div>

          </div>
        </div>

        {/* CONTACT */}
        <div className="mt-20 bg-gradient-to-r from-[#1E3B27] to-[#2f5b3a] text-white p-10 rounded-2xl">

          <h2 className="font-serif text-2xl mb-4">
            {text.contact[language]}
          </h2>

          <p className="opacity-90 mb-4">
            {language === 'rw'
              ? "Twandikire niba ushaka gutanga umusanzu cyangwa igitekerezo."
              : language === 'fr'
              ? "Contactez-nous pour contribuer ou suggérer."
              : "Reach out if you'd like to contribute or share ideas."}
          </p>

          <a
            href="mailto:mutimutujehope90@gmail.com"
            className="text-yellow-300 font-semibold"
          >
            mutimutujehope90@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}

export default About;