
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
import { Logo } from '@/components/Logo';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        } else {
          // For testing purposes, set isOwner to true when not logged in
          setIsOwner(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // For testing purposes, set isOwner to true even on error
        setIsOwner(true);
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="block md:hidden">
            <Logo className="h-10 w-auto" />
          </div>
          {isOwner && (
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 ml-auto">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? "w-[95%] max-w-md max-h-[90vh]" : "sm:max-w-md max-h-[90vh]"}>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <ProductForm onSuccess={handleAddProductSuccess} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <JewelryGallery />
      </main>
      <Footer />
    </div>
  );
};

export default JewelryGalleryPage;
