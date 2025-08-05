import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Receipt, Package, Phone, Mail, LogOut, IndianRupee, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CustomerDashboardProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const CustomerDashboard = ({ user, profile, onSignOut }: CustomerDashboardProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
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
      let customerProfile = profile;

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

      // Fetch bills for this customer using phone or fallback to email-based search
      let billsData, billsError;
      
      if (customerPhone) {
        const result = await supabase
          .from('bills')
          .select('*, bill_items(*)')
          .eq('customer_phone', customerPhone)
          .order('created_at', { ascending: false });
        billsData = result.data;
        billsError = result.error;
      } else {
        // If no phone, try to find bills by customer name or email
        const result = await supabase
          .from('bills')
          .select('*, bill_items(*)')
          .or(`customer_name.ilike.%${profile?.name || user?.email?.split('@')[0]}%`)
          .order('created_at', { ascending: false });
        billsData = result.data;
        billsError = result.error;
      }

      if (billsError) throw billsError;

      // Fetch borrowings for this customer using the same phone logic
      let borrowingsData, borrowingsError;
      
      if (customerPhone) {
        const result = await supabase
          .from('borrowings')
          .select('*')
          .eq('customer_phone', customerPhone)
          .order('created_at', { ascending: false });
        borrowingsData = result.data;
        borrowingsError = result.error;
      } else {
        // If no phone, try to find borrowings by customer name
        const result = await supabase
          .from('borrowings')
          .select('*')
          .or(`customer_name.ilike.%${profile?.name || user?.email?.split('@')[0]}%`)
          .order('created_at', { ascending: false });
        borrowingsData = result.data;
        borrowingsError = result.error;
      }

      if (borrowingsError) throw borrowingsError;

      setBills(billsData || []);
      setBorrowings(borrowingsData || []);

      // Calculate totals
      const totalBillDue = (billsData || []).reduce((sum, bill) => sum + (bill.balance_amount || 0), 0);
      const totalBorrowingBalance = (borrowingsData || []).reduce((sum, borrowing) => sum + (borrowing.balance_amount || 0), 0);

      setTotalDue(totalBillDue);
      setTotalBorrowed(totalBorrowingBalance);

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
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground">
              Active borrowings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">
              Purchase history
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="borrowings">Borrowings</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.name || 'Customer'}</h3>
                  <p className="text-muted-foreground">Valued Customer</p>
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
                  <span>{profile?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(profile?.created_at || user?.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bills & Invoices</CardTitle>
              <CardDescription>Your purchase bills and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bills found for your account.</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {bills.map((bill) => (
                      <div key={bill.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Bill #{bill.bill_number}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(bill.created_at)}</p>
                          </div>
                          <Badge variant={bill.balance_amount > 0 ? "destructive" : "default"}>
                            {bill.balance_amount > 0 ? "Pending" : "Paid"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Total: {formatCurrency(bill.final_amount)}</div>
                          <div>Paid: {formatCurrency(bill.paid_amount)}</div>
                          <div>Balance: {formatCurrency(bill.balance_amount)}</div>
                          <div>Items: {bill.bill_items?.length || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Borrowings</CardTitle>
              <CardDescription>Your borrowing history and outstanding amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {borrowings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No borrowings found for your account.</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {borrowings.map((borrowing) => (
                      <div key={borrowing.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Borrowing</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(borrowing.borrowed_date)}</p>
                          </div>
                          <Badge variant={borrowing.status === 'active' ? "default" : "secondary"}>
                            {borrowing.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Borrowed: {formatCurrency(borrowing.borrowed_amount)}</div>
                          <div>Interest: {borrowing.interest_rate}%</div>
                          <div>Paid: {formatCurrency(borrowing.paid_amount)}</div>
                          <div>Balance: {formatCurrency(borrowing.balance_amount)}</div>
                        </div>
                        {borrowing.due_date && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Due: {formatDate(borrowing.due_date)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Detailed view of your jewelry purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No purchases found.</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {bills.map((bill) => (
                      <div key={bill.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Bill #{bill.bill_number}</h4>
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