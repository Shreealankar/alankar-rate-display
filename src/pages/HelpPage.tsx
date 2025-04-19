
import { useLanguage } from '@/contexts/LanguageContext';
import { WhatsAppForm } from '@/components/WhatsAppForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MessageSquare } from 'lucide-react';

const HelpPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Help Hero */}
        <section className="bg-gradient-to-b from-black to-zinc-900 text-white py-12">
          <div className="container px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">{t('help.title')}</h1>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">{t('help.contact')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-card shadow-md rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground mb-4">Call us for any inquiries</p>
                  <a 
                    href="tel:9921612155" 
                    className="text-primary font-medium hover:underline"
                  >
                    9921612155
                  </a>
                </div>
                
                <div className="bg-card shadow-md rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
                  <p className="text-muted-foreground mb-4">Chat with us on WhatsApp</p>
                  <a 
                    href="https://wa.me/9921612155" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    9921612155
                  </a>
                </div>
              </div>
              
              {/* WhatsApp Complaint Form */}
              <div className="mt-12">
                <WhatsAppForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-card shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">How often are gold and silver rates updated?</h3>
                  <p className="text-muted-foreground">
                    Our rates are updated daily based on the market fluctuations. You can always check the latest rates on our homepage.
                  </p>
                </div>
                
                <div className="bg-card shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Do you offer custom jewelry design?</h3>
                  <p className="text-muted-foreground">
                    Yes, we offer custom jewelry design services. Please visit our store or contact us to discuss your requirements.
                  </p>
                </div>
                
                <div className="bg-card shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">What are your business hours?</h3>
                  <p className="text-muted-foreground">
                    We are open Monday to Saturday from 10:00 AM to 8:00 PM, and on Sundays from 11:00 AM to 6:00 PM.
                  </p>
                </div>
                
                <div className="bg-card shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Do you provide jewelry valuation services?</h3>
                  <p className="text-muted-foreground">
                    Yes, we provide jewelry valuation services. Please bring your items to our store during business hours.
                  </p>
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

export default HelpPage;
