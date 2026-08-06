import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function About() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--primary-bg)]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-[var(--primary-dark)] mb-8">
          {language === 'rw' ? 'Ibyerekeye Umuco Core' : language === 'fr' ? 'À propos d\'Umuco Core' : 'About Umuco Core'}
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-[var(--primary-dark)] mb-4">
              {language === 'rw' ? 'Umuco Core' : language === 'fr' ? 'Notre mission' : 'Our Mission'}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {language === 'rw' 
                ? 'Umuco Core ni ububiko bw\'umuco w\'u Rwanda bw\'ikoranabuhanga bwifuza kubungabunga, kubika, no kwemeza umurage w\'u Rwanda kugira ngo abazaza babone kumumenya.'
                : language === 'fr'
                ? 'Umuco Core est une archive culturelle numérique dédiée à la préservation, la documentation et la valorisation du patrimoine rwandais pour les générations futures.'
                : 'Umuco Core is a digital cultural archive dedicated to preserving, documenting, and promoting Rwanda\'s heritage for future generations.'}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-[var(--primary-dark)] mb-4">
              {language === 'rw' ? 'Amateka' : language === 'fr' ? 'Histoire' : 'History'}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {language === 'rw'
                ? 'Umuco Core wafashwe n\'abanyarwanda b\'i Rwanda n\'abari mu mahanga bafite umurage w\'u Rwanda ku mutima. Tuzerda kubungabunga amateka yacu, imigenzo, n\'umuco wacu mu buryo bw\'ikoranabuhanga.'
                : language === 'fr'
                ? 'Umuco Core a été créé par des Rwandais de l\'intérieur et de la diaspora qui ont à cœur le patrimoine rwandais. Nous œuvrons pour préserver notre histoire, nos traditions et notre culture de manière numérique.'
                : 'Umuco Core was created by Rwandans at home and in the diaspora who hold Rwanda\'s heritage close to their hearts. We work to preserve our history, traditions, and culture in digital form.'}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-[var(--primary-dark)] mb-4">
              {language === 'rw' ? 'Icyo Dukora' : language === 'fr' ? 'Ce que nous faisons' : 'What We Do'}
            </h2>
            <ul className="list-disc list-inside text-[var(--text-secondary)] leading-relaxed space-y-2">
              <li>
                {language === 'rw' 
                  ? 'Kubika amateka avugwa n\'inkuru z\'abakurambere'
                  : language === 'fr'
                  ? 'Préserver les histoires orales et les récits des anciens'
                  : 'Preserving oral histories and stories from elders'}
              </li>
              <li>
                {language === 'rw' 
                  ? 'Gushyira ahagaragara ibintu by\'umuco n\'amateka'
                  : language === 'fr'
                  ? 'Numériser les artefacts culturels et historiques'
                  : 'Digitizing cultural artifacts and historical items'}
              </li>
              <li>
                {language === 'rw' 
                  ? 'Kwigisha umuco w\'u Rwanda ku buryo bugezweho'
                  : language === 'fr'
                  ? 'Éduquer sur la culture rwandaise de manière moderne'
                  : 'Educating about Rwandan culture in modern ways'}
              </li>
              <li>
                {language === 'rw' 
                  ? 'Guhuza abanyarwanda b\'i Rwanda n\'abari mu mahanga'
                  : language === 'fr'
                  ? 'Connecter les Rwandais du pays et de la diaspora'
                  : 'Connecting Rwandans at home and in the diaspora'}
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-[var(--primary-dark)] mb-4">
              {language === 'rw' ? 'Twandikire' : language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {language === 'rw'
                ? 'Niba ufite ibibazo, igitekerezo, cyangwa wifuza kudusangira umusanzu, twandikire kuri:'
                : language === 'fr'
                ? 'Si vous avez des questions, des suggestions ou souhaitez contribuer, contactez-nous à:'
                : 'If you have questions, suggestions, or would like to contribute, reach us at:'}
              <br />
              <a href="mailto:mutimutujehope90@gmail.com" className="text-[#8D493A] hover:underline">
                mutimutujehope90@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;