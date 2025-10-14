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
    // Create a professional HTML receipt
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Receipt - ${receipt.bookings.booking_code}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #d4af37;
            font-size: 32px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .receipt-title {
            text-align: center;
            background: #d4af37;
            color: white;
            padding: 15px;
            margin: 20px 0;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .booking-code {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 2px dashed #d4af37;
        }
        .info-section {
            margin: 25px 0;
        }
        .info-section h3 {
            color: #d4af37;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 16px;
            text-transform: uppercase;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            width: 40%;
        }
        .info-value {
            color: #333;
            width: 60%;
            text-align: right;
        }
        .amount-section {
            background: #f9f9f9;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #d4af37;
        }
        .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 18px;
        }
        .amount-label {
            font-weight: bold;
            color: #555;
        }
        .amount-value {
            font-weight: bold;
            color: #28a745;
            font-size: 22px;
        }
        .notes-section {
            background: #fffbf0;
            border: 1px solid #d4af37;
            padding: 15px;
            margin: 20px 0;
        }
        .notes-section h4 {
            color: #d4af37;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #d4af37;
            color: #666;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .thank-you {
            font-size: 18px;
            font-weight: bold;
            color: #d4af37;
            margin-bottom: 10px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>⭐ Shree Ambabai Jewellers ⭐</h1>
            <p>Premium Gold & Jewellery Booking</p>
        </div>

        <div class="receipt-title">
            ${language === 'mr' ? 'बुकिंग रसीद' : 'BOOKING RECEIPT'}
        </div>

        <div class="booking-code">
            ${language === 'mr' ? 'बुकिंग क्रमांक' : 'BOOKING NO'}: ${receipt.bookings.booking_code}
        </div>

        <div class="info-section">
            <h3>${language === 'mr' ? '📅 रसीद माहिती' : '📅 Receipt Information'}</h3>
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'रसीद तारीख' : 'Receipt Date'}:</span>
                <span class="info-value">${new Date(receipt.created_at).toLocaleDateString(
                  language === 'mr' ? 'mr-IN' : 'en-IN',
                  { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                )}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>${language === 'mr' ? '👤 ग्राहक तपशील' : '👤 Customer Details'}</h3>
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'नाव' : 'Name'}:</span>
                <span class="info-value">${receipt.bookings.full_name}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>${language === 'mr' ? '💍 बुकिंग तपशील' : '💍 Booking Details'}</h3>
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'बुकिंग प्रकार' : 'Booking Type'}:</span>
                <span class="info-value">${getBookingTypeLabel(receipt.bookings.booking_type)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'सोन्याचे वजन' : 'Gold Weight'}:</span>
                <span class="info-value">${receipt.bookings.gold_weight} ${language === 'mr' ? 'ग्रॅम' : 'grams'}</span>
            </div>
            ${receipt.jewelry_name ? `
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'दागिन्याचे नाव' : 'Jewelry Name'}:</span>
                <span class="info-value">${receipt.jewelry_name}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">${language === 'mr' ? 'स्थिती' : 'Status'}:</span>
                <span class="info-value" style="color: #28a745; font-weight: bold;">${language === 'mr' ? '✓ पुष्टी केलेले' : '✓ CONFIRMED'}</span>
            </div>
        </div>

        <div class="amount-section">
            <div class="amount-row">
                <span class="amount-label">${language === 'mr' ? '💰 भुगतान केलेली रक्कम' : '💰 Amount Paid'}:</span>
                <span class="amount-value">${formatCurrency(receipt.paid_amount)}</span>
            </div>
        </div>

        ${receipt.notes ? `
        <div class="notes-section">
            <h4>${language === 'mr' ? '📝 टिप्पण्या' : '📝 Notes'}:</h4>
            <p>${receipt.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p class="thank-you">${language === 'mr' ? '🙏 धन्यवाद! 🙏' : '🙏 Thank You! 🙏'}</p>
            <p>${language === 'mr' ? 'आमच्यावर विश्वास ठेवल्याबद्दल धन्यवाद' : 'Thank you for trusting us with your precious jewelry booking'}</p>
            <p style="margin-top: 15px; font-size: 12px;">${language === 'mr' ? 'ही संगणक-निर्मित पावती आहे' : 'This is a computer-generated receipt'}</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Create blob and open in new window for printing/downloading
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }

    toast({
      title: language === 'mr' ? 'रसीद तयार झाली' : 'Receipt Ready',
      description: language === 'mr' ? 'तुमची बुकिंग रसीद प्रिंट/डाउनलोड साठी तयार आहे' : 'Your booking receipt is ready to print/download',
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
              <div className="flex gap-2">
                <Badge variant="default">
                  {language === 'mr' ? 'पुष्टी केलेले' : 'Confirmed'}
                </Badge>
                <Button 
                  onClick={() => handleDownloadReceipt(receipt)}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'mr' ? 'डाउनलोड' : 'Download'}
                </Button>
              </div>
            </div>
            <CardDescription>
              {new Date(receipt.created_at).toLocaleDateString(
                language === 'mr' ? 'mr-IN' : 'en-IN',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'नाव' : 'Name'}</p>
                <p className="font-medium">{receipt.bookings.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'प्रकार' : 'Type'}</p>
                <p className="font-medium">{getBookingTypeLabel(receipt.bookings.booking_type)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'वजन' : 'Weight'}</p>
                <p className="font-medium">{receipt.bookings.gold_weight}g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'भुगतान केलेली रक्कम' : 'Paid Amount'}</p>
                <p className="font-medium text-green-600">{formatCurrency(receipt.paid_amount)}</p>
              </div>
            </div>
            {receipt.jewelry_name && (
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'दागिन्याचे नाव' : 'Jewelry Name'}</p>
                <p className="font-medium">{receipt.jewelry_name}</p>
              </div>
            )}
            {receipt.notes && (
              <div>
                <p className="text-sm text-muted-foreground">{language === 'mr' ? 'टिप्पण्या' : 'Notes'}</p>
                <p className="text-muted-foreground">{receipt.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};