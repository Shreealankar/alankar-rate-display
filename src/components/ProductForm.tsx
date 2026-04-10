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
import { Loader2, Upload, Sparkles } from 'lucide-react';
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

const productCategories = ['necklace', 'ring', 'earring', 'bracelet', 'pendant', 'other'] as const;
const metalTypes = ['gold', 'silver'] as const;
const purityOptions = ['18k', '20k', '22k', '24k'] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Product name is required'),
  name_marathi: z.string().optional(),
  category: z.enum(productCategories),
  type: z.enum(metalTypes),
  purity: z.enum(purityOptions),
  weight_grams: z.coerce.number().positive('Weight must be positive'),
  description: z.string().optional(),
  description_marathi: z.string().optional(),
  stone_charges: z.coerce.number().min(0).optional(),
  making_charges_manual: z.coerce.number().min(0).optional(),
  other_charges: z.coerce.number().min(0).optional(),
  huid_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: {
    id: string;
    title: string;
    name_marathi?: string | null;
    category: typeof productCategories[number];
    type: typeof metalTypes[number];
    purity: typeof purityOptions[number];
    weight_grams: number;
    description?: string | null;
    image_url: string | null;
    stone_charges?: number | null;
    making_charges_manual?: number | null;
    other_charges?: number | null;
    huid_number?: string | null;
  };
  onSuccess: () => void;
}

export const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || '',
      name_marathi: product?.name_marathi || '',
      category: product?.category || 'necklace',
      type: product?.type || 'gold',
      purity: product?.purity || '22k',
      weight_grams: product?.weight_grams || 0,
      description: product?.description || '',
      description_marathi: '',
      stone_charges: product?.stone_charges || 0,
      making_charges_manual: product?.making_charges_manual || 0,
      other_charges: product?.other_charges || 0,
      huid_number: product?.huid_number || '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size should not exceed 5MB', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const fileReader = new FileReader();
    fileReader.onload = (e) => setImagePreview(e.target?.result as string);
    fileReader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const handleAiAutofill = async () => {
    const values = form.getValues();
    if (!values.title) {
      toast({ title: 'Enter product name first', description: 'AI needs the product name to generate descriptions.', variant: 'destructive' });
      return;
    }

    try {
      setAiLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-product-autofill', {
        body: {
          title: values.title,
          category: values.category,
          type: values.type,
          purity: values.purity,
          weight_grams: values.weight_grams,
        },
      });

      if (error) throw error;

      if (data?.description_english) {
        form.setValue('description', data.description_english);
      }
      if (data?.description_marathi) {
        form.setValue('description_marathi', data.description_marathi);
      }
      if (data?.name_marathi) {
        form.setValue('name_marathi', data.name_marathi);
      }

      toast({ title: '✨ AI Autofill Complete', description: 'Descriptions generated in English & Marathi!' });
    } catch (error: any) {
      console.error('AI autofill error:', error);
      toast({ title: 'AI Autofill Failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      setUploading(true);
      let imageUrl = product?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Combine descriptions
      const fullDescription = [formData.description, formData.description_marathi].filter(Boolean).join('\n\n---\n\n');

      const productData = {
        title: formData.title,
        name_english: formData.title,
        name_marathi: formData.name_marathi || null,
        category: formData.category,
        type: formData.type,
        purity: formData.purity,
        weight_grams: formData.weight_grams,
        description: fullDescription || null,
        image_url: imageUrl,
        stone_charges: formData.stone_charges || 0,
        making_charges_manual: formData.making_charges_manual || 0,
        other_charges: formData.other_charges || 0,
        huid_number: formData.huid_number || null,
        updated_at: new Date().toISOString(),
      };

      if (product) {
        const { error } = await supabase.from('products').update(productData).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }

      onSuccess();
      toast({ title: 'Success', description: product ? 'Product updated' : 'Product added' });
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({ title: 'Error', description: 'Failed to save: ' + (error.message || 'Unknown error'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Product Image</Label>
          <div className="flex flex-col items-center gap-3">
            {imagePreview ? (
              <div className="relative w-36 h-36 overflow-hidden rounded-lg border border-border">
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-36 h-36 bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No image</p>
              </div>
            )}
            <Input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileChange} />
            <Label htmlFor="image-upload" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-8 items-center justify-center rounded-md px-3 text-sm">
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Label>
          </div>
        </div>

        {/* Product Name English */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name (English)</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Gold Necklace" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Product Name Marathi */}
        <FormField control={form.control} name="name_marathi" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name (मराठी)</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. सोन्याचा हार" className="font-marathi" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* AI Autofill Button */}
        <Button type="button" variant="outline" onClick={handleAiAutofill} disabled={aiLoading} className="w-full border-primary/30 hover:border-primary/60 hover:bg-primary/5">
          {aiLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating with AI...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2 text-primary" /> ✨ AI Autofill (English + मराठी)</>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectGroup>
                  {productCategories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Metal Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectGroup>
                  {metalTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="purity" render={({ field }) => (
            <FormItem>
              <FormLabel>Purity</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectGroup>
                  {purityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="weight_grams" render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (g)</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Charges */}
        <div className="grid grid-cols-3 gap-3">
          <FormField control={form.control} name="making_charges_manual" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Making ₹</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="stone_charges" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Stone ₹</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="other_charges" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Other ₹</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* HUID */}
        <FormField control={form.control} name="huid_number" render={({ field }) => (
          <FormItem>
            <FormLabel>HUID Number</FormLabel>
            <FormControl><Input {...field} placeholder="Hallmark HUID" /></FormControl>
          </FormItem>
        )} />

        {/* Description English */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (English)</FormLabel>
            <FormControl><Textarea {...field} placeholder="Product description..." className="min-h-20" /></FormControl>
          </FormItem>
        )} />

        {/* Description Marathi */}
        <FormField control={form.control} name="description_marathi" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (मराठी)</FormLabel>
            <FormControl><Textarea {...field} placeholder="उत्पादनाचे वर्णन..." className="min-h-20 font-marathi" /></FormControl>
          </FormItem>
        )} />

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
};
