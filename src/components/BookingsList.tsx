import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Calendar, Weight, CreditCard } from "lucide-react";

interface Booking {
  id: string;
  booking_code: string;
  full_name: string;
  booking_type: string;
  gold_weight: number;
  status: string;
  created_at: string;
}

export const BookingsList = () => {
  const { language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
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

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      delivered: "outline",
      cancelled: "destructive",
    };

    const labels = {
      pending: language === 'mr' ? 'प्रलंबित' : 'Pending',
      confirmed: language === 'mr' ? 'पुष्टी केलेले' : 'Confirmed',
      delivered: language === 'mr' ? 'वितरित' : 'Delivered',
      cancelled: language === 'mr' ? 'रद्द केलेले' : 'Cancelled',
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getBookingTypeLabel = (type: string) => {
    const labels = {
      '24k_gold_995': language === 'mr' ? '२४ कॅरेट ९९५' : '24K Gold 995',
      '24k_gold_normal': language === 'mr' ? '२४ कॅरेट सामान्य' : '24K Gold Normal',
      'gold_jewellery': language === 'mr' ? 'सोन्याचे दागिने' : 'Gold Jewellery',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {language === 'mr' ? 'अजून कोणतेही बुकिंग नाही' : 'No bookings yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                {booking.booking_code}
              </CardTitle>
              {getStatusBadge(booking.status)}
            </div>
            <CardDescription>
              {new Date(booking.created_at).toLocaleDateString(
                language === 'mr' ? 'mr-IN' : 'en-IN',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'mr' ? 'प्रकार' : 'Type'}
                  </p>
                  <p className="font-medium">{getBookingTypeLabel(booking.booking_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'mr' ? 'वजन' : 'Weight'}
                  </p>
                  <p className="font-medium">{booking.gold_weight}g</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
