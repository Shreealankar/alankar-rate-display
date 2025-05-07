
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductType {
  id: string;
  title: string;
  category: 'necklace' | 'ring' | 'earring' | 'bracelet' | 'pendant' | 'other';
  type: 'gold' | 'silver';
  purity: '18k' | '20k' | '22k' | '24k';
  weight_grams: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const JewelryGallery = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch products and check if user is owner
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data: productItems, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (productsError) {
          throw productsError;
        }
        
        // Type assertion for products
        setProducts(productItems as ProductType[]);
        
        // Check if current user is an owner
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_owner')
            .eq('id', userData.user.id)
            .single();
            
          setIsOwner(profileData?.is_owner || false);
        } else {
          setIsOwner(false);
        }
      } catch (error: any) {
        console.error('Error fetching items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load items',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
      
    // Set up real-time subscription for products
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            setProducts((current) => [payload.new as ProductType, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as ProductType) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, [toast]);
  
  const handleEditProductSuccess = () => {
    setShowEditProductDialog(false);
    setCurrentProduct(null);
    toast({
      title: 'Success',
      description: 'Product updated successfully',
    });
  };
  
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      // Remove product from state
      setProducts((current) => current.filter(p => p.id !== currentProduct.id));
      setShowDeleteProductDialog(false);
      setCurrentProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Jewelry Gallery</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative overflow-hidden bg-muted">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="object-cover w-full h-full" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>Category: <span className="font-medium">{product.category}</span></p>
                  <p>Type: <span className="font-medium">{product.type}</span></p>
                  <p>Purity: <span className="font-medium">{product.purity}</span></p>
                  <p>Weight: <span className="font-medium">{product.weight_grams}g</span></p>
                  {product.description && (
                    <p className="line-clamp-2 text-muted-foreground mt-2">{product.description}</p>
                  )}
                </div>
              </CardContent>
              {isOwner && (
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      setCurrentProduct(product);
                      setShowEditProductDialog(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      setCurrentProduct(product);
                      setShowDeleteProductDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Product Dialog - Wrap with ScrollArea */}
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <ProductForm product={currentProduct} onSuccess={handleEditProductSuccess} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JewelryGallery;
