
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { saveMobileNumber, getMobileNumber } from '@/utils/notificationUtils';

export const MobileNumberDialog = () => {
  const [open, setOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Disabled automatic popup - users can manually trigger this if needed
    // const savedNumber = getMobileNumber();
    // if (!savedNumber) {
    //   const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    //   if (!hasVisitedBefore) {
    //     setOpen(true);
    //     localStorage.setItem('hasVisitedBefore', 'true');
    //   }
    // }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Save mobile number to localStorage
    saveMobileNumber(mobileNumber);
    
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
      toast({
        title: "Success",
        description: "You will now receive rate update notifications via SMS",
      });
    }, 1000);
  };

  const handleSkip = () => {
    setOpen(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('notification.title') || 'Get Rate Updates via SMS'}</DialogTitle>
          <DialogDescription>
            {t('notification.description') || 'Enter your mobile number to receive notifications when gold and silver rates change.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              id="mobileNumber"
              placeholder={t('notification.mobilePlaceholder') || 'Enter your 10-digit mobile number'}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              type="tel"
              pattern="[0-9]{10}"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleSkip}>
              {t('notification.skip') || 'Skip'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : t('notification.submit') || 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
