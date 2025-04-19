
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

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
                <span className="text-xs text-muted-foreground">{t('app.tagline')}</span>
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
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
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
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Monday - Saturday</span>
                <span>10:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>11:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-4">
          <p className="text-xs text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('app.name')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
