
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const WhatsAppForm = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(
      `Name: ${name}\nMobile: ${mobile}\nComplaint: ${message}`
    );
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/9921612155?text=${whatsappMessage}`, '_blank');
    
    // Reset form fields
    setName('');
    setMobile('');
    setMessage('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('help.complaint')}</CardTitle>
        <CardDescription>
          Your complaint will be sent directly via WhatsApp.
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
          
          <Button type="submit" className="w-full" size="lg">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('help.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
