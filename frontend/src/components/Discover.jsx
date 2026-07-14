import React, { useState } from 'react';
import { BookOpen, ArrowRight, Lock, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { gihangaStory } from '../data/stories/gihanga';
import { nyirarucyabaStory } from '../data/stories/nyirarucyaba';
import { ruganzuStory } from '../data/stories/ruganzu';
import { kigeliStory } from '../data/stories/kigeli';

// Kept in actual chronological order: Gihanga founds the kingdom (~11th c.),
// his daughter Nyirarucyaba's cattle story follows in the same founding era,
// Ruganzu II Ndoli's return happens centuries later (~17th c.), and Kigeli IV
// Rwabugiri's reign (1853–1895) is the most recent. Add more stories here
// later — the switcher below scales to any number of tabs.
const FEATURED_STORIES = [gihangaStory, nyirarucyabaStory, ruganzuStory, kigeliStory];

function Discover({ onNavigate }) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const story = FEATURED_STORIES[activeIndex];

  // Let the reader get well into the story before hitting the wall —
  // everything except the final paragraph (the actual climax) is fully
  // readable, in the page's normal scroll (no nested scrollbox — that felt
  // fine on mobile but cramped and awkward on desktop). Only the ending
  // is blurred, so "continue reading" lands only once someone has
  // genuinely read a lot.
  const paragraphs = story.content.split('\n\n');
  const visibleParagraphs = paragraphs.slice(0, -1);
  const finalParagraph = paragraphs[paragraphs.length - 1];
  const readMinutes = Math.max(2, Math.round(story.content.split(/\s+/).length / 200));

  return (
    <section className="w-full bg-[#FDFBF7] font-sans px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-24 border-t border-[#EADBC8]/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col items-center text-center mb-8 md:mb-10 px-2 sm:px-0">
          <div className="inline-flex items-center space-x-2 bg-[#FCDFD3]/40 border border-[#EADBC8] rounded-full px-3 py-1 mb-4">
            <span className="text-[9px] sm:text-xs font-semibold tracking-widest text-[#8D493A] uppercase">
              Discover
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#8D493A] mb-2 sm:mb-4">
            A story worth remembering
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#6F5B55] leading-relaxed font-normal max-w-2xl">
            Step into one of the oral histories carried through generations — read where it begins,
            and continue the journey once you join.
          </p>
        </div>

        {/* Story switcher tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8 px-2">
          {FEATURED_STORIES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(i)}
              className={`px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-semibold tracking-wide rounded-full border transition-all duration-200 whitespace-nowrap ${
                i === activeIndex
                  ? 'bg-[#8D493A] border-[#8D493A] text-[#FDFBF7] shadow-sm'
                  : 'bg-transparent border-[#EADBC8] text-[#8D493A] hover:bg-[#FCDFD3]/30'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="max-w-2xl md:max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[#EADBC8]/50 shadow-md bg-white">

          {/* Story banner */}
          <div className="relative h-56 sm:h-72 md:h-80 w-full">
            <img
              src={story.image}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-5 sm:inset-x-8 md:inset-x-12 bottom-4 sm:bottom-6 text-left text-white">
              <div className="flex items-center space-x-2 mb-1">
                <BookOpen className="w-4 h-4 text-[#FCDFD3]" />
                <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#FCDFD3]">
                  Featured story
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                {story.title}
              </h3>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 px-5 sm:px-8 md:px-12 pt-5 sm:pt-6 text-[11px] sm:text-xs text-[#8D493A] font-semibold tracking-wide uppercase">
            <span className="bg-[#FCDFD3]/40 border border-[#EADBC8] rounded-full px-3 py-1">
              {story.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[#6F5B55] normal-case font-medium">
              <Clock className="w-3.5 h-3.5" />
              {readMinutes} min read
            </span>
          </div>

          {/* Story text — natural page flow, storybook typography, blur only at the true ending */}
          <div className="relative px-5 sm:px-8 md:px-12 pt-4 sm:pt-6 pb-2">
            <div
              key={story.id}
              className="max-w-[68ch] mx-auto font-serif text-[15px] sm:text-lg md:text-xl text-[#2C1A14] leading-[1.85] sm:leading-[1.9] space-y-5 sm:space-y-6"
            >
              {visibleParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:text-[#8D493A] first-letter:mr-2 first-letter:float-left first-letter:leading-[0.8]' : ''}
                >
                  {para}
                </p>
              ))}
              <p className="blur-[3px] select-none">{finalParagraph}</p>
            </div>
            {/* Fade-to-blur overlay, sitting right over the blurred final paragraph */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
          </div>

          {/* Continue reading CTA */}
          <div className="flex flex-col items-center pb-8 sm:pb-10 pt-1 relative z-10">
            <button
              onClick={() => onNavigate('signup', story.id)}
              className="inline-flex items-center space-x-2 bg-[#8D493A] hover:bg-[#3E2723] text-[#FDFBF7] px-5 sm:px-7 py-3 text-xs sm:text-sm font-semibold tracking-wide rounded-xl transition-all duration-200 shadow-sm group"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Continue reading</span>
              <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] sm:text-xs text-[#6F5B55] mt-3">
              Join free to finish the story and start earning XP
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Discover;