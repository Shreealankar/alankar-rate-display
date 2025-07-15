import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MessageSquare, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    t,
    language
  } = useLanguage();
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data
        } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const navigation = [{
    name: t('nav.home'),
    href: '/'
  }, {
    name: t('nav.about'),
    href: '/about'
  }, {
    name: 'Jewelry Gallery',
    href: '/jewelry'
  }, {
    name: t('nav.help'),
    href: '/help'
  }, {
    name: 'Terms & Conditions',
    href: '/terms'
  }, {
    name: t('nav.login'),
    href: '/login'
  }];
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';
  const handleWhatsAppClick = () => {
    const phoneNumber = '+919876543210'; // Replace with your actual WhatsApp business number
    const message = encodeURIComponent('Hello! I would like to know more about your jewelry collection.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };
  return <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-6 w-auto" />
            </Link>
            
            {/* WhatsApp Button */}
            
          </div>
          
          <nav className="ml-6 flex items-center space-x-6 text-sm font-medium">
            {navigation.map(item => <Link key={item.href} to={item.href} className={cn('transition-colors hover:text-foreground/80', location.pathname === item.href ? 'text-foreground' : 'text-foreground/60')}>
                {item.name}
              </Link>)}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link to="/" className="flex items-center">
              <Logo className="h-6 w-auto" />
            </Link>
            
            {/* WhatsApp Button for Mobile */}
            <div className="mt-4 mb-2">
              
            </div>
            
            <div className="my-4 flex flex-col space-y-3">
              {navigation.map(item => <Link key={item.href} to={item.href} className={cn('text-foreground/60 transition-colors hover:text-foreground', location.pathname === item.href && 'text-foreground')}>
                  {item.name}
                </Link>)}
              <div className="pt-4 border-t">
                <LanguageToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-center md:justify-end">
          <Link to="/" className="flex items-center md:hidden">
            <Logo className="h-6 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <LanguageToggle />
            
            {/* Customer Support Chatbot Button */}
            <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
              <Link to="/help#chatbot">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {language === 'mr' ? 'चॅटबॉट' : 'Chatbot'}
                </span>
              </Link>
            </Button>
            
            {!loading && user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.email && <p className="font-medium">{user.email}</p>}
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
              </DropdownMenu>}
          </div>
        </div>
      </div>
    </header>;
};