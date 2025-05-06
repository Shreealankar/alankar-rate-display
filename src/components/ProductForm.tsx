import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// Product categories from the database enum
const productCategories = [
  'necklace',
  'ring',
  'earring',
  'bracelet',
  'pendant',
  'other',
] as const;

// Metal types
const metalTypes = ['gold', 'silver'] as const;

// Purity options
const purityOptions = ['18k', '20k', '22k', '24k'] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Product name is required'),
  category: z.enum(productCategories),
  type: z.enum(metalTypes),
  purity: z.enum(purityOptions),
  weight_grams: z.coerce.number().positive('Weight must be positive'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: {
    id: string;
    title: string;
    category: typeof productCategories[number];
    type: typeof metalTypes[number];
    purity: typeof purityOptions[number];
    weight_grams: number;
    description?: string;
    image_url: string | null;
  };
  onSuccess: () => void;
}

export const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || '',
      category: product?.category || 'necklace',
      type: product?.type || 'gold',
      purity: product?.purity || '22k',
      weight_grams: product?.weight_grams || 0,
      description: product?.description || '',
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

    setImageFile(file);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    try {
      // Store the image as a base64 string
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to process image');
    }
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      setUploading(true);
      
      // Upload image if provided
      let imageUrl = product?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            title: formData.title,
            category: formData.category,
            type: formData.type,
            purity: formData.purity,
            weight_grams: formData.weight_grams,
            description: formData.description,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
      } else {
        // Create new product
        const { error } = await supabase.from('products').insert({
          title: formData.title,
          category: formData.category,
          type: formData.type,
          purity: formData.purity,
          weight_grams: formData.weight_grams,
          description: formData.description,
          image_url: imageUrl,
        });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
      }
      
      onSuccess();
      toast({
        title: 'Success',
        description: product ? 'Product updated successfully' : 'Product added successfully',
      });
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product: ' + (error.message || error.error_description || 'Unknown error'),
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
          <Label>Product Image</Label>
          <div className="flex flex-col items-center gap-4">
            {imagePreview ? (
              <div className="relative w-40 h-40 overflow-hidden rounded-md">
                <img
                  src={imagePreview}
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
                id="image-upload"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-9 items-center justify-center rounded-md px-3"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Label>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metal Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {metalTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                      {purityOptions.map((purity) => (
                        <SelectItem key={purity} value={purity}>{purity}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe the product..."
                  className="min-h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
