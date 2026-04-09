
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        setError(error.message);
        throw error;
      }
      setImages(data || []);
    } catch (error) {
      setError('Failed to load carousel images');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container px-4">
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || images.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Gallery</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Our Collection</h2>
        </div>
        
        <Carousel 
          className="w-full max-w-5xl mx-auto"
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
                <div className="card-luxury overflow-hidden group">
                  <AspectRatio ratio={16/9}>
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </AspectRatio>
                  {(image.title || image.description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
                      <h3 className="font-display text-foreground text-xl font-semibold mb-1">{image.title}</h3>
                      {image.description && (
                        <p className="text-muted-foreground text-sm">{image.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-primary" />
              <CarouselNext className="border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-primary" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};
