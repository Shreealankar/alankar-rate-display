
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CarouselImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CarouselManager = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImage, setCurrentImage] = useState<CarouselImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch carousel images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImageUrl('');
    setCurrentImage(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (image: CarouselImage) => {
    setCurrentImage(image);
    setTitle(image.title);
    setDescription(image.description || '');
    setImageUrl(image.image_url);
    setShowEditDialog(true);
  };

  const handleDelete = (image: CarouselImage) => {
    setCurrentImage(image);
    setShowDeleteDialog(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `carousel/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!isEdit && !imageFile && !imageUrl) {
      toast({
        title: 'Error',
        description: 'Please select an image file or provide an image URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const imageData = {
        title: title.trim(),
        description: description.trim() || null,
        image_url: finalImageUrl,
        is_active: true,
      };

      if (isEdit && currentImage) {
        const { error } = await supabase
          .from('carousel_images')
          .update({
            ...imageData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentImage.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Carousel image updated successfully',
        });
        setShowEditDialog(false);
      } else {
        // Get the next display order
        const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0;
        
        const { error } = await supabase
          .from('carousel_images')
          .insert({
            ...imageData,
            display_order: maxOrder + 1,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Carousel image added successfully',
        });
        setShowAddDialog(false);
      }

      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving carousel image:', error);
      toast({
        title: 'Error',
        description: 'Failed to save carousel image',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentImage) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', currentImage.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Carousel image deleted successfully',
      });
      
      setShowDeleteDialog(false);
      setCurrentImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete carousel image',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActive = async (image: CarouselImage) => {
    try {
      const { error } = await supabase
        .from('carousel_images')
        .update({ 
          is_active: !image.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Image ${!image.is_active ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchImages();
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update image status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Carousel Images</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No carousel images found</p>
            <Button onClick={handleAdd} className="mt-4">
              Add Your First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={image.image_url} 
                        alt={image.title}
                        className="object-cover w-full h-full rounded"
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{image.title}</h3>
                        {image.description && (
                          <p className="text-sm text-muted-foreground mt-1">{image.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Order: {image.display_order} | Status: {image.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={image.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleActive(image)}
                        >
                          {image.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(image)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(image)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Carousel Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description (optional)"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="imageFile">Upload Image File</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Image'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Carousel Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description (optional)"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editImageFile">Upload New Image File</Label>
              <Input
                id="editImageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div>
              <Label htmlFor="editImageUrl">Image URL</Label>
              <Input
                id="editImageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Image'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Carousel Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this carousel image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
