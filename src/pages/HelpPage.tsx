import { useLanguage } from '@/contexts/LanguageContext';
import { WhatsAppForm } from '@/components/WhatsAppForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HelpPage = () => {
  const { t, language } = useLanguage();

  const faqs = [
    {
      en: {
        question: "How often are gold and silver rates updated?",
        answer: "Our rates are updated daily based on the market fluctuations. You can always check the latest rates on our homepage."
      },
      mr: {
        question: "सोने आणि चांदीचे दर किती वेळा अपडेट केले जातात?",
        answer: "आमचे दर बाजारातील चढउतारांनुसार दररोज अपडेट केले जातात. तुम्ही नेहमी होमपेजवर नवीनतम दर तपासू शकता."
      }
    },
    {
      en: {
        question: "Do you offer custom jewelry design?",
        answer: "Yes, we offer custom jewelry design services. Please visit our store or contact us to discuss your requirements."
      },
      mr: {
        question: "तुम्ही कस्टम दागिने डिझाइन करता का?",
        answer: "होय, आम्ही कस्टम दागिने डिझाइन सेवा देतो. कृपया तुमच्या आवश्यकता चर्चा करण्यासाठी आमच्या दुकानात भेट द्या किंवा आमच्याशी संपर्क साधा."
      }
    },
    {
      en: {
        question: "What are your business hours?",
        answer: "We are open Monday to Saturday from 10:00 AM to 8:00 PM, and on Sundays from 11:00 AM to 6:00 PM."
      },
      mr: {
        question: "तुमची व्यवसाय वेळ काय आहे?",
        answer: "आम्ही सोमवार ते शनिवार सकाळी १०:०० ते रात्री ८:०० पर्यंत, आणि रविवारी सकाळी ११:०० ते संध्याकाळी ६:०० पर्यंत खुले असतो."
      }
    },
    {
      en: {
        question: "Do you provide jewelry valuation services?",
        answer: "Yes, we provide jewelry valuation services. Please bring your items to our store during business hours."
      },
      mr: {
        question: "तुम्ही दागिन्यांचे मूल्यांकन सेवा प्रदान करता का?",
        answer: "होय, आम्ही दागिन्यांचे मूल्यांकन सेवा प्रदान करतो. कृपया व्यवसायाच्या वेळेत तुमच्या वस्तू आमच्या दुकानात आणा."
      }
    }
  ];

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

        {/* FAQs */}
        <section className="py-16 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">{t('help.faq')}</h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-card shadow-md rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-semibold">
                      {language === 'mr' ? faq.mr.question : faq.en.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {language === 'mr' ? faq.mr.answer : faq.en.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
