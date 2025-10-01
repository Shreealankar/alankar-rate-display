
import { useLanguage } from '@/contexts/LanguageContext';
import { useDiwaliTheme } from '@/contexts/DiwaliThemeContext';
import { RateDisplay } from '@/components/RateDisplay';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeCarousel } from '@/components/HomeCarousel';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { LanguageSelectionDialog } from '@/components/LanguageSelectionDialog';
import { CustomerAuth } from '@/components/CustomerAuth';
import { DiyaAnimation } from '@/components/diwali/DiyaAnimation';
import { SparkleEffect } from '@/components/diwali/SparkleEffect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Receipt, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const HomePage = () => {
  const { t, language } = useLanguage();
  const { isDiwaliTheme, themeIntensity } = useDiwaliTheme();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(() => !localStorage.getItem('hasVisited'));
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session first
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for existing guest or user login
      const hasGuestLogin = localStorage.getItem('guestLogin');
      const hasDeviceId = localStorage.getItem('deviceId');
      
      if (session || hasGuestLogin || hasDeviceId) {
        setIsAuthenticated(true);
        setShowAuth(false);
        setShowLoading(false);
        return;
      }

      // If no session and first visit, show loading animation
      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowLoading(true);
      } else {
        setShowLoading(false);
        // Check if language was already selected
        const languageSelected = localStorage.getItem('languageSelected');
        if (!languageSelected) {
          setShowLanguageDialog(true);
        } else {
          setShowAuth(true);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setShowAuth(false);
        } else {
          // Check if guest is still logged in
          const hasGuestLogin = localStorage.getItem('guestLogin');
          const hasDeviceId = localStorage.getItem('deviceId');
          if (!hasGuestLogin && !hasDeviceId) {
            setIsAuthenticated(false);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAnimationComplete = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowLoading(false);
    const languageSelected = localStorage.getItem('languageSelected');
    if (!languageSelected) {
      setShowLanguageDialog(true);
    } else {
      setShowAuth(true);
    }
  };

  const handleLanguageDialogClose = () => {
    setShowLanguageDialog(false);
    localStorage.setItem('languageSelected', 'true');
    setShowAuth(true);
  };

  const handleAuthSuccess = (user: any, profile: any) => {
    setIsAuthenticated(true);
    setShowAuth(false);
    // Stay on home page after authentication
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleAnimationComplete} />;
  }

  if (showAuth && !isAuthenticated) {
    return <CustomerAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <LanguageSelectionDialog 
        open={showLanguageDialog} 
        onClose={handleLanguageDialogClose} 
      />
      
      {/* Diwali Theme Decorations */}
      {isDiwaliTheme && (
        <>
          {(themeIntensity === 'moderate' || themeIntensity === 'full') && <DiyaAnimation />}
          {themeIntensity === 'full' && <SparkleEffect />}
        </>
      )}
      
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {/* Language Switcher - Top right */}
          <div className="relative">
            <div className="absolute right-4 top-4 z-10">
              
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative bg-gradient-to-b from-black to-zinc-900 text-white">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80")',
            backgroundPosition: 'center 30%'
          }} />
            <div className="container relative py-24 px-4 flex flex-col items-center justify-center text-center space-y-8">
              <img src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" alt="Shree Alankar Logo" className="w-32 h-32 object-contain mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {language === 'mr' ? 'श्री अलंकार मध्ये आपले स्वागत आहे' : 'Welcome to Shree Alankar'}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl">
                {language === 'mr' ? 'सोने आणि चांदीचे दागिने दुकान १९९८ पासून' : 'Gold & Silver Jewelry Shop Since 1998'}
              </p>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg text-gold-light">{t('home.address')}</p>
                <p className="text-lg text-gold-light">{t('home.contact')}</p>
              </div>
            </div>
          </section>

          {/* Image Carousel Section */}
          <HomeCarousel />

          {/* Rate Display Section */}
          <section className="py-16 bg-gradient-to-b from-background to-accent/10">
            <div className="container px-4">
              <RateDisplay />
            </div>
          </section>

          {/* Featured Products Section */}
          <FeaturedProducts />

          {/* Features Section */}
          <section className="py-16 bg-accent/10">
            <div className="container px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                      <line x1="16" y1="8" x2="2" y2="22"></line>
                      <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('features.craftsmanship.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('features.craftsmanship.description')}
                  </p>
                </div>
                
                <div className="bg-card rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('features.rates.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('features.rates.description')}
                  </p>
                </div>
                
                <div className="bg-card rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('features.support.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('features.support.description')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Portal Section */}
          <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'mr' ? 'ग्राहक पोर्टल' : 'Customer Portal'}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {language === 'mr' ? 
                    'आपले बिल, खरेदी इतिहास आणि थकबाकी पहा' : 
                    'View your bills, purchase history, and outstanding amounts'
                  }
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="text-center">
                    <CardHeader>
                      <Receipt className="h-8 w-8 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">
                        {language === 'mr' ? 'बिल पहा' : 'View Bills'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {language === 'mr' ? 
                          'आपल्या सर्व खरेदीचे बिल आणि पेमेंट स्थिती' : 
                          'All your purchase bills and payment status'
                        }
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardHeader>
                      <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">
                        {language === 'mr' ? 'खरेदी इतिहास' : 'Purchase History'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {language === 'mr' ? 
                          'आपण खरेदी केलेले सर्व दागिने आणि त्यांची माहिती' : 
                          'All jewelry purchases and their details'
                        }
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardHeader>
                      <User className="h-8 w-8 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">
                        {language === 'mr' ? 'प्रोफाइल व्यवस्थापन' : 'Profile Management'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {language === 'mr' ? 
                          'आपली वैयक्तिक माहिती आणि संपर्क तपशील' : 
                          'Your personal information and contact details'
                        }
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Button asChild size="lg" className="text-lg px-8 py-3">
                    <Link to="/customer">
                      <User className="mr-2 h-5 w-5" />
                      {language === 'mr' ? 'ग्राहक लॉगिन' : 'Customer Login'}
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {language === 'mr' ? 
                      'नवीन ग्राहक? आपण साइन अप देखील करू शकता किंवा गेस्ट म्हणून ब्राउझ करू शकता' : 
                      'New customer? You can also sign up or browse as a guest'
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
