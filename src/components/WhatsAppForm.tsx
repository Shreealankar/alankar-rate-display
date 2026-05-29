import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const WhatsAppForm = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) {
      toast({ title: 'Invalid Number', description: 'Please enter a valid 10-digit mobile number', variant: 'destructive' });
      return;
    }
    if (!email.includes('@')) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: inserted, error } = await supabase
        .from('complaints')
        .insert({ name, phone: mobile, email, subject, message })
        .select('ticket_number, name, phone, email, subject, message')
        .single();

      if (error) throw error;

      // Fire email (don't block on errors)
      await supabase.functions.invoke('send-complaint-email', { body: inserted });

      setTicket(inserted.ticket_number);
      setName(''); setMobile(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err: any) {
      toast({ title: 'Submission Failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyTicket = () => {
    if (ticket) {
      navigator.clipboard.writeText(ticket);
      toast({ title: 'Copied', description: 'Ticket number copied to clipboard' });
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{language === 'mr' ? 'तक्रार सबमिट करा' : 'Submit a Complaint'}</CardTitle>
          <CardDescription>
            {language === 'mr'
              ? 'आम्ही तुमची तक्रार ईमेलद्वारे प्राप्त करू आणि तिकीट क्रमांक देऊ.'
              : 'We will receive your complaint via email and issue you a tracking ticket number.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile (10-digit)</label>
              <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Complaint</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!ticket} onOpenChange={(o) => !o && setTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" /> Complaint Submitted
            </DialogTitle>
            <DialogDescription>
              Your complaint has been received. A confirmation email has been sent to you.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Your Ticket Number</p>
            <p className="text-2xl font-bold text-primary tracking-wider mt-1">{ticket}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Track this ticket anytime by signing into your customer portal.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={copyTicket}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
            <Button onClick={() => setTicket(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppForm;
