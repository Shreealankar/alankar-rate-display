import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Receipt, Download, Calendar, IndianRupee, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BookingReceiptsList = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();

    // Subscribe to real-time updates for both tables
    const receiptsChannel = supabase
      .channel('booking_receipts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_receipts'
        },
        () => {
          fetchReceipts();
        }
      )
      .subscribe();
    
    const bookingsChannel = supabase
      .channel('bookings_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchReceipts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(receiptsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch receipts with booking details for confirmed bookings only
      const { data, error } = await (supabase as any)
        .from('booking_receipts')
        .select(`
          *,
          bookings!inner (
            booking_code,
            full_name,
            status,
            booking_type,
            gold_weight,
            customer_id
          )
        `)
        .eq('bookings.customer_id', profile.id)
        .eq('bookings.status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching booking receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getBookingTypeLabel = (type: string) => {
    const labels = {
      '24k_gold_995': language === 'mr' ? '२४ कॅरेट ९९५' : '24K Gold 995',
      '24k_gold_normal': language === 'mr' ? '२४ कॅरेट सामान्य' : '24K Gold Normal',
      'gold_jewellery': language === 'mr' ? 'सोन्याचे दागिने' : 'Gold Jewellery',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleDownloadReceipt = (receipt: any) => {
    // Create a simple text receipt
    const receiptText = `
═══════════════════════════════════════════
    ${language === 'mr' ? 'बुकिंग रसीद' : 'BOOKING RECEIPT'}
═══════════════════════════════════════════

${language === 'mr' ? 'बुकिंग कोड' : 'Booking Code'}: ${receipt.bookings.booking_code}
${language === 'mr' ? 'तारीख' : 'Date'}: ${new Date(receipt.created_at).toLocaleDateString(
      language === 'mr' ? 'mr-IN' : 'en-IN',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )}

${language === 'mr' ? 'ग्राहक माहिती' : 'Customer Information'}:
${language === 'mr' ? 'नाव' : 'Name'}: ${receipt.bookings.full_name}

${language === 'mr' ? 'बुकिंग तपशील' : 'Booking Details'}:
${language === 'mr' ? 'प्रकार' : 'Type'}: ${getBookingTypeLabel(receipt.bookings.booking_type)}
${language === 'mr' ? 'वजन' : 'Weight'}: ${receipt.bookings.gold_weight}g
${receipt.jewelry_name ? `${language === 'mr' ? 'दागिन्याचे नाव' : 'Jewelry Name'}: ${receipt.jewelry_name}\n` : ''}
${language === 'mr' ? 'भुगतान केलेली रक्कम' : 'Paid Amount'}: ${formatCurrency(receipt.paid_amount)}

${receipt.notes ? `${language === 'mr' ? 'टिप्पण्या' : 'Notes'}: ${receipt.notes}\n` : ''}
═══════════════════════════════════════════
${language === 'mr' ? 'धन्यवाद!' : 'Thank you for your business!'}
═══════════════════════════════════════════
    `.trim();

    // Create blob and download
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-receipt-${receipt.bookings.booking_code}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: language === 'mr' ? 'रसीद डाउनलोड झाली' : 'Receipt Downloaded',
      description: language === 'mr' ? 'तुमची बुकिंग रसीद यशस्वीरीत्या डाउनलोड झाली' : 'Your booking receipt has been downloaded successfully',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {language === 'mr' ? 'अजून कोणतीही बुकिंग रसीद नाही' : 'No booking receipts yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'mr' 
              ? 'रसीद फक्त पुष्टी केलेल्या बुकिंगसाठी उपलब्ध आहेत' 
              : 'Receipts are available only for confirmed bookings'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {receipts.map((receipt) => (
        <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-500" />
                {receipt.bookings.booking_code}
              </CardTitle>
              <Badge variant="default">
                {language === 'mr' ? 'पुष्टी केलेले' : 'Confirmed'}
              </Badge>
            </div>
            <CardDescription>
              {new Date(receipt.created_at).toLocaleDateString(
                language === 'mr' ? 'mr-IN' : 'en-IN',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'mr' ? 'प्रकार' : 'Type'}
                  </p>
                  <p className="font-medium">{getBookingTypeLabel(receipt.bookings.booking_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'mr' ? 'भुगतान केलेली रक्कम' : 'Paid Amount'}
                  </p>
                  <p className="font-medium text-green-600">{formatCurrency(receipt.paid_amount)}</p>
                </div>
              </div>
            </div>
            {receipt.jewelry_name && (
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">
                  {language === 'mr' ? 'दागिन्याचे नाव' : 'Jewelry Name'}
                </p>
                <p className="font-medium">{receipt.jewelry_name}</p>
              </div>
            )}
            {receipt.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">
                  {language === 'mr' ? 'टिप्पण्या' : 'Notes'}
                </p>
                <p className="text-muted-foreground">{receipt.notes}</p>
              </div>
            )}
            <Button 
              onClick={() => handleDownloadReceipt(receipt)}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'mr' ? 'रसीद डाउनलोड करा' : 'Download Receipt'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};