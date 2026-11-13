const ALL_INDIA_BULLION_URL = "https://allindiabullion.com/r/shreealankar";

export const RateDisplay = () => (
  <div className="w-full overflow-hidden border-y border-primary/20 bg-background">
    <iframe
      title="All India Bullion live gold and silver rates"
      src={ALL_INDIA_BULLION_URL}
      className="block h-[780px] w-full border-0 bg-background md:h-[680px]"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="clipboard-read; clipboard-write"
    />
  </div>
);