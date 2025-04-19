
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

        {/* Basic Terms */}
        <section className="py-16 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-card shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All prices are based on current gold and silver rates.</li>
                  <li>Rates are subject to change based on market fluctuations.</li>
                  <li>We accept cash, credit/debit cards, and bank transfers.</li>
                  <li>A minimum deposit may be required for custom orders.</li>
                </ul>
              </div>
              
              <div className="bg-card shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Return Policy</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Items can be returned within 7 days of purchase with original receipt.</li>
                  <li>Custom-designed jewelry is non-returnable.</li>
                  <li>Exchanged items must be in original condition with all tags attached.</li>
                  <li>Refunds will be processed in the original payment method.</li>
                </ul>
              </div>
              
              <div className="bg-card shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Warranty Information</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All jewelry comes with a 6-month warranty against manufacturing defects.</li>
                  <li>Warranty does not cover damage due to improper handling or normal wear and tear.</li>
                  <li>Proof of purchase is required for all warranty claims.</li>
                </ul>
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
