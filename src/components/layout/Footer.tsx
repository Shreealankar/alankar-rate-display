
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Instagram, Youtube, MapPin } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Information */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
                alt="Shree Alankar Logo" 
                className="h-10 w-10 object-contain" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-primary">{t('app.name')}</span>
                <span className="text-xs text-muted-foreground">{language === 'mr' ? 'उत्तम दागिने विक्रेता १९९८ पासून' : 'Fine Jewelry seller Since 1998'}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t('home.address')}</p>
            <p className="text-sm text-muted-foreground">{t('home.contact')}</p>
            
            {/* WhatsApp Contact */}
            <div className="mt-4">
              <a 
                href="https://wa.me/9921612155" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{language === 'mr' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
              </a>
            </div>

            {/* Location */}
            <div className="mt-4">
              <a 
                href="https://maps.app.goo.gl/ZGcHTUjuVhG6ubKg6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <MapPin className="h-4 w-4" />
                <span>{language === 'mr' ? 'आमचे ठिकाण' : 'Our Location'}</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{language === 'mr' ? 'जलद लिंक्स' : 'Quick Links'}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <a 
                  href="https://sites.google.com/d/1OsSpycKJH855XnV9wX7PNR4Ls9UWGApe/p/1BlGeaRPtKXN4keJe3Jlz_1Xr9DmMYq9M/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {language === 'mr' ? 'दागिने डिझाईन' : 'Jewelry Design'}
                </a>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  {t('nav.terms')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-primary">
                  {t('nav.help')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Business Hours */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{language === 'mr' ? 'व्यवसाय वेळा' : 'Business Hours'}</h3>
            <p className="text-sm text-muted-foreground">9:30 AM - 7:15 PM</p>

            {/* Social Media Links */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">{language === 'mr' ? 'सोशल मीडिया' : 'Social Media'}</h3>
              <div className="flex flex-col space-y-2">
                <a 
                  href="https://www.instagram.com/shreealankar2112?igsh=bjRpNDVueDU3N2xw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://youtube.com/@shreealankar2112?si=YIhhPakGGb2y2v8R"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Youtube className="h-4 w-4" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-4">
          <p className="text-xs text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('app.name')}. {language === 'mr' ? 'सर्व हक्क राखीव.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
