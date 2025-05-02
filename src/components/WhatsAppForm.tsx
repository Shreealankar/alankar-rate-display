
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveMobileNumber } from '@/utils/notificationUtils';

export const WhatsAppForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number
    if (mobile.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }
    
    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(
      `Name: ${name}\nMobile: ${mobile}\nMessage: ${message}`
    );
    
    // Save the number for future rate notifications if user opted in
    saveMobileNumber(mobile);
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/9921612155?text=${whatsappMessage}`, '_blank');
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent via WhatsApp",
    });
    
    // Reset form fields
    setName('');
    setMobile('');
    setMessage('');
  };

  const handleRateUpdateSubscribe = () => {
    if (mobile.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }
    
    // Save the mobile number for rate updates
    saveMobileNumber(mobile);
    
    toast({
      title: "Subscribed",
      description: "You've been subscribed to rate updates via WhatsApp",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('help.complaint')}</CardTitle>
        <CardDescription>
          Send your message directly via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('help.name')}
            </label>
            <Input
              id="name"
              placeholder={t('help.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="mobile" className="text-sm font-medium">
              {t('help.mobile')}
            </label>
            <Input
              id="mobile"
              type="tel"
              placeholder={t('help.mobile')}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {t('help.message')}
            </label>
            <Textarea
              id="message"
              placeholder={t('help.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="flex-1" size="lg">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('help.submit')}
            </Button>
            
            <Button 
              type="button" 
              className="flex-1" 
              size="lg" 
              variant="outline"
              onClick={handleRateUpdateSubscribe}
            >
              <Send className="mr-2 h-4 w-4" />
              Subscribe to Updates
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WhatsAppForm;
