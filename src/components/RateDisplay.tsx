
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { MobileNumberDialog } from "@/components/MobileNumberDialog";
import { ShareButton } from "@/components/ShareButton";

export const RateDisplay = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [goldRate, setGoldRate] = useState<number | null>(null);
  const [silverRate, setSilverRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(formatDate(new Date()));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

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
        const { data: ratesData, error } = await supabase.from('rates').select('*');
        if (error) {
          setError(true);
          toast({ title: "Error", description: "Failed to fetch current rates.", variant: "destructive" });
          return;
        }

        if (ratesData && ratesData.length > 0) {
          const goldRateData = ratesData.find(rate => rate.metal_type === 'gold');
          const silverRateData = ratesData.find(rate => rate.metal_type === 'silver');
          const anyLocked = goldRateData?.is_locked || silverRateData?.is_locked;
          setIsLocked(anyLocked || false);
          setGoldRate(goldRateData?.rate_per_gram ?? 62400);
          setSilverRate(silverRateData?.rate_per_gram ?? 6250);

          const latestUpdate = [goldRateData, silverRateData]
            .filter(Boolean)
            .sort((a, b) => new Date(b!.updated_at).getTime() - new Date(a!.updated_at).getTime())[0];
          if (latestUpdate) setLastUpdated(formatDate(new Date(latestUpdate.updated_at)));
        } else {
          setGoldRate(62400);
          setSilverRate(6250);
          try {
            await supabase.from('rates').insert({ metal_type: 'gold', rate_per_gram: 62400, updated_at: new Date().toISOString() });
            await supabase.from('rates').insert({ metal_type: 'silver', rate_per_gram: 6250, updated_at: new Date().toISOString() });
          } catch (initError) {
            console.error('Error initializing default rates:', initError);
          }
        }
      } catch (err) {
        setError(true);
        toast({ title: "Error", description: "An unexpected error occurred while fetching rates.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    const channel = supabase
      .channel('rates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rates' }, () => {
        toast({ title: "Rates Updated", description: "The rates have been updated." });
        fetchRates();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  const handleWhatsAppClick = () => {
    const phoneNumber = "919921612155";
    const message = encodeURIComponent(t('home.whatsappMessage'));
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <MobileNumberDialog />
      
      <div className="text-center mb-8">
        <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Live Prices</p>
        <div className="flex items-center justify-center gap-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold">{t('home.rates')}</h2>
          {!isLocked && (
            <ShareButton
              title="Shree Alankar - Today's Gold & Silver Rates"
              description={`${t('home.gold')}: ₹${goldRate?.toLocaleString() || '62,400'} ${t('home.per10gm')}\n${t('home.silver')}: ₹${silverRate?.toLocaleString() || '6,250'} ${t('home.per10gm')}\n\n${language === 'mr' ? 'शेवटचे अपडेट' : 'Last Updated'}: ${lastUpdated}`}
              variant="default"
              isRateShare={true}
            />
          )}
        </div>
      </div>

      {isLocked ? (
        <div className="card-luxury p-8 text-center border-primary/20">
          <div className="mb-6 relative inline-block">
            <svg className="w-14 h-14 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm9 13H6v-8h12v8z"/>
              <circle cx="12" cy="16" r="1.5"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-bold mb-3">{t('home.rateLocked')}</h3>
          <Button 
            onClick={handleWhatsAppClick}
            className="mt-4 bg-[hsl(142_70%_35%)] hover:bg-[hsl(142_70%_30%)] text-foreground font-semibold px-6"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('home.askOnWhatsApp')}
          </Button>
        </div>
      ) : error ? (
        <div className="card-luxury p-8 text-center border-destructive/30">
          <p className="text-destructive font-semibold">{t('home.rateError')}</p>
          <p className="text-sm mt-2 text-muted-foreground">{t('home.tryAgainLater')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gold Rate */}
            <div className="card-luxury p-6 border-jewelry-gold/20 hover:border-jewelry-gold/40 transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-gradient-gold">{t('home.gold')}</h3>
                <span className="text-xs text-muted-foreground">{t('home.per10gm')}</span>
              </div>
              <p className="font-display text-4xl font-bold tracking-tight">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                ) : goldRate !== null ? (
                  `₹${goldRate.toLocaleString()}`
                ) : '₹62,400'}
              </p>
              <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-jewelry-gold/20 to-transparent" />
            </div>

            {/* Silver Rate */}
            <div className="card-luxury p-6 border-jewelry-silver/20 hover:border-jewelry-silver/40 transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-jewelry-silver">{t('home.silver')}</h3>
                <span className="text-xs text-muted-foreground">{t('home.per10gm')}</span>
              </div>
              <p className="font-display text-4xl font-bold tracking-tight">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                ) : silverRate !== null ? (
                  `₹${silverRate.toLocaleString()}`
                ) : '₹6,250'}
              </p>
              <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-jewelry-silver/20 to-transparent" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6 tracking-wider">
            {language === 'mr' ? 'शेवटचे अपडेट' : 'Last Updated'}: {lastUpdated}
          </p>
        </>
      )}
    </div>
  );
};
