import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  raised: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
};
const STATUS_LABEL: Record<string, string> = { raised: 'Raised', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

export const ComplaintsManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openComplaint = async (c: any) => {
    setSelected(c);
    setNewStatus(c.status);
    setDescription('');
    const { data } = await supabase.from('complaint_updates').select('*').eq('complaint_id', c.id).order('created_at', { ascending: true });
    setUpdates(data || []);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { error: e1 } = await supabase.from('complaints').update({ status: newStatus }).eq('id', selected.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('complaint_updates').insert({
        complaint_id: selected.id, status: newStatus, description: description || null,
      });
      if (e2) throw e2;

      await supabase.functions.invoke('send-complaint-update-email', {
        body: {
          ticket_number: selected.ticket_number,
          name: selected.name,
          email: selected.email,
          status: newStatus,
          description,
        },
      });

      toast({ title: 'Updated', description: 'Customer has been notified by email.' });
      setSelected(null);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaints Management</CardTitle>
        <CardDescription>Manage customer complaints and send status updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="raised">Raised</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No complaints to show.</p>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filtered.map((c) => (
                <Card key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openComplaint(c)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-primary">{c.ticket_number}</span>
                          <Badge variant="outline" className={STATUS_COLORS[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                        </div>
                        <p className="font-medium">{c.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{c.name}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    <span className="font-mono">{selected.ticket_number}</span> — {selected.subject}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><b>Name:</b> {selected.name}</div>
                    <div><b>Phone:</b> {selected.phone}</div>
                    <div className="col-span-2"><b>Email:</b> {selected.email}</div>
                  </div>
                  <div>
                    <Label>Customer Message</Label>
                    <p className="bg-muted p-3 rounded text-sm whitespace-pre-wrap mt-1">{selected.message}</p>
                  </div>

                  {updates.length > 0 && (
                    <div>
                      <Label>Previous Updates</Label>
                      <div className="space-y-2 mt-2">
                        {updates.map((u) => (
                          <div key={u.id} className="border-l-2 border-primary pl-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={STATUS_COLORS[u.status]}>{STATUS_LABEL[u.status]}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString('en-IN')}</span>
                            </div>
                            {u.description && <p className="mt-1 whitespace-pre-wrap">{u.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <Label>Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raised">Raised</SelectItem>
                        <SelectItem value="in_progress">In Progress (Solving)</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description / Note to Customer</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe the action taken. This will be visible to the customer and emailed to them."
                    />
                  </div>
                  <Button className="w-full" onClick={handleUpdate} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Update to Customer
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ComplaintsManagement;
