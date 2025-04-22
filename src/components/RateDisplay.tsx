import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const RateDisplay = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [goldRate, setGoldRate] = useState<number | null>(null);
  const [silverRate, setSilverRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(formatDate(new Date()));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { language } = useLanguage();

  function formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    let hh = date.getHours();
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    hh = hh ? hh : 12;
    const hhStr = String(hh).padStart(2, "0");

    return `${dd}/${mm}/${yyyy} ${hhStr}:${min}:${ss} ${ampm}`;
  }

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(false);

        const { data: ratesData, error } = await supabase
          .from('rates')
          .select('*');

        if (error) {
          console.error('Error fetching rates:', error);
          setError(true);
          toast({
            title: "Error",
            description: "Failed to fetch current rates.",
            variant: "destructive",
          });
          return;
        }

        console.log('Fetched rates data:', ratesData);

        if (ratesData && ratesData.length > 0) {
          const goldRateData = ratesData.find(rate => rate.metal_type === 'gold');
          const silverRateData = ratesData.find(rate => rate.metal_type === 'silver');

          if (goldRateData) {
            console.log('Setting gold rate:', goldRateData.rate_per_gram);
            setGoldRate(goldRateData.rate_per_gram);
          } else {
            setGoldRate(62400);
          }

          if (silverRateData) {
            console.log('Setting silver rate:', silverRateData.rate_per_gram);
            setSilverRate(silverRateData.rate_per_gram);
          } else {
            setSilverRate(6250);
          }

          if (goldRateData || silverRateData) {
            const latestUpdate = [goldRateData, silverRateData]
              .filter(Boolean)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

            if (latestUpdate) {
              setLastUpdated(formatDate(new Date(latestUpdate.updated_at)));
            }
          }
        } else {
          setGoldRate(62400);
          setSilverRate(6250);

          console.log('No rates found, initializing default rates');

          try {
            await supabase
              .from('rates')
              .insert({
                metal_type: 'gold',
                rate_per_gram: 62400,
                updated_at: new Date().toISOString()
              });

            await supabase
              .from('rates')
              .insert({
                metal_type: 'silver',
                rate_per_gram: 6250,
                updated_at: new Date().toISOString()
              });

            console.log('Default rates initialized successfully');
          } catch (initError) {
            console.error('Error initializing default rates:', initError);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching rates:', err);
        setError(true);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching rates.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

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
          toast({
            title: "Rates Updated",
            description: "The rates have been updated.",
          });
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">{t('home.rates')}</h2>

      {error ? (
        <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive">
          <p className="text-destructive font-semibold">
            {t('home.rateError')}
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            {t('home.tryAgainLater')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-jewelry-gold hover:shadow-lg transition-all duration-300">
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
                  {loading ? (
                    <span className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </span>
                  ) : goldRate !== null ? (
                    `₹${goldRate.toLocaleString()}`
                  ) : (
                    `₹62,400`
                  )}
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
                  {loading ? (
                    <span className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </span>
                  ) : silverRate !== null ? (
                    `₹${silverRate.toLocaleString()}`
                  ) : (
                    `₹6,250`
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            {language === 'mr' ? 'शेवटचे अपडेट' : 'Last Updated'}: {lastUpdated}
          </p>
        </>
      )}
    </div>
  );
};
