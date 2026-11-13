import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, MessageSquare } from "lucide-react";

const ALL_INDIA_BULLION_URL = "https://allindiabullion.com/r/shreealankar";

export const RateDisplay = () => {
  const { language, t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-primary">
        {language === "mr" ? "थेट बाजारभाव" : "Live Market Rates"}
      </p>
      <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
        {t("home.rates")}
      </h2>
      <p className="mx-auto mb-7 max-w-xl text-muted-foreground">
        {language === "mr"
          ? "सोने आणि चांदीचे आजचे दर All India Bullion वर पहा."
          : "View today’s gold and silver rates on All India Bullion."}
      </p>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="h-auto min-h-11 max-w-full whitespace-normal border-primary/30 px-5 py-3 hover:border-primary/60 hover:bg-primary/5"
      >
        <a href={ALL_INDIA_BULLION_URL} target="_blank" rel="noopener noreferrer">
          <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
          <span>
            {language === "mr"
              ? "आजचे सोने-चांदीचे दर पहा"
              : "Check Today’s Gold & Silver Rates"}
          </span>
          <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
        </a>
      </Button>
    </div>
  );
};