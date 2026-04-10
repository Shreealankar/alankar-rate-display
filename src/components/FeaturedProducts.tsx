
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProductType {
  id: string;
  title: string;
  category: 'necklace' | 'ring' | 'earring' | 'bracelet' | 'pendant' | 'other';
  type: 'gold' | 'silver';
  purity: '18k' | '20k' | '22k' | '24k';
  weight_grams: number;
  description: string | null;
  image_url: string | null;
}

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        setProducts(data as ProductType[]);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Curated For You</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Featured Products</h2>
          <p className="text-muted-foreground">Discover our exquisite collection</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="card-luxury p-12 text-center max-w-md mx-auto">
            <Gem className="h-10 w-10 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No products available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="card-luxury group cursor-pointer hover:border-primary/30 transition-all duration-500 block">
                <div className="aspect-square relative overflow-hidden bg-secondary/30">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title || 'Product'}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <Gem className="h-12 w-12 text-primary/20" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold truncate mb-2">{product.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{product.type}</span>
                    <span className="capitalize">{product.category}</span>
                    <span>•</span>
                    <span>{product.purity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{product.weight_grams}g</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Button asChild variant="outline" className="border-primary/30 hover:border-primary/60 hover:bg-primary/5">
            <Link to="/jewelry" className="inline-flex items-center gap-2">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
