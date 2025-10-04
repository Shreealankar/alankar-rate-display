import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Receipt, Package, Phone, Mail, LogOut, IndianRupee, Calendar, ShoppingBag, Edit, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingsList } from '@/components/BookingsList';

interface CustomerDashboardProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const CustomerDashboard = ({ user, profile, onSignOut }: CustomerDashboardProps) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<any[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomerData();
  }, [user]);

  const fetchCustomerData = async () => {
    if (!user || profile?.is_guest) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if profile exists and has phone, if not try to create/update it
      let customerPhone = profile?.phone;
      let customerEmail = profile?.email || user?.email;
      let customerProfile = profile;

      console.log('CustomerDashboard - User:', user?.email);
      console.log('CustomerDashboard - Profile:', profile);
      console.log('CustomerDashboard - Customer phone:', customerPhone);
      console.log('CustomerDashboard - Customer email:', customerEmail);

      // If no profile phone but user has email that matches owner email, use owner phone
      if (!customerPhone && user?.email === 'kiranjadhav3230@gmail.com') {
        customerPhone = '9921612155';
        
        // Update or create profile with correct phone
        const { data: updatedProfile, error: profileError } = await supabase
          .from('customer_profiles')
          .upsert({
            user_id: user.id,
            email: user.email,
            phone: customerPhone,
            name: profile?.name || 'Kiran Jadhav',
            is_owner: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (!profileError && updatedProfile) {
          customerProfile = updatedProfile;
          customerPhone = updatedProfile.phone;
        }
      }

      // Fetch bills for this customer using multiple strategies
      let billsData, billsError;
      
      if (customerPhone) {
        // Primary: Search by phone number
        const result = await supabase
          .from('bills')
          .select('*, bill_items(*)')
          .eq('customer_phone', customerPhone)
          .order('created_at', { ascending: false });
        billsData = result.data;
        billsError = result.error;
      } else if (customerEmail) {
        // Secondary: Search by email or name patterns
        const emailName = customerEmail.split('@')[0];
        const customerName = profile?.name || '';
        
        // Try multiple search patterns
        const searchPatterns = [];
        if (customerName) searchPatterns.push(`customer_name.ilike.%${customerName}%`);
        if (emailName) searchPatterns.push(`customer_name.ilike.%${emailName}%`);
        
        console.log('CustomerDashboard - Search patterns:', searchPatterns);
        console.log('CustomerDashboard - Customer name:', customerName);
        console.log('CustomerDashboard - Email name:', emailName);
        
        if (searchPatterns.length > 0) {
          const result = await supabase
            .from('bills')
            .select('*, bill_items(*)')
            .or(searchPatterns.join(','))
            .order('created_at', { ascending: false });
          billsData = result.data;
          billsError = result.error;
          console.log('CustomerDashboard - Bills search result:', billsData);
        } else {
          billsData = [];
          billsError = null;
        }
      } else {
        billsData = [];
        billsError = null;
      }

      if (billsError) throw billsError;

      setBills(billsData || []);

      // Calculate totals
      const totalBillDue = (billsData || []).reduce((sum, bill) => sum + (bill.balance_amount || 0), 0);

      setTotalDue(totalBillDue);

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('deviceId');
      localStorage.removeItem('guestLogin');
      localStorage.removeItem('ownerLogin');
      onSignOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          name: editName,
          phone: editPhone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('profile.updated'),
        description: t('profile.updateSuccess'),
      });
      setEditingProfile(false);
      // Refresh the data
      fetchCustomerData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('profile.error'),
        description: t('profile.updateError'),
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile?.is_guest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome, Guest!</CardTitle>
            <CardDescription>
              You are browsing as a guest. Create an account to view your purchases and bills.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>As a guest, you can:</p>
            <ul className="list-disc list-inside text-left space-y-2 max-w-md mx-auto">
              <li>Browse our jewelry collection</li>
              <li>View current gold and silver rates</li>
              <li>Contact us for inquiries</li>
            </ul>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/jewelry')}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Jewelry
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.name || user?.email}</h1>
          <p className="text-muted-foreground">Your personal dashboard</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Due</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding bill payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(bills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0))}</div>
            <p className="text-xs text-muted-foreground">
              Total amount paid across all bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customer.totalBills')}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('customer.purchaseHistory')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">{t('customer.profile')}</TabsTrigger>
          <TabsTrigger value="bookings">
            {language === 'mr' ? 'बुकिंग' : 'Bookings'}
          </TabsTrigger>
          <TabsTrigger value="bills">{t('customer.bills')}</TabsTrigger>
          <TabsTrigger value="purchases">{t('customer.purchases')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('customer.profileInfo')}</CardTitle>
                <CardDescription>{t('customer.accountDetails')}</CardDescription>
              </div>
              <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('customer.editProfile')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('customer.editProfile')}</DialogTitle>
                    <DialogDescription>{t('customer.editProfileDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">{t('customer.name')}</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={t('customer.enterName')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">{t('customer.mobile')}</Label>
                      <Input
                        id="edit-phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder={t('customer.enterMobile')}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} className="flex-1">
                        {t('customer.saveChanges')}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">
                        {t('customer.cancel')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.name || t('customer.customer')}</h3>
                  <p className="text-muted-foreground">{t('customer.valuedCustomer')}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.phone || t('customer.notProvided')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{t('customer.joined')} {formatDate(profile?.created_at || user?.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'mr' ? 'माझी बुकिंग' : 'My Bookings'}</CardTitle>
              <CardDescription>
                {language === 'mr' ? 'तुमची सर्व सोने आणि दागिन्यांची बुकिंग पहा' : 'View all your gold and jewellery bookings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.billsInvoices')}</CardTitle>
              <CardDescription>{t('customer.billsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('customer.noBills')}</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {bills.map((bill) => (
                      <div key={bill.id} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBill(bill)}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{t('customer.billNumber')} #{bill.bill_number}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(bill.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={bill.balance_amount > 0 ? "destructive" : "default"}>
                              {bill.balance_amount > 0 ? t('customer.pending') : t('customer.paid')}
                            </Badge>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>{t('customer.total')}: {formatCurrency(bill.final_amount)}</div>
                          <div>{t('customer.paid')}: {formatCurrency(bill.paid_amount)}</div>
                          <div>{t('customer.balance')}: {formatCurrency(bill.balance_amount)}</div>
                          <div>{t('customer.items')}: {bill.bill_items?.length || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Bill Details Dialog */}
          <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('customer.billDetails')} #{selectedBill?.bill_number}</DialogTitle>
                <DialogDescription>{formatDate(selectedBill?.created_at)}</DialogDescription>
              </DialogHeader>
              {selectedBill && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('customer.customerName')}</Label>
                      <p className="font-medium">{selectedBill.customer_name}</p>
                    </div>
                    <div>
                      <Label>{t('customer.phone')}</Label>
                      <p className="font-medium">{selectedBill.customer_phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label>{t('customer.billItems')}</Label>
                    {selectedBill.bill_items && selectedBill.bill_items.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {selectedBill.bill_items.map((item: any, index: number) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{item.item_name}</p>
                                <p className="text-sm text-muted-foreground">{item.metal_type} - {item.purity}</p>
                                <p className="text-sm">{item.weight_grams}g @ {formatCurrency(item.rate_per_gram)}/g</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(item.total_amount)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{t('customer.noItems')}</p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('customer.totalAmount')}</Label>
                      <p className="text-lg font-bold">{formatCurrency(selectedBill.final_amount)}</p>
                    </div>
                    <div>
                      <Label>{t('customer.paidAmount')}</Label>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedBill.paid_amount)}</p>
                    </div>
                    <div>
                      <Label>{t('customer.balanceAmount')}</Label>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(selectedBill.balance_amount)}</p>
                    </div>
                    <div>
                      <Label>{t('customer.paymentMethod')}</Label>
                      <p className="capitalize">{selectedBill.payment_method}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>


        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.purchaseHistory')}</CardTitle>
              <CardDescription>{t('customer.purchaseHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('customer.noPurchases')}</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {bills.map((bill) => (
                      <div key={bill.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">{t('customer.billNumber')} #{bill.bill_number}</h4>
                          <span className="text-sm text-muted-foreground">{formatDate(bill.created_at)}</span>
                        </div>
                        {bill.bill_items && bill.bill_items.length > 0 && (
                          <div className="space-y-3">
                            {bill.bill_items.map((item: any, index: number) => (
                              <div key={index} className="bg-muted/50 p-3 rounded">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{item.item_name}</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {item.metal_type} - {item.purity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{formatCurrency(item.total_amount)}</div>
                                    <div className="text-sm text-muted-foreground">{item.weight_grams}g</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};