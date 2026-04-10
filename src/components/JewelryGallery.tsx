import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { Loader2, Pencil, Trash2, Search, Filter, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface JewelryGalleryProps {
  isOwner: boolean;
}

export const JewelryGallery = ({ isOwner }: JewelryGalleryProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [purityFilter, setPurityFilter] = useState<string>('all');
  const [weightFilter, setWeightFilter] = useState<string>('all');
  
  const { toast } = useToast();

  console.log("JewelryGallery component - isOwner prop:", isOwner); // Debug log

  // Fetch products
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

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      // Type filter
      const matchesType = typeFilter === 'all' || product.type === typeFilter;
      
      // Purity filter
      const matchesPurity = purityFilter === 'all' || product.purity === purityFilter;
      
      // Weight filter
      const matchesWeight = weightFilter === 'all' || (() => {
        const weight = product.weight_grams;
        switch (weightFilter) {
          case 'light': return weight < 5;
          case 'medium': return weight >= 5 && weight < 20;
          case 'heavy': return weight >= 20;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesCategory && matchesType && matchesPurity && matchesWeight;
    });
  }, [products, searchTerm, categoryFilter, typeFilter, purityFilter, weightFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setPurityFilter('all');
    setWeightFilter('all');
  };
  
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
        <h2 className="text-3xl font-bold">{t('gallery.title')}</h2>
        {isOwner && (
          <div className="text-sm text-green-600 font-medium">
            {t('gallery.ownerMode')}
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('gallery.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('gallery.filters')}
                {(categoryFilter !== 'all' || typeFilter !== 'all' || purityFilter !== 'all' || weightFilter !== 'all') && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    Active
                  </span>
                )}
              </Button>
            </CollapsibleTrigger>
            {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || purityFilter !== 'all' || weightFilter !== 'all') && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                {t('gallery.clearAll')}
              </Button>
            )}
          </div>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('gallery.category')}</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('gallery.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('gallery.allCategories')}</SelectItem>
                    <SelectItem value="necklace">{t('gallery.necklace')}</SelectItem>
                    <SelectItem value="ring">{t('gallery.ring')}</SelectItem>
                    <SelectItem value="earring">{t('gallery.earring')}</SelectItem>
                    <SelectItem value="bracelet">{t('gallery.bracelet')}</SelectItem>
                    <SelectItem value="pendant">{t('gallery.pendant')}</SelectItem>
                    <SelectItem value="other">{t('gallery.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('gallery.type')}</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('gallery.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('gallery.allTypes')}</SelectItem>
                    <SelectItem value="gold">{t('gallery.gold')}</SelectItem>
                    <SelectItem value="silver">{t('gallery.silver')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Purity Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('gallery.purity')}</label>
                <Select value={purityFilter} onValueChange={setPurityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('gallery.allPurities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('gallery.allPurities')}</SelectItem>
                    <SelectItem value="18k">18K</SelectItem>
                    <SelectItem value="20k">20K</SelectItem>
                    <SelectItem value="22k">22K</SelectItem>
                    <SelectItem value="24k">24K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('gallery.weightRange')}</label>
                <Select value={weightFilter} onValueChange={setWeightFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('gallery.allWeights')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('gallery.allWeights')}</SelectItem>
                    <SelectItem value="light">{t('gallery.light')}</SelectItem>
                    <SelectItem value="medium">{t('gallery.medium')}</SelectItem>
                    <SelectItem value="heavy">{t('gallery.heavy')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {loading ? t('gallery.loading') : `${t('gallery.showing')} ${filteredProducts.length} ${t('gallery.of')} ${products.length} ${t('gallery.products')}`}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            {products.length === 0 ? (
              <>
                <p className="text-muted-foreground">{t('gallery.noProducts')}</p>
                {isOwner && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('gallery.addFirstProduct')}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-muted-foreground">{t('gallery.noMatch')}</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  {t('gallery.clearFilters')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-500"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="aspect-square relative overflow-hidden bg-secondary/30">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <Gem className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">{t(`gallery.${product.type}`)}</span>
                    <span className="text-xs capitalize">{t(`gallery.${product.category}`)}</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">{product.purity}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{product.weight_grams}g</p>
                  {product.description && (
                    <p className="line-clamp-2 text-muted-foreground mt-2 text-xs">{product.description}</p>
                  )}
                </div>
              </CardContent>
              {isOwner && (
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentProduct(product);
                      setShowEditProductDialog(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t('gallery.edit')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentProduct(product);
                      setShowDeleteProductDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('gallery.delete')}
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
