import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { UmucoGlyph } from './UmucoGlyphs';

import cardImg1 from '../assets/tradi.jpg';
import cardImg2 from '../assets/book.png';
import cardImg3 from '../assets/iraba.jpg';

function Hero({ onNavigate }) {
  const [order, setOrder] = useState([0, 1, 2]);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prevOrder) => {
        const nextOrder = [...prevOrder];
        const last = nextOrder.pop();
        nextOrder.unshift(last);
        return nextOrder;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '200+', label: t('hero.stats.oralStories') },
    { value: '3', label: t('hero.stats.languageModules') },
    { value: '24/7', label: t('hero.stats.aiAssistant') },
  ];

  const questSteps = [
    { step: '01', label: t('landing.quest.pick') },
    { step: '02', label: t('landing.quest.learn') },
    { step: '03', label: t('landing.quest.earn') },
  ];

  const features = [
    {
      title: t('hero.feature1.title'),
      desc: t('hero.feature1.desc'),
      img: cardImg3,
      icon: Users,
    },
    {
      title: t('hero.feature2.title'),
      desc: t('hero.feature2.desc'),
      img: cardImg2,
      icon: BookOpen,
    },
    {
      title: t('hero.feature3.title'),
      desc: t('hero.feature3.desc'),
      img: cardImg1,
      icon: Compass,
    },
  ];

  const positions = [
    'absolute w-64 h-80 top-0 left-0 z-10 transform translate-x-0 translate-y-0 shadow-md scale-90',
    'absolute w-64 h-80 top-0 left-0 z-20 transform translate-x-10 translate-y-10 shadow-lg scale-95',
    'absolute w-64 h-80 top-0 left-0 z-30 transform translate-x-20 translate-y-20 shadow-2xl scale-100',
  ];

  return (
    <section className="landing-hero-section w-full bg-[#FDFBF7] font-sans px-4 sm:px-6 pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        <div className="col-span-1 lg:col-span-6 flex flex-col items-start text-left px-2 sm:px-6">
          <div className="quest-pill mb-4 sm:mb-6">
            <UmucoGlyph type="trail" size={18} />
            <span>{t('hero.tagline')}</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2C1A14] leading-[1.15] lg:leading-[1.1] mb-4 sm:mb-6">
            {t('hero.title1')} <br className="hidden sm:inline" />
            <span className="text-[#8D493A]">{t('hero.title2')}</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#6F5B55] max-w-xl leading-relaxed mb-6 sm:mb-8 font-normal">
            {t('hero.description')}
          </p>

          <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 w-full border-b border-[#EADBC8]/60 pb-8 sm:pb-12">
            <button
              onClick={() => onNavigate('signup')}
              className="flex items-center justify-center space-x-1 sm:space-x-2 bg-[#8D493A] hover:bg-[#3E2723] text-[#FDFBF7] px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-sm font-semibold tracking-wide transition-colors duration-200 rounded-lg shadow-sm group flex-1 sm:flex-initial whitespace-nowrap"
            >
              <span>{t('hero.getInvolved')}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-[#8D493A]/40 hover:bg-[#8D493A]/5 text-[#8D493A] px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-sm font-semibold tracking-wide transition-all duration-200 rounded-lg flex-1 sm:flex-initial text-center whitespace-nowrap"
            >
              {t('hero.exploreMore')}
            </button>
          </div>
          <div className="hero-stats-grid w-full">
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat-card">
                <span>
                  {stat.value}
                </span>
                <strong>
                  {stat.label}
                </strong>
              </div>
            ))}
          </div>

          <div className="quest-progress">
            {questSteps.map((item) => (
              <div key={item.step} className="quest-progress-step">
                <span>{item.step}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden xl:flex lg:col-span-6 relative h-[430px] w-full items-start justify-center mt-8 lg:mt-0 overflow-hidden">
          <div className="relative w-[340px] h-[400px]">
            {features.map((item, index) => {
              const IconComponent = item.icon;
              const assignedPositionIndex = order[index];

              return (
                <div
                  key={index}
                  className={`${positions[assignedPositionIndex]} quest-card group overflow-hidden border border-[#EADBC8]/60 transition-all duration-700 ease-in-out cursor-pointer bg-neutral-900`}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  <div className="absolute inset-x-5 bottom-5 text-left text-white">
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="w-4 h-4 text-[#FCDFD3] shrink-0" />
                      <h3 className="font-sans text-base font-bold tracking-wide leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xxs text-gray-200/90 line-clamp-2 font-normal tracking-wide leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
