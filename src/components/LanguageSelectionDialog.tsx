
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LanguageSelectionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LanguageSelectionDialog: React.FC<LanguageSelectionDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: 'en' | 'mr') => {
    setLanguage(lang);
    // Small delay before closing to ensure language is set
    setTimeout(() => onClose(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Select Your Language / आपली भाषा निवडा
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred language for the website
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 mt-6">
          <Button 
            onClick={() => handleLanguageSelect('en')}
            size="lg"
            className="w-full text-lg"
          >
            English
          </Button>
          <Button 
            onClick={() => handleLanguageSelect('mr')}
            size="lg"
            variant="outline"
            className="w-full text-lg"
          >
            मराठी (Marathi)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
