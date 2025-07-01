
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  isRateShare?: boolean;
}

export const ShareButton = ({ 
  title, 
  description, 
  url,
  imageUrl,
  variant = 'outline',
  size = 'sm',
  isRateShare = false
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Website and social media links
  const websiteUrl = 'https://shreealankar.lovable.app';
  const instagramUrl = 'https://www.instagram.com/shreealankar2112/?igsh=bjRpNDVueDU3N2xw#';
  const youtubeUrl = 'http://www.youtube.com/@Shreealankar2112';
  
  // Enhanced share text with social media links and location for rates
  const socialLinks = `\n\n📱 Follow us:\nInstagram: ${instagramUrl}\nYouTube: ${youtubeUrl}`;
  const locationInfo = isRateShare ? '\n📍 Location: Lohoner' : '';
  const websiteInfo = `\n🌐 Visit: ${websiteUrl}`;
  
  const shareText = `${title}\n\n${description}${locationInfo}${websiteInfo}${socialLinks}`;
  const encodedText = encodeURIComponent(shareText);
  
  // Always use the main website URL instead of current page URL
  const finalShareUrl = websiteUrl;
  const encodedUrl = encodeURIComponent(finalShareUrl);

  const handleShare = async (platform: string) => {
    try {
      let platformShareUrl = '';
      
      switch (platform) {
        case 'whatsapp':
          // For WhatsApp, include image URL in the message if available
          const whatsappText = imageUrl && !isRateShare 
            ? `${shareText}\n\n📸 Image: ${imageUrl}`
            : shareText;
          const encodedWhatsAppText = encodeURIComponent(whatsappText);
          platformShareUrl = `https://wa.me/?text=${encodedWhatsAppText}`;
          break;
        case 'facebook':
          platformShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'twitter':
          platformShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
        case 'instagram':
          // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
          await copyToClipboard();
          toast({
            title: 'Copied to clipboard',
            description: 'Share this content on Instagram by pasting the copied text. Don\'t forget to include the image!',
          });
          setIsOpen(false);
          return;
        case 'copy':
          await copyToClipboard();
          return;
        case 'native':
          if (navigator.share) {
            try {
              const shareData: any = {
                title,
                text: shareText,
                url: finalShareUrl,
              };
              
              // Add image to share data if available (some browsers support this)
              if (imageUrl && !isRateShare) {
                try {
                  const response = await fetch(imageUrl);
                  const blob = await response.blob();
                  const file = new File([blob], 'product-image.jpg', { type: blob.type });
                  shareData.files = [file];
                } catch (error) {
                  console.log('Could not add image to native share:', error);
                }
              }
              
              await navigator.share(shareData);
              setIsOpen(false);
              return;
            } catch (error) {
              console.log('Native sharing failed, falling back to copy:', error);
              await copyToClipboard();
              return;
            }
          }
          await copyToClipboard();
          return;
      }

      if (platformShareUrl) {
        // Open in new window to prevent page reload
        const newWindow = window.open(platformShareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
        if (!newWindow) {
          toast({
            title: 'Popup blocked',
            description: 'Please allow popups for sharing to work properly',
            variant: 'destructive',
          });
        }
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error during sharing:', error);
      toast({
        title: 'Sharing failed',
        description: 'There was an error while sharing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = imageUrl && !isRateShare 
        ? `${shareText}\n\n📸 Image: ${imageUrl}`
        : shareText;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to clipboard',
        description: 'Share content has been copied to your clipboard',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = imageUrl && !isRateShare 
          ? `${shareText}\n\n📸 Image: ${imageUrl}`
          : shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: 'Copied to clipboard',
          description: 'Share content has been copied to your clipboard',
        });
        setIsOpen(false);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy to clipboard. Please try sharing manually.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="flex items-center gap-2">
          <Facebook className="h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')} className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          Instagram
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare('native')} className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            More Options
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('copy')} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
