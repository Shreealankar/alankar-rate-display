import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ALL_INDIA_BULLION_URL = 'https://allindiabullion.com/r/shreealankar';

export const RateDisplay = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  return (
    <div className="w-full border-y border-primary/20 bg-background px-4 py-10 text-center">
      <h2 className="mb-3 font-display text-2xl font-semibold text-foreground">
        {isMarathi ? 'आजचे दर' : "Today's Rates"}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {isMarathi
          ? 'लाइव्ह सोन्या-चांदीचे दर All India Bullion वर पहा.'
          : 'View live gold and silver rates on All India Bullion.'}
      </p>
      <a
        href={ALL_INDIA_BULLION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
      >
        {isMarathi ? 'लाइव्ह दर पहा' : 'View live rates'}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </div>
  );
};