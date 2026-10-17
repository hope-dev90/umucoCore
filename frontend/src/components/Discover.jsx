import React, { useState } from 'react';
import { BookOpen, ArrowRight, Lock, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { gihangaStory } from '../data/stories/gihanga';
import { nyirarucyabaStory } from '../data/stories/nyirarucyaba';
import { ruganzuStory } from '../data/stories/ruganzu';
import { kigeliStory } from '../data/stories/kigeli';
import { localizeStory } from '../utils/storyLocalization';

const FEATURED_STORIES = [gihangaStory, nyirarucyabaStory, ruganzuStory, kigeliStory];

function Discover({ onNavigate }) {
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const story = localizeStory(FEATURED_STORIES[activeIndex], language);

  const handlePrevStory = () => {
    setActiveIndex((prev) => (prev === 0 ? FEATURED_STORIES.length - 1 : prev - 1));
  };

  const handleNextStory = () => {
    setActiveIndex((prev) => (prev === FEATURED_STORIES.length - 1 ? 0 : prev + 1));
  };

  const paragraphs = story.content.split('\n\n');
  const visibleParagraphs = paragraphs.slice(0, -1);
  const finalParagraph = paragraphs[paragraphs.length - 1];
  const readMinutes = Math.max(2, Math.round(story.content.split(/\s+/).length / 200));

  return (
    <section className="w-full bg-[#FAF8F5] font-sans px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-24 border-t border-[#EADBC8]/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12 px-2 sm:px-0">
          <div className="inline-flex items-center space-x-2 bg-[#FCDFD3]/40 border border-[#EADBC8] rounded-full px-3.5 py-1 mb-4 shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#8D493A]" />
            <span className="text-[9px] sm:text-xs font-bold tracking-widest text-[#8D493A] uppercase">
              {t('discover.kicker')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#8D493A] mb-2 sm:mb-4">
            {t('discover.title')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#6F5B55] leading-relaxed font-semibold max-w-2xl">
            {t('discover.subtitle')}
          </p>
        </div>
        <div className="story-lockup max-w-2xl md:max-w-4xl mx-auto overflow-hidden border border-[#EADBC8]/60 shadow-md bg-white rounded-3xl transition-all duration-300">
          <div className="relative h-64 sm:h-80 md:h-96 w-full group overflow-hidden bg-neutral-900">
            <img
              src={story.image}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <button
              type="button"
              onClick={handlePrevStory}
              aria-label="Previous Story"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#8D493A] text-white p-2.5 sm:p-3 rounded-full backdrop-blur-md border border-white/20 hover:border-[#8D493A] transition-all duration-200 shadow-lg cursor-pointer z-20 group/btn"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/btn:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNextStory}
              aria-label="Next Story"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#8D493A] text-white p-2.5 sm:p-3 rounded-full backdrop-blur-md border border-white/20 hover:border-[#8D493A] transition-all duration-200 shadow-lg cursor-pointer z-20 group/btn"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
            <div className="absolute inset-x-6 sm:inset-x-12 bottom-6 sm:bottom-8 text-left text-white z-10">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-[#FCDFD3] bg-[#8D493A]/80 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                  {t('discover.featuredStory')} • {activeIndex + 1} of {FEATURED_STORIES.length}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm font-serif">
                {story.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 sm:px-8 md:px-12 pt-6 text-[10px] sm:text-xs text-[#8D493A] font-bold tracking-wider uppercase">
            <span className="bg-[#FCDFD3]/40 border border-[#EADBC8] rounded-full px-3.5 py-1 text-[#8D493A]">
              {story.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#6F5B55] normal-case font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#8D493A]" />
              {readMinutes} min read
            </span>
          </div>
          <div className="relative px-5 sm:px-8 md:px-12 pt-5 pb-2">
            <div
              key={story.id}
              className="max-w-[68ch] mx-auto font-serif text-[15px] sm:text-lg md:text-xl text-[#2C1A14] leading-[1.85] sm:leading-[1.9] space-y-5 sm:space-y-6 text-left"
            >
              {visibleParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:text-[#8D493A] first-letter:mr-2.5 first-letter:float-left first-letter:leading-[0.8]' : ''}
                >
                  {para}
                </p>
              ))}
              <p className="blur-[3px] select-none">{finalParagraph}</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col items-center pb-8 sm:pb-10 pt-2 relative z-10">
            <button
              type="button"
              onClick={() => onNavigate('signup', story.id)}
              className="inline-flex items-center space-x-2 bg-[#8D493A] hover:bg-[#723A2E] text-white px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold tracking-wide rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
            >
              <Lock className="w-4 h-4" />
              <span>{t('discover.continue')}</span>
              <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] sm:text-xs text-[#6F5B55] mt-3 font-medium">
              {t('discover.joinToEarn')}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Discover;
