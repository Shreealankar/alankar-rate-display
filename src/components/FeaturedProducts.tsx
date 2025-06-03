
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Discover our exquisite collection</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Discover our exquisite collection</p>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No products available at the moment</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground">Discover our exquisite collection</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm">
                  <p>Category: <span className="font-medium capitalize">{product.category}</span></p>
                  <p>Type: <span className="font-medium capitalize">{product.type}</span></p>
                  <p>Purity: <span className="font-medium">{product.purity}</span></p>
                  <p>Weight: <span className="font-medium">{product.weight_grams}g</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild>
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
