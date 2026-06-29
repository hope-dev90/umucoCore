import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, BookOpen, Users, Milestone } from 'lucide-react';

import cardImg1 from '../assets/tradi.jpg';
import cardImg2 from '../assets/book.png';
import cardImg3 from '../assets/iraba.jpg';

function Hero({onNavigate}) {
  const [order, setOrder] = useState([0, 1, 2]);

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
    { value: '200+', label: 'ORAL STORIES' },
    { value: '3', label: 'LANGUAGE MODULES' },
    { value: '24/7', label: 'AI ASSISTANT' }
  ];

  const features = [
    {
      title: 'Connect & Share',
      desc: 'Join a global community dedicated to keeping Rwandan culture.',
      img: cardImg3,
      icon: Users
    },
    {
      title: 'Learn Kinyarwanda',
      desc: 'Master the language of thousand hills with interactive means.',
      img: cardImg2,
      icon: BookOpen
    },
    {
      title: 'Explore Traditions',
      desc: 'Immerse yourself in oral histories, rhythmic drums, and the art.',
      img: cardImg1,
      icon: Compass
    }
  ];

  const positions = [
    'absolute w-72 h-96 top-0 left-0 z-10 transform translate-x-0 translate-y-0 shadow-md scale-90',
    'absolute w-72 h-96 top-0 left-0 z-20 transform translate-x-12 translate-y-12 shadow-lg scale-95',
    'absolute w-72 h-96 top-0 left-0 z-30 transform translate-x-24 translate-y-24 shadow-2xl scale-100'
  ];

  return (
    <section className="w-full bg-[#FDFBF7] font-sans px-4 sm:px-6 pt-24 pb-12 md:pt-36 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        <div className="col-span-1 lg:col-span-6 flex flex-col items-start text-left px-2 sm:px-6">
          <div className="inline-flex items-center space-x-2 bg-[#FCDFD3]/40 border border-[#EADBC8] rounded-full px-3 py-1 mb-4 sm:mb-6">
            <span className="text-[9px] sm:text-xs font-semibold tracking-widest text-[#8D493A] uppercase">
              DIGITALIZING CULTURAL ACCESS.
            </span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2C1A14] leading-[1.15] lg:leading-[1.1] mb-4 sm:mb-6">
            The Sanctuary of <br className="hidden sm:inline" /> Our
            <span className="text-[#8D493A]"> Heritage.</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#6F5B55] max-w-xl leading-relaxed mb-6 sm:mb-8 font-normal">
            Sustaining the nation's pulse by keeping our roots, carrying the <br/>spoken 
            wisdom of our ancestors, for our shared pact.
          </p>

          <div className="flex flex-row items-center gap-2 sm:gap-4 w-full border-b border-[#EADBC8]/60 pb-8 sm:pb-12">
            <button  onClick={() => onNavigate('signup')} className="flex items-center justify-center space-x-1 sm:space-x-2 bg-[#8D493A] hover:bg-[#3E2723] text-[#FDFBF7] px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-sm font-semibold tracking-wide transition-colors duration-200 rounded-lg shadow-sm group flex-1 sm:flex-initial whitespace-nowrap">
              <span>Get Involved</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform transition-transform group-hover:translate-x-1" />
            </button>

            <button onClick={() => document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' })} className="border border-[#8D493A]/40 hover:bg-[#8D493A]/5 text-[#8D493A] px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-sm font-semibold tracking-wide transition-all duration-200 rounded-lg flex-1 sm:flex-initial text-center whitespace-nowrap">
              Explore More
            </button>
          </div>
          <div className="w-full pt-6 sm:pt-8 grid grid-cols-3 gap-2 sm:gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold text-[#8D493A]">
                  {stat.value}
                </span>
                <span className="text-[9px] sm:text-xxs md:text-xs text-[#8D493A] tracking-wider font-semibold mt-1 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-6 relative h-[520px] w-full items-start justify-start lg:pl-12 mt-8 lg:mt-0">
          <div className="relative w-[384px] h-[480px]">
            {features.map((item, index) => {
              const IconComponent = item.icon;
              const assignedPositionIndex = order[index];

              return (
                <div 
                  key={index} 
                  className={`${positions[assignedPositionIndex]} group rounded-3xl overflow-hidden border border-[#EADBC8]/60 transition-all duration-700 ease-in-out cursor-pointer bg-neutral-900`}
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