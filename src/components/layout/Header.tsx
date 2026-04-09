
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MessageSquare, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: language === 'mr' ? 'दागिने गॅलरी' : 'Jewelry Gallery', href: '/jewelry' },
    { name: t('nav.help'), href: '/help' },
    { name: language === 'mr' ? 'सोने बुकिंग' : 'Gold Booking', href: '/booking' },
    { name: language === 'mr' ? 'ग्राहक लॉगिन' : 'Customer Login', href: '/customer' },
  ];

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-500",
      scrolled 
        ? "bg-background/95 backdrop-blur-xl border-b border-primary/10 shadow-[0_4px_30px_-10px_hsla(43,77%,52%,0.1)]" 
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container flex h-18 items-center py-3">
        {/* Desktop Nav */}
        <div className="mr-4 hidden md:flex flex-1">
          <Link to="/" className="flex items-center space-x-3 group mr-8">
            <div className="relative">
              <Logo className="h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -inset-2 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
          
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg',
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:text-primary">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background border-r border-primary/10">
            <Link to="/" className="flex items-center mb-8">
              <Logo className="h-8 w-auto" />
            </Link>
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 px-4 border-t border-border mt-4">
                <LanguageToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center logo on mobile */}
        <div className="flex flex-1 items-center justify-center md:hidden">
          <Link to="/">
            <Logo className="h-7 w-auto" />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <LanguageToggle />
            <Button variant="outline" size="sm" asChild className="border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <Link to="/help#chatbot">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                <span className="hidden lg:inline text-xs">
                  {language === 'mr' ? 'चॅटबॉट' : 'Chatbot'}
                </span>
              </Link>
            </Button>
          </div>
          
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-primary/20">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.email && <p className="text-xs font-medium truncate">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
