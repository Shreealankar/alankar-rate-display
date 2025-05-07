
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

  // Check if the current user is an owner
  useEffect(() => {
    const checkIsOwner = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('is_owner')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            setIsOwner(false);
          } else {
            setIsOwner(profileData?.is_owner || false);
            console.log("Is owner:", profileData?.is_owner);
          }
        } else {
          setIsOwner(false);
          console.log("No session, not an owner");
        }
      } catch (error) {
        console.error('Error checking owner status:', error);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkIsOwner();
    
    // Set up auth state listener to update owner status when auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed event:", event);
      
      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('is_owner')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile on auth change:', error);
            setIsOwner(false);
          } else {
            setIsOwner(profileData?.is_owner || false);
            console.log("Auth state changed - is owner:", profileData?.is_owner);
          }
        } catch (error) {
          console.error('Error checking owner status on auth change:', error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
        console.log("Auth state changed - no session, not an owner");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
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
          <div className="ml-auto">
            {isOwner && !loading && (
              <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
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
        </div>
        <JewelryGallery isOwner={isOwner} />
      </main>
      <Footer />
    </div>
  );
};

export default JewelryGalleryPage;
