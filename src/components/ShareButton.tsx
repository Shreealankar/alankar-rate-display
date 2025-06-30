
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share, Facebook, Instagram, Twitter, WhatsApp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const ShareButton = ({ 
  title, 
  description, 
  url = window.location.href, 
  imageUrl,
  variant = 'outline',
  size = 'sm'
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareText = `${title}\n\n${description}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const handleShare = async (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        await copyToClipboard();
        toast({
          title: 'Copied to clipboard',
          description: 'Share this content on Instagram by pasting the copied text',
        });
        setIsOpen(false);
        return;
      case 'copy':
        await copyToClipboard();
        return;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: description,
              url,
            });
            setIsOpen(false);
            return;
          } catch (error) {
            console.log('Native sharing failed, falling back to copy');
          }
        }
        await copyToClipboard();
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${shareText}\n\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to clipboard',
        description: 'Share content has been copied to your clipboard',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
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
          <WhatsApp className="h-4 w-4" />
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
