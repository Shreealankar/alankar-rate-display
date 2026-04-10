import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Gem, ChevronRight, Weight, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShareButton } from '@/components/ShareButton';

interface ProductType {
  id: string;
  title: string;
  name_english: string;
  name_marathi: string | null;
  category: string;
  type: string;
  purity: string;
  weight_grams: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  making_charges_type: string | null;
  making_charges_percentage: number | null;
  making_charges_manual: number | null;
  stone_charges: number | null;
  other_charges: number | null;
  huid_number: string | null;
  hallmark_status: string | null;
  unique_number: string | null;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data as ProductType);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBookNow = () => {
    if (!product) return;
    const message = `Hi, I'm interested in booking "${product.title || product.name_english}" (${product.type} - ${product.purity}, ${product.weight_grams}g). Please share more details.`;
    const whatsappUrl = `https://wa.me/919307850850?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Gem className="h-16 w-16 text-primary/30 mx-auto mb-4" />
            <h2 className="font-display text-2xl mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/jewelry')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = language === 'mr' && product.name_marathi ? product.name_marathi : (product.title || product.name_english);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/jewelry" className="hover:text-primary transition-colors">Gallery</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{displayName}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="animate-slide-in-left">
              <div className="aspect-square relative overflow-hidden rounded-2xl bg-secondary/30 border border-border/50">
                {product.image_url ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                      </div>
                    )}
                    <img
                      src={product.image_url}
                      alt={displayName}
                      className={`object-cover w-full h-full transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full gap-3">
                    <Gem className="h-20 w-20 text-primary/15" />
                    <p className="text-muted-foreground text-sm">No image available</p>
                  </div>
                )}
                {/* Type badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`text-xs font-medium px-3 py-1 ${product.type === 'gold' ? 'bg-yellow-500/90 text-black' : 'bg-gray-300/90 text-black'}`}>
                    {product.type === 'gold' ? '✦ Gold' : '◈ Silver'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="animate-slide-in-right space-y-6">
              <div>
                <p className="text-primary text-xs tracking-[0.2em] uppercase mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {displayName}
                </h1>
                {language === 'mr' && product.name_marathi && product.name_english && (
                  <p className="text-muted-foreground text-sm">{product.name_english}</p>
                )}
                {product.unique_number && (
                  <p className="text-xs text-muted-foreground mt-1">Product Code: {product.unique_number}</p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="card-luxury p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                </div>
              )}

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-luxury p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Weight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-semibold">{product.weight_grams}g</p>
                  </div>
                </div>
                <div className="card-luxury p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purity</p>
                    <p className="font-semibold">{product.purity}</p>
                  </div>
                </div>
                {product.hallmark_status && (
                  <div className="card-luxury p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hallmark</p>
                      <p className="font-semibold capitalize">{product.hallmark_status}</p>
                    </div>
                  </div>
                )}
                {product.huid_number && (
                  <div className="card-luxury p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">HUID</p>
                      <p className="font-semibold text-xs">{product.huid_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metal Info */}
              <div className="card-luxury p-5">
                <h3 className="font-display text-sm font-semibold mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metal Type</span>
                    <span className="font-medium capitalize">{product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purity</span>
                    <span className="font-medium">{product.purity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Weight</span>
                    <span className="font-medium">{product.weight_grams} grams</span>
                  </div>
                  {product.stone_charges && product.stone_charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stone Charges</span>
                      <span className="font-medium">₹{product.stone_charges}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleBookNow}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-base py-6 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
                >
                  <Gem className="h-5 w-5 mr-2" />
                  Book Now
                </Button>
                <ShareButton title={displayName} description={`${product.type} ${product.category} - ${product.purity}, ${product.weight_grams}g`} />
              </div>

              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Contact us via WhatsApp for pricing and availability
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
