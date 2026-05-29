import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Ticket, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props { userEmail: string }

const STATUS_COLORS: Record<string, string> = {
  raised: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  raised: 'Raised', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

export const MyTickets = ({ userEmail }: Props) => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });
      setTickets(data || []);
      setLoading(false);
    })();
  }, [userEmail]);

  const openTicket = async (t: any) => {
    setSelected(t);
    const { data } = await supabase
      .from('complaint_updates')
      .select('*')
      .eq('complaint_id', t.id)
      .order('created_at', { ascending: true });
    setUpdates(data || []);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Ticket className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>No complaint tickets yet.</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:bg-muted/40 transition" onClick={() => openTicket(t)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-primary">{t.ticket_number}</span>
                      <Badge variant="outline" className={STATUS_COLORS[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                    </div>
                    <p className="font-medium truncate">{t.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{t.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{selected.ticket_number}</span>
                  <Badge variant="outline" className={STATUS_COLORS[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Message</p>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded">{selected.message}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> Updates from Shree Alankar
                  </p>
                  {updates.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No updates yet. Our team will respond soon.</p>
                  ) : (
                    <div className="space-y-3">
                      {updates.map((u) => (
                        <div key={u.id} className="border-l-2 border-primary pl-4 pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={STATUS_COLORS[u.status]}>{STATUS_LABEL[u.status]}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(u.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {u.description && <p className="text-sm whitespace-pre-wrap">{u.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyTickets;
