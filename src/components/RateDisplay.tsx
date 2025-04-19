
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const RateDisplay = () => {
  const { t } = useLanguage();
  const [goldRate, setGoldRate] = useState<number>(62400);
  const [silverRate, setSilverRate] = useState<number>(6250); // Default value for silver per 10g
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch rates from Supabase
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data: ratesData, error } = await supabase
          .from('rates')
          .select('*');
        
        if (error) {
          console.error('Error fetching rates:', error);
          return;
        }
        
        console.log('Fetched rates data:', ratesData);
        
        // Process rates data
        if (ratesData && ratesData.length > 0) {
          const goldRateData = ratesData.find(rate => rate.metal_type === 'gold');
          const silverRateData = ratesData.find(rate => rate.metal_type === 'silver');
          
          if (goldRateData) {
            console.log('Setting gold rate:', goldRateData.rate_per_gram);
            setGoldRate(goldRateData.rate_per_gram);
          }
          
          if (silverRateData) {
            console.log('Setting silver rate:', silverRateData.rate_per_gram);
            // Silver rate is already per 10g in the database
            setSilverRate(silverRateData.rate_per_gram);
          }
          
          // Set last updated timestamp
          if (goldRateData || silverRateData) {
            const latestUpdate = [goldRateData, silverRateData]
              .filter(Boolean)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
            
            setLastUpdated(new Date(latestUpdate.updated_at).toLocaleString());
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Set up real-time subscription to rates table
    const channel = supabase
      .channel('rates-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rates' 
        }, 
        (payload) => {
          console.log('Rates change detected:', payload);
          // Refresh data when rates are updated
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">{t('home.rates')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-gold hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-jewelry-gold/10 pb-2">
            <CardTitle className="text-center text-xl text-jewelry-gold">
              {t('home.gold')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('home.per10gm')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-center">
              {loading ? 
                <span className="opacity-50">Loading...</span> : 
                `₹${goldRate.toLocaleString()}`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-jewelry-silver hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-jewelry-silver/10 pb-2">
            <CardTitle className="text-center text-xl text-jewelry-silver">
              {t('home.silver')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('home.per10gm')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-center">
              {loading ? 
                <span className="opacity-50">Loading...</span> : 
                `₹${silverRate.toLocaleString()}`
              }
            </p>
          </CardContent>
        </Card>
      </div>
      
      <p className="text-sm text-muted-foreground text-center mt-4">
        {t('home.lastUpdated')}: {lastUpdated}
      </p>
    </div>
  );
};
