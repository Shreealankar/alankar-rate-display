
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JewelryForm } from './JewelryForm';
import { ShareButton } from './ShareButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JewelryItemProps {
  item: {
    id: string;
    name: string;
    weight_grams: number;
    type: 'gold' | 'silver';
    purity: '18k' | '20k' | '22k' | '24k';
    photo_url: string | null;
    created_at: string;
    updated_at: string;
  };
  isOwner: boolean;
}

export const JewelryItem = ({ item, isOwner }: JewelryItemProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('jewelry_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Jewelry item deleted successfully',
      });
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting jewelry item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete jewelry item',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    toast({
      title: 'Success',
      description: 'Jewelry item updated successfully',
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative pb-[75%]">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
            No Image
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{item.name}</CardTitle>
          <ShareButton
            title={`${item.name} - Shree Alankar`}
            description={`Type: ${item.type} | Purity: ${item.purity} | Weight: ${item.weight_grams}g`}
            imageUrl={item.photo_url || undefined}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{item.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Purity</p>
            <p className="font-medium">{item.purity}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weight</p>
            <p className="font-medium">{item.weight_grams}g</p>
          </div>
        </div>
      </CardContent>

      {isOwner && (
        <CardFooter className="flex justify-end gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Jewelry Item</DialogTitle>
              </DialogHeader>
              <JewelryForm item={item} onSuccess={handleEditSuccess} />
            </DialogContent>
          </Dialog>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this jewelry item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};
