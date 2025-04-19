
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// This is a placeholder until Supabase integration is added
interface RateDisplayProps {
  goldRate?: number;
  silverRate?: number;
  lastUpdated?: string;
}

export const RateDisplay = ({ 
  goldRate = 62400, 
  silverRate = 82000, 
  lastUpdated = new Date().toLocaleString() 
}: RateDisplayProps) => {
  const { t } = useLanguage();

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
              ₹{goldRate.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-jewelry-silver hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-jewelry-silver/10 pb-2">
            <CardTitle className="text-center text-xl text-jewelry-silver">
              {t('home.silver')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('home.per1kg')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-center">
              ₹{silverRate.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <p className="text-sm text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </div>
  );
};
