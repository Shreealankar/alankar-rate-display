import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Calendar, Weight, CreditCard, Mail, Phone, MapPin, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Booking {
  id: string;
  booking_code: string;
  full_name: string;
  primary_mobile: string;
  secondary_mobile?: string;
  email: string;
  full_address: string;
  booking_type: string;
  gold_weight: number;
  status: string;
  created_at: string;
}

export const OwnerBookingsManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('owner_bookings_changes')
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
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'mr' ? 'बुकिंग व्यवस्थापन' : 'Bookings Management'}
        </h2>
        <Badge variant="outline">{bookings.length} Total</Badge>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {language === 'mr' ? 'अजून कोणतेही बुकिंग नाही' : 'No bookings yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                    {booking.booking_code}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateBookingStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                        </SelectItem>
                        <SelectItem value="confirmed">
                          {language === 'mr' ? 'पुष्टी केलेले' : 'Confirmed'}
                        </SelectItem>
                        <SelectItem value="delivered">
                          {language === 'mr' ? 'वितरित' : 'Delivered'}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {language === 'mr' ? 'रद्द केलेले' : 'Cancelled'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details - {booking.booking_code}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Customer Name</p>
                                  <p className="font-medium">{booking.full_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Primary Mobile</p>
                                  <p className="font-medium">{booking.primary_mobile}</p>
                                </div>
                              </div>
                              {booking.secondary_mobile && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Secondary Mobile</p>
                                    <p className="font-medium">{booking.secondary_mobile}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Email</p>
                                  <p className="font-medium">{booking.email}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Booking Type</p>
                                  <p className="font-medium">{getBookingTypeLabel(booking.booking_type)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Weight className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Weight</p>
                                  <p className="font-medium">{booking.gold_weight}g</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Booking Date</p>
                                  <p className="font-medium">
                                    {new Date(booking.created_at).toLocaleDateString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-xs text-muted-foreground">Full Address</p>
                              <p className="font-medium">{booking.full_address}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardDescription>
                  {new Date(booking.created_at).toLocaleDateString(
                    language === 'mr' ? 'mr-IN' : 'en-IN',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Customer</p>
                      <p className="font-medium truncate">{booking.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Mobile</p>
                      <p className="font-medium">{booking.primary_mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Type</p>
                      <p className="font-medium">{getBookingTypeLabel(booking.booking_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-medium">{booking.gold_weight}g</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
