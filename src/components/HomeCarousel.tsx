
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import Autoplay from 'embla-carousel-autoplay';

type CarouselImage = Tables<'carousel_images'>;

export const HomeCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveImages();
  }, []);

  const fetchActiveImages = async () => {
    try {
      console.log('Fetching carousel images...');
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching carousel images:', error);
        setError(error.message);
        throw error;
      }
      
      console.log('Fetched carousel images:', data);
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      setError('Failed to load carousel images');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="py-8 bg-background">
        <div className="container px-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading images...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-8 bg-background">
        <div className="container px-4">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading carousel: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state with message for debugging
  if (images.length === 0) {
    return (
      <section className="py-8 bg-background">
        <div className="container px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active carousel images found. Please add some images in the dashboard.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-background">
      <div className="container px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Our Gallery</h2>
        <Carousel 
          className="w-full max-w-4xl mx-auto"
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0 relative">
                    <AspectRatio ratio={16/9}>
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="object-cover w-full h-full rounded-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', image.image_url);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </AspectRatio>
                    {(image.title || image.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                        <h3 className="text-white text-xl font-semibold mb-2">{image.title}</h3>
                        {image.description && (
                          <p className="text-white/90 text-sm">{image.description}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};
