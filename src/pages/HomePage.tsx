
import { useLanguage } from '@/contexts/LanguageContext';
import { RateDisplay } from '@/components/RateDisplay';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeCarousel } from '@/components/HomeCarousel';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { LanguageSelectionDialog } from '@/components/LanguageSelectionDialog';
import { CustomerAuth } from '@/components/CustomerAuth';
import { Button } from '@/components/ui/button';
import { User, Receipt, ShoppingBag, Gem, Shield, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const HomePage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [showLoading, setShowLoading] = useState(() => !localStorage.getItem('hasVisited'));
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasGuestLogin = localStorage.getItem('guestLogin');
      const hasDeviceId = localStorage.getItem('deviceId');
      
      if (session || hasGuestLogin || hasDeviceId) {
        setIsAuthenticated(true);
        setShowAuth(false);
        setShowLoading(false);
        return;
      }

      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowLoading(true);
      } else {
        setShowLoading(false);
        const languageSelected = localStorage.getItem('languageSelected');
        if (!languageSelected) {
          setShowLanguageDialog(true);
        } else {
          setShowAuth(true);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setShowAuth(false);
        } else {
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
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleAnimationComplete} />;
  }

  if (showAuth && !isAuthenticated) {
    return <CustomerAuth onAuthSuccess={handleAuthSuccess} />;
  }

  const features = [
    {
      icon: Gem,
      titleKey: 'features.craftsmanship.title',
      descKey: 'features.craftsmanship.description',
    },
    {
      icon: Shield,
      titleKey: 'features.rates.title',
      descKey: 'features.rates.description',
    },
    {
      icon: Phone,
      titleKey: 'features.support.title',
      descKey: 'features.support.description',
    },
  ];

  return (
    <>
      <LanguageSelectionDialog 
        open={showLanguageDialog} 
        onClose={handleLanguageDialogClose} 
      />
      
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1287&q=80")',
                  backgroundPosition: 'center 30%'
                }} 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-float delay-500" />

            <div className="container relative z-10 py-20 px-4">
              <div className="max-w-3xl mx-auto text-center">
                {/* Logo */}
                <div className="animate-scale-up mb-8">
                  <div className="relative inline-block">
                    <img 
                      src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
                      alt="Shree Alankar Logo" 
                      className="w-24 h-24 md:w-28 md:h-28 object-contain mx-auto" 
                    />
                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-glow-pulse" />
                  </div>
                </div>

                {/* Heading */}
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
                  <span className="text-gradient-gold">
                    {language === 'mr' ? 'श्री अलंकार' : 'Shree Alankar'}
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-4 animate-slide-up delay-200 tracking-[0.15em] uppercase font-light">
                  {language === 'mr' ? 'सोने आणि चांदीचे दागिने दुकान' : 'Gold & Silver Jewelry Shop'}
                </p>

                <div className="flex items-center justify-center gap-3 mb-8 animate-slide-up delay-300">
                  <div className="w-12 h-[1px] bg-primary/40" />
                  <span className="text-primary text-sm tracking-widest uppercase">
                    {language === 'mr' ? '१९९८ पासून' : 'Since 1998'}
                  </span>
                  <div className="w-12 h-[1px] bg-primary/40" />
                </div>

                <div className="space-y-2 text-sm text-muted-foreground animate-slide-up delay-400 mb-10">
                  <p>{t('home.address')}</p>
                  <p>{t('home.contact')}</p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-500">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 gold-glow">
                    <Link to="/booking">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {language === 'mr' ? 'सोने बुक करा' : 'Book Gold'}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary/30 hover:border-primary/60 hover:bg-primary/5">
                    <Link to="/jewelry">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {language === 'mr' ? 'संग्रह पहा' : 'View Collection'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </section>

          {/* Carousel Section */}
          <HomeCarousel />

          {/* Rate Display Section */}
          <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
            <div className="container px-4 relative z-10">
              <RateDisplay />
            </div>
          </section>

          <div className="section-divider" />

          {/* Featured Products Section */}
          <FeaturedProducts />

          <div className="section-divider" />

          {/* Features Section */}
          <section className="py-20 relative">
            <div className="container px-4">
              <div className="text-center mb-12">
                <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">
                  {language === 'mr' ? 'आमची ओळख' : 'Why Choose Us'}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold">
                  {language === 'mr' ? 'उत्कृष्टतेची परंपरा' : 'A Legacy of Excellence'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="card-luxury p-8 text-center group hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-3">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-divider" />

          {/* Gold Booking CTA */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-background to-primary/[0.03]" />
            <div className="container px-4 relative z-10">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs tracking-wider uppercase mb-6">
                  <Sparkles className="h-3 w-3" />
                  {language === 'mr' ? 'आजचा विशेष' : "Today's Special"}
                </div>
                
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {language === 'mr' ? 'सोने आणि दागिने बुकिंग' : 'Gold & Jewellery Booking'}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  {language === 'mr' 
                    ? '24K सोने, नियमित सोने किंवा सोन्याचे दागिने तुमच्या आवश्यकतेनुसार बुक करा. सुरक्षित आणि सोपी बुकिंग प्रक्रिया.'
                    : 'Book 24K Gold, Regular Gold, or Gold Jewellery as per your needs. Safe and easy booking process.'}
                </p>
                
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 gold-glow"
                >
                  <Link to="/booking">
                    {language === 'mr' ? 'आता बुक करा' : 'Book Now'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <div className="section-divider" />

          {/* Customer Portal Section */}
          <section className="py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">
                    {language === 'mr' ? 'आपले खाते' : 'Your Account'}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    {language === 'mr' ? 'ग्राहक पोर्टल' : 'Customer Portal'}
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    {language === 'mr' ? 
                      'आपले बिल, खरेदी इतिहास आणि थकबाकी पहा' : 
                      'View your bills, purchase history, and outstanding amounts'
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {[
                    { icon: Receipt, title: language === 'mr' ? 'बिल पहा' : 'View Bills', desc: language === 'mr' ? 'आपल्या सर्व खरेदीचे बिल आणि पेमेंट स्थिती' : 'All your purchase bills and payment status' },
                    { icon: ShoppingBag, title: language === 'mr' ? 'खरेदी इतिहास' : 'Purchase History', desc: language === 'mr' ? 'आपण खरेदी केलेले सर्व दागिने आणि त्यांची माहिती' : 'All jewelry purchases and their details' },
                    { icon: User, title: language === 'mr' ? 'प्रोफाइल व्यवस्थापन' : 'Profile Management', desc: language === 'mr' ? 'आपली वैयक्तिक माहिती आणि संपर्क तपशील' : 'Your personal information and contact details' },
                  ].map((item, index) => (
                    <div key={index} className="card-luxury p-6 text-center group hover:border-primary/30 transition-all duration-500">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center space-y-3">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                    <Link to="/customer">
                      <User className="mr-2 h-4 w-4" />
                      {language === 'mr' ? 'ग्राहक लॉगिन' : 'Customer Login'}
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
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
