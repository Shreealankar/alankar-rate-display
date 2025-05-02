
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { sendBulkWhatsAppNotifications } from '@/utils/notificationUtils';

export const BulkMessageSender = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendBulkMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const sentCount = await sendBulkWhatsAppNotifications(message);
      
      if (sentCount > 0) {
        toast({
          title: "Messages Sent",
          description: `Successfully initiated sending to ${sentCount} subscribers`,
        });
        setMessage(''); // Clear the message field
      } else {
        toast({
          title: "No Recipients",
          description: "There are no subscribers to send messages to",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Send Bulk Message</CardTitle>
        <CardDescription>
          Send a message to all subscribers at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your message here"
            className="min-h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
          <Button 
            onClick={handleSendBulkMessage}
            className="w-full"
            disabled={sending}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send to All Subscribers
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkMessageSender;
