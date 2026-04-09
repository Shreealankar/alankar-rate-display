
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Instagram, Youtube, MapPin, Phone, Clock, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="relative bg-background border-t border-primary/10">
      {/* Gold accent line */}
      <div className="section-divider" />
      
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
                alt="Shree Alankar Logo" 
                className="h-14 w-14 object-contain" 
              />
              <div>
                <h3 className="font-display text-2xl font-bold text-gradient-gold">{t('app.name')}</h3>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">
                  {language === 'mr' ? 'उत्तम दागिने विक्रेता १९९८ पासून' : 'Fine Jewelry Since 1998'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              {language === 'mr' 
                ? 'पिढ्यांपासून विश्वासार्ह सोने आणि चांदीचे दागिने. उत्कृष्ट कारागिरी आणि शुद्धतेची हमी.'
                : 'Trusted gold & silver jewelry across generations. Exceptional craftsmanship and guaranteed purity.'}
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/9921612155" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 hover:gold-glow"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/shreealankar2112"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 hover:gold-glow"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com/@shreealankar2112"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 hover:gold-glow"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a 
                href="https://maps.app.goo.gl/ZGcHTUjuVhG6ubKg6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 hover:gold-glow"
              >
                <MapPin className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-primary mb-6">
              {language === 'mr' ? 'जलद लिंक्स' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/jewelry', label: language === 'mr' ? 'दागिने गॅलरी' : 'Jewelry Gallery' },
                { to: '/booking', label: language === 'mr' ? 'सोने बुकिंग' : 'Gold Booking' },
                { to: '/terms', label: t('nav.terms') },
                { to: '/help', label: t('nav.help') },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="md:col-span-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-primary mb-6">
              {language === 'mr' ? 'संपर्क' : 'Contact'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{t('home.address')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{t('home.contact')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">9:30 AM - 7:15 PM</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <a 
                href="https://shreealankarchatbot.lovable.app" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                {language === 'mr' ? 'ग्राहक सहायता चॅटबॉट' : 'Customer Support Chatbot'}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="section-divider mt-12 mb-6" />
        <p className="text-xs text-center text-muted-foreground/60 tracking-wider">
          &copy; {new Date().getFullYear()} {t('app.name')}. {language === 'mr' ? 'सर्व हक्क राखीव.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};
