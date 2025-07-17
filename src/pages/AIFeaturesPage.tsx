import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VirtualTryOn } from '@/components/VirtualTryOn';
import { ImageRecognition } from '@/components/ImageRecognition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Eye, Sparkles, Search, Zap, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

const AIFeaturesPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProducts(data as ProductType[]);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const features = [
    {
      icon: Camera,
      title: 'Virtual Try-On',
      description: 'Experience augmented reality technology to see how earrings and necklaces look on you in real-time.',
      benefits: ['Real-time AR visualization', 'Face detection technology', 'Photo capture & save', 'Multiple jewelry types'],
      component: <VirtualTryOn products={products} />,
      color: 'bg-blue-500'
    },
    {
      icon: Eye,
      title: 'Image Recognition',
      description: 'Upload jewelry images to identify category, material, and find similar products in our collection.',
      benefits: ['AI-powered analysis', 'Material identification', 'Category detection', 'Product matching'],
      component: <ImageRecognition products={products} />,
      color: 'bg-green-500'
    }
  ];

  const stats = [
    { label: 'Recognition Accuracy', value: '95%', icon: Star },
    { label: 'Processing Speed', value: '< 3s', icon: Zap },
    { label: 'Supported Categories', value: '6+', icon: Search },
    { label: 'Products Available', value: products.length.toString(), icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Technology
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experience the Future of 
              <span className="text-primary"> Jewelry Shopping</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover our cutting-edge AI features that revolutionize how you shop for jewelry. 
              Try on items virtually and identify jewelry instantly with advanced computer vision.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {features.map((feature, index) => (
                <div key={index}>
                  {feature.component}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Revolutionary AI Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced machine learning and computer vision technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{feature.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Benefits:</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 bg-primary rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex justify-center">
                    {feature.component}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Our AI Technology Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Behind the scenes of our advanced AI features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Virtual Try-On Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Virtual Try-On Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    'Camera captures your face in real-time',
                    'MediaPipe AI detects facial landmarks',
                    'Jewelry is positioned on precise face points',
                    'Real-time rendering creates AR experience',
                    'Photos can be captured and saved'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Recognition Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Image Recognition Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    'Upload or capture jewelry image',
                    'AI analyzes shape, color, and texture',
                    'Machine learning identifies category',
                    'Algorithm estimates material and purity',
                    'System matches similar products'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience AI-Powered Jewelry Shopping?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join thousands of customers who are already using our revolutionary AI features
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="text-primary">
                <Camera className="h-5 w-5 mr-2" />
                Try Virtual Try-On
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                <Search className="h-5 w-5 mr-2" />
                Test Image Recognition
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIFeaturesPage;