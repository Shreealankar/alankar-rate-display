
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JewelryGallery } from '@/components/JewelryGallery';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const JewelryGalleryPage = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const checkIfUserIsOwner = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_owner')
            .eq('id', userData.user.id)
            .single();
            
          setIsOwner(profileData?.is_owner || false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkIfUserIsOwner();
  }, []);

  const handleAddProductSuccess = () => {
    setShowAddProductDialog(false);
    toast({
      title: 'Success',
      description: 'Product added successfully',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {isOwner && (
          <div className="container mx-auto px-4 py-4 flex justify-end">
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? "w-[95%] max-w-md" : "sm:max-w-md"}>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <ProductForm onSuccess={handleAddProductSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        )}
        <JewelryGallery />
      </main>
      <Footer />
    </div>
  );
};

export default JewelryGalleryPage;
