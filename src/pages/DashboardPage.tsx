
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  // Initialize rates if empty and fetch current rates when component mounts
  useEffect(() => {
    const initializeAndFetchRates = async () => {
      try {
        setInitialLoading(true);
        
        // First check if we have any rates at all
        const { data: existingRates, error: checkError } = await supabase
          .from('rates')
          .select('*');
          
        if (checkError) {
          console.error('Error checking rates:', checkError);
          toast({
            title: "Error",
            description: "Failed to check current rates.",
            variant: "destructive",
          });
          return;
        }
        
        // If no rates exist, initialize with default values
        if (!existingRates || existingRates.length === 0) {
          console.log('No rates found, initializing with defaults');
          
          // Initialize gold rate
          const { error: goldInitError } = await supabase
            .from('rates')
            .insert({ 
              metal_type: 'gold', 
              rate_per_gram: 62400,
              updated_at: new Date().toISOString()
            });
          
          if (goldInitError) {
            console.error('Error initializing gold rate:', goldInitError);
            toast({
              title: "Error",
              description: "Failed to initialize gold rate.",
              variant: "destructive",
            });
          }
          
          // Initialize silver rate  
          const { error: silverInitError } = await supabase
            .from('rates')
            .insert({ 
              metal_type: 'silver', 
              rate_per_gram: 6250,
              updated_at: new Date().toISOString()
            });
          
          if (silverInitError) {
            console.error('Error initializing silver rate:', silverInitError);
            toast({
              title: "Error",
              description: "Failed to initialize silver rate.",
              variant: "destructive",
            });
          }
        }
        
        // Now fetch the rates (either existing or newly initialized)
        const { data: ratesData, error } = await supabase
          .from('rates')
          .select('*');
          
        if (error) {
          console.error('Error fetching rates:', error);
          toast({
            title: "Error",
            description: "Failed to fetch current rates.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Fetched rates after init:', ratesData);
        
        if (ratesData && ratesData.length > 0) {
          const goldRateData = ratesData.find(rate => rate.metal_type === 'gold');
          const silverRateData = ratesData.find(rate => rate.metal_type === 'silver');
          
          if (goldRateData) {
            setGoldRate(goldRateData.rate_per_gram.toString());
          }
          
          if (silverRateData) {
            setSilverRate(silverRateData.rate_per_gram.toString());
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching rates.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    initializeAndFetchRates();
  }, [toast]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get existing records first
      const { data: existingGold, error: goldQueryError } = await supabase
        .from('rates')
        .select('id')
        .eq('metal_type', 'gold')
        .maybeSingle();
      
      if (goldQueryError) {
        console.error('Error querying gold rate:', goldQueryError);
        toast({
          title: "Error",
          description: "Failed to query gold rate record.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { data: existingSilver, error: silverQueryError } = await supabase
        .from('rates')
        .select('id')
        .eq('metal_type', 'silver')
        .maybeSingle();
      
      if (silverQueryError) {
        console.error('Error querying silver rate:', silverQueryError);
        toast({
          title: "Error",
          description: "Failed to query silver rate record.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Update gold rate
      if (existingGold?.id) {
        // Update existing record
        const { error: goldError } = await supabase
          .from('rates')
          .update({ 
            rate_per_gram: parseFloat(goldRate),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGold.id);
        
        if (goldError) {
          console.error('Error updating gold rate:', goldError);
          toast({
            title: "Error",
            description: "Failed to update gold rate.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Insert new record
        const { error: goldError } = await supabase
          .from('rates')
          .insert({ 
            metal_type: 'gold', 
            rate_per_gram: parseFloat(goldRate),
            updated_at: new Date().toISOString()
          });
        
        if (goldError) {
          console.error('Error inserting gold rate:', goldError);
          toast({
            title: "Error",
            description: "Failed to insert gold rate.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Update silver rate
      if (existingSilver?.id) {
        // Update existing record
        const { error: silverError } = await supabase
          .from('rates')
          .update({ 
            rate_per_gram: parseFloat(silverRate),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSilver.id);
        
        if (silverError) {
          console.error('Error updating silver rate:', silverError);
          toast({
            title: "Error",
            description: "Failed to update silver rate.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Insert new record  
        const { error: silverError } = await supabase
          .from('rates')
          .insert({ 
            metal_type: 'silver', 
            rate_per_gram: parseFloat(silverRate),
            updated_at: new Date().toISOString()
          });
        
        if (silverError) {
          console.error('Error inserting silver rate:', silverError);
          toast({
            title: "Error",
            description: "Failed to insert silver rate.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      toast({
        title: "Success",
        description: t('dashboard.success'),
      });
      
    } catch (error) {
      console.error('Error updating rates:', error);
      toast({
        title: "Error",
        description: "Failed to update rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                  {initialLoading ? 'Loading current rates...' : 'Update the current gold and silver rates'}
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
                      disabled={initialLoading}
                      placeholder={initialLoading ? "Loading..." : "Enter gold rate"}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="silverRate" className="text-sm font-medium">
                      {t('dashboard.silverRate')} ({t('home.per10gm')})
                    </label>
                    <Input
                      id="silverRate"
                      type="number"
                      value={silverRate}
                      onChange={(e) => setSilverRate(e.target.value)}
                      required
                      disabled={initialLoading}
                      placeholder={initialLoading ? "Loading..." : "Enter silver rate"}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || initialLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : t('dashboard.save')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
