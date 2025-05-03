
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  weight_grams: z.coerce.number().positive('Weight must be positive'),
  type: z.enum(['gold', 'silver']),
  purity: z.enum(['18k', '20k', '22k', '24k']),
});

type FormValues = z.infer<typeof formSchema>;

interface JewelryFormProps {
  item?: {
    id: string;
    name: string;
    weight_grams: number;
    type: 'gold' | 'silver';
    purity: '18k' | '20k' | '22k' | '24k';
    photo_url: string | null;
  };
  onSuccess: () => void;
}

export const JewelryForm = ({ item, onSuccess }: JewelryFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(item?.photo_url || null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      weight_grams: item?.weight_grams || 0,
      type: item?.type || 'gold',
      purity: item?.purity || '22k',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should not exceed 5MB',
        variant: 'destructive',
      });
      return;
    }

    setPhotoFile(file);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;
    
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `jewelry/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('jewelry')
      .upload(filePath, photoFile);
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from('jewelry').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setUploading(true);
      
      // Upload photo if provided
      let photoUrl = item?.photo_url || null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }
      
      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('jewelry_items')
          .update({
            ...data,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);
          
        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase.from('jewelry_items').insert({
          ...data,
          photo_url: photoUrl,
        });
        
        if (error) throw error;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving jewelry item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save jewelry item',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Photo</Label>
          <div className="flex flex-col items-center gap-4">
            {photoPreview ? (
              <div className="relative w-40 h-40 overflow-hidden rounded-md">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-40 h-40 bg-muted rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No image</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="photo-upload"
                className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-9 items-center justify-center rounded-md px-3"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Label>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight_grams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (grams)</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purity</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="18k">18k</SelectItem>
                      <SelectItem value="20k">20k</SelectItem>
                      <SelectItem value="22k">22k</SelectItem>
                      <SelectItem value="24k">24k</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Jewelry Item'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
