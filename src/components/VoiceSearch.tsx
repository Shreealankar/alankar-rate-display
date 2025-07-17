import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface VoiceSearchProps {
  onSearch: (query: string) => void;
}

export function VoiceSearch({ onSearch }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: t('voice_not_supported'),
        description: t('voice_not_supported_desc'),
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language === 'mr' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onSearch(transcript);
      setIsListening(false);
      
      toast({
        title: t('voice_search_complete'),
        description: `${t('searched_for')}: ${transcript}`,
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: t('voice_search_error'),
        description: t('voice_search_error_desc'),
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">{t('voice_search')}</span>
      </div>
      
      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? 'destructive' : 'default'}
        size="lg"
        className="w-full"
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5 mr-2" />
            {t('stop_listening')}
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            {t('start_voice_search')}
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
          {t('listening')}
        </div>
      )}
    </div>
  );
}