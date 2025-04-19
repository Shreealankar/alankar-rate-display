
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu, Languages, Home, User, Book, HelpCircle } from 'lucide-react';

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
              alt="Shree Alankar Logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-primary">{t('app.name')}</span>
              <span className="text-xs text-muted-foreground">{t('app.tagline')}</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.home')}
          </Link>
          <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.about')}
          </Link>
          <Link to="/terms" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.terms')}
          </Link>
          <Link to="/help" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.help')}
          </Link>
          <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.login')}
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('mr')}>
                मराठी {language === 'mr' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <SheetClose asChild>
                <Link to="/" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                  <Home className="h-5 w-5" />
                  <span>{t('nav.home')}</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/about" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                  <Book className="h-5 w-5" />
                  <span>{t('nav.about')}</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/terms" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                  <Book className="h-5 w-5" />
                  <span>{t('nav.terms')}</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/help" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                  <HelpCircle className="h-5 w-5" />
                  <span>{t('nav.help')}</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/login" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                  <User className="h-5 w-5" />
                  <span>{t('nav.login')}</span>
                </Link>
              </SheetClose>
              
              <div className="border-t my-4" />

              <div className="flex flex-col gap-2 p-2">
                <span className="text-sm font-medium">{t('language')}</span>
                <div className="flex gap-4">
                  <button 
                    className={`px-3 py-1 rounded-md ${language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`} 
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${language === 'mr' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => setLanguage('mr')}
                  >
                    मराठी
                  </button>
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
