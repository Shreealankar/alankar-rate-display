import { useLanguage } from '@/contexts/LanguageContext';

const NASHIK_RATES_URL = 'https://allindiabullion.com/gold-rate/maharashtra/nashik';
const NASHIK_WIDGET_URL = 'https://allindiabullion.com/widget/maharashtra/nashik';

export const RateDisplay = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  return (
    <div className="w-full px-4 py-10 text-center">
      <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">
        {isMarathi ? 'आजचे दर' : "Today's Rates"}
      </h2>
      <div className="mx-auto w-full max-w-[440px] overflow-hidden">
        <iframe
          src={NASHIK_WIDGET_URL}
          title={isMarathi ? 'नाशिकचे आजचे सोन्या-चांदीचे दर' : "Today's gold and silver rates in Nashik"}
          width="100%"
          height="354"
          loading="lazy"
          className="block w-full border-0"
        />
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {isMarathi ? 'नाशिकचे दर — ' : 'Nashik rates by '}
          <a
            href={NASHIK_RATES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary"
          >
            All India Bullion
          </a>
        </p>
      </div>
    </div>
  );
};