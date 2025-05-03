
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JewelryForm } from './JewelryForm';
import { JewelryItem } from './JewelryItem';
import { Loader2, Plus } from 'lucide-react';

interface JewelryItemType {
  id: string;
  name: string;
  weight_grams: number;
  type: 'gold' | 'silver';
  purity: '18k' | '20k' | '22k' | '24k';
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const JewelryGallery = () => {
  const [jewelryItems, setJewelryItems] = useState<JewelryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Fetch all jewelry items and check if user is owner
  useEffect(() => {
    const fetchJewelryItems = async () => {
      try {
        setLoading(true);
        
        // Fetch jewelry items
        const { data: items, error } = await supabase
          .from('jewelry_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setJewelryItems(items || []);
        
        // Check if current user is an owner
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_owner')
            .eq('id', userData.user.id)
            .single();
            
          setIsOwner(profileData?.is_owner || false);
        }
      } catch (error: any) {
        console.error('Error fetching jewelry items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load jewelry items',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJewelryItems();

    // Set up real-time subscription
    const channel = supabase
      .channel('jewelry-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jewelry_items' },
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            setJewelryItems((current) => [payload.new as JewelryItemType, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setJewelryItems((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as JewelryItemType) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setJewelryItems((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    toast({
      title: 'Success',
      description: 'Jewelry item added successfully',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Jewelry Gallery</h2>
        {isOwner && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Jewelry Item</DialogTitle>
              </DialogHeader>
              <JewelryForm onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : jewelryItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No jewelry items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jewelryItems.map((item) => (
            <JewelryItem key={item.id} item={item} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JewelryGallery;
