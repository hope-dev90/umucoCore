import React from 'react';
import { Share2, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[var(--primary-dark)] text-white font-sans px-6 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16 border-b border-white/10">
          
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <h3 className="font-serif text-2xl font-bold tracking-wide text-[#FDFBF7] mb-4">
              UmucoCore
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-6 font-normal">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center space-x-3">
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors duration-200">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors duration-200">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col items-start text-left">
            <h4 className="font-serif text-lg font-bold tracking-wide text-[#EADBC8] mb-4">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.exploreCulture')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.kinyarwandaBasics')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.oralTraditions')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.virtualMuseum')}</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 flex flex-col items-start text-left">
            <h4 className="font-serif text-lg font-bold tracking-wide text-[#EADBC8] mb-4">
              {t('footer.community')}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.joinDiscussions')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.upcomingEvents')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.contributorProgram')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('footer.partnerships')}</a></li>
            </ul>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <h4 className="font-serif text-lg font-bold tracking-wide text-[#EADBC8] mb-4">
              {t('footer.subscribe')}
            </h4>
            <p className="text-sm text-[var(--text-muted)] mb-4 font-normal">
              {t('footer.subscribeDesc')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md items-center space-x-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[#8D493A] transition-colors duration-200"
              />
              <button
                type="submit"
                className="bg-[#8D493A] hover:bg-[var(--primary-dark)] text-white px-5 py-3 text-sm font-semibold tracking-wide rounded-lg transition-colors duration-200"
              >
                {t('footer.send')}
              </button>
            </form>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]/60 font-normal">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors duration-200">{t('footer.termsOfUse')}</a>
            <a href="#" className="hover:text-white transition-colors duration-200">{t('footer.helpCenter')}</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
