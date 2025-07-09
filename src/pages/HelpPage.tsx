import { useLanguage } from '@/contexts/LanguageContext';
import { WhatsAppForm } from '@/components/WhatsAppForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HelpPage = () => {
  const { t, language } = useLanguage();


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Contact Information */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
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

        {/* Customer Support Chatbot */}
        <section className="py-16 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-8">{language === 'mr' ? 'ग्राहक सहायता चॅटबॉट' : 'Customer Support Chatbot'}</h2>
              <p className="text-muted-foreground mb-8">
                {language === 'mr' 
                  ? 'आमच्या AI चॅटबॉटसह तात्काळ मदत मिळवा. तुमचे प्रश्न विचारा आणि 24/7 सहाय्य मिळवा.'
                  : 'Get instant help with our AI chatbot. Ask your questions and get 24/7 assistance.'
                }
              </p>
              <div className="bg-card shadow-lg rounded-lg overflow-hidden">
                <iframe
                  src="https://shreealankarchatbot.lovable.app"
                  width="100%"
                  height="600"
                  frameBorder="0"
                  title="Customer Support Chatbot"
                  className="w-full"
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

export default HelpPage;
