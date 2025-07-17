import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

export function VoiceRateInquiry() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const speakRates = async () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: t('voice_not_supported'),
        description: t('voice_not_supported_desc'),
        variant: 'destructive',
      });
      return;
    }

    // Mock rates - in real implementation, fetch from your rates API
    const currentRates = {
      gold_24k: 6500,
      gold_22k: 5950,
      gold_18k: 4875,
      silver: 85
    };

    const rateText = language === 'mr' 
      ? `आजचे सोन्याचे दर: २४ कॅरेट सोने ${currentRates.gold_24k} रुपये प्रति ग्राम, २२ कॅरेट सोने ${currentRates.gold_22k} रुपये प्रति ग्राम, १८ कॅरेट सोने ${currentRates.gold_18k} रुपये प्रति ग्राम, आणि चांदी ${currentRates.silver} रुपये प्रति ग्राम आहे.`
      : `Today's rates: 24 karat gold is ${currentRates.gold_24k} rupees per gram, 22 karat gold is ${currentRates.gold_22k} rupees per gram, 18 karat gold is ${currentRates.gold_18k} rupees per gram, and silver is ${currentRates.silver} rupees per gram.`;

    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(rateText);
    utterance.lang = language === 'mr' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: t('voice_error'),
        description: t('voice_error_desc'),
        variant: 'destructive',
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          {t('voice_rate_inquiry')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('voice_rate_description')}
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? stopSpeaking : speakRates}
            variant={isPlaying ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                {t('stop_speaking')}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                {t('hear_rates')}
              </>
            )}
          </Button>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
            {t('speaking_rates')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}