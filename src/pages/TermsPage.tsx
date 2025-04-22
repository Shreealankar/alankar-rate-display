
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Terms Hero */}
        <section className="bg-gradient-to-b from-black to-zinc-900 text-white py-12">
          <div className="container px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">{t('terms.title')}</h1>
            <p className="text-lg text-gold-light">{t('terms.subtitle')}</p>
          </div>
        </section>

        {/* QR Code Section */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">{t('terms.scan')}</h2>
                <p className="text-muted-foreground mb-6">
                  Scan this QR code with your smartphone to view our complete terms and conditions.
                </p>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="/lovable-uploads/726ba192-f434-4ff0-8deb-c3e3ace6f5aa.png" 
                  alt="QR Code" 
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;

