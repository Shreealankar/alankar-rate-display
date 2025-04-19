
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [goldRate, setGoldRate] = useState('62400');
  const [silverRate, setSilverRate] = useState('82000');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would update rates in Supabase
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: t('dashboard.success'),
      });
    }, 1000);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Dashboard Header */}
        <section className="bg-gradient-to-b from-black to-zinc-900 text-white py-8">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
              <Button variant="outline" onClick={handleLogout} className="mt-4 md:mt-0">
                {t('dashboard.logout')}
              </Button>
            </div>
          </div>
        </section>
        
        {/* Rate Update Form */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>{t('dashboard.update')}</CardTitle>
                <CardDescription>
                  Update the current gold and silver rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="goldRate" className="text-sm font-medium">
                      {t('dashboard.goldRate')}
                    </label>
                    <Input
                      id="goldRate"
                      type="number"
                      value={goldRate}
                      onChange={(e) => setGoldRate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="silverRate" className="text-sm font-medium">
                      {t('dashboard.silverRate')}
                    </label>
                    <Input
                      id="silverRate"
                      type="number"
                      value={silverRate}
                      onChange={(e) => setSilverRate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : t('dashboard.save')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Note about Supabase Integration */}
        <section className="py-8 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Supabase Integration Note</h3>
              <p className="text-muted-foreground">
                To enable real-time rate updates and secure owner authentication, please connect your 
                Lovable project to Supabase using the Supabase button at the top right of the interface.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
