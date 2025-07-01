
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share, Facebook, Instagram, Twitter, MessageCircle, Copy } from 'lucide-react';
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
  
  // Always use the main website URL
  const shareUrl = websiteUrl;

  const copyToClipboard = async () => {
    const textToCopy = imageUrl && !isRateShare 
      ? `${shareText}\n\n📸 Image: ${imageUrl}`
      : shareText;
      
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      toast({
        title: 'Copied to clipboard',
        description: 'Share content has been copied successfully.',
      });
      setIsOpen(false);
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await copyToClipboard();
      return;
    }

    try {
      const shareData: ShareData = {
        title,
        text: shareText,
        url: shareUrl,
      };
      
      await navigator.share(shareData);
      setIsOpen(false);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.log('Native sharing failed, copying to clipboard instead');
        await copyToClipboard();
      }
    }
  };

  const handleShare = async (platform: string) => {
    try {
      switch (platform) {
        case 'whatsapp':
          const whatsappText = imageUrl && !isRateShare 
            ? `${shareText}\n\n📸 Image: ${imageUrl}`
            : shareText;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
          
          // Try to open WhatsApp, fallback to copy
          try {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          } catch {
            await copyToClipboard();
          }
          break;
          
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          
          try {
            window.open(facebookUrl, '_blank', 'noopener,noreferrer');
          } catch {
            await copyToClipboard();
          }
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          
          try {
            window.open(twitterUrl, '_blank', 'noopener,noreferrer');
          } catch {
            await copyToClipboard();
          }
          break;
          
        case 'instagram':
          // Instagram doesn't support direct URL sharing
          await copyToClipboard();
          toast({
            title: 'Copied for Instagram',
            description: 'Content copied to clipboard. Paste it in your Instagram post and add the image manually.',
          });
          break;
          
        case 'copy':
          await copyToClipboard();
          break;
          
        case 'native':
          await handleNativeShare();
          break;
          
        default:
          await copyToClipboard();
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error during sharing:', error);
      toast({
        title: 'Sharing failed',
        description: 'Unable to share. Content has been copied to clipboard instead.',
        variant: 'destructive',
      });
      await copyToClipboard();
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
          <Copy className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
