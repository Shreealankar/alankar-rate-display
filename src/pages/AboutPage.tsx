
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* About Hero */}
        <section className="bg-gradient-to-b from-black to-zinc-900 text-white py-16">
          <div className="container px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
            <div className="max-w-xl mx-auto">
              <p className="text-lg text-gold-light">
                Shree Alankar - Jewelers Since 1998
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="space-y-8 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">{t('about.story')}</h2>
                <p className="text-muted-foreground">{t('about.story.content')}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">{t('about.vision')}</h2>
                <p className="text-muted-foreground">{t('about.vision.content')}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">{t('about.mission')}</h2>
                <p className="text-muted-foreground">{t('about.mission.content')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Store Information */}
        <section className="py-16 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('store.title')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('store.address')}</h3>
                    <p className="text-muted-foreground">
                      {t('store.addressLine1')}<br />
                      {t('store.addressLine2')}<br />
                      {t('store.addressLine3')}
                    </p>
                    
                    <h3 className="text-xl font-semibold mb-4 mt-6">{t('store.contact')}</h3>
                    <p className="text-muted-foreground">
                      {t('store.phone')}<br />
                      {t('store.whatsapp')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('store.hours')}</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex justify-between">
                        <span>{t('store.mondayToSaturday')}</span>
                        <span>{t('store.hoursWeekday')}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>{t('store.sunday')}</span>
                        <span>{t('store.hoursSunday')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
