import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Phone, UserPlus, LogIn, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomerAuthProps {
  onAuthSuccess: (user: any, profile: any) => void;
}

export const CustomerAuth = ({ onAuthSuccess }: CustomerAuthProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Special owner credentials
  const OWNER_EMAIL = 'kiranjadhav3230@gmail.com';
  const OWNER_PHONE = '9921612155';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if this is the owner credentials
      const isOwner = email === OWNER_EMAIL && phone === OWNER_PHONE;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/`,
          data: {
            name,
            phone,
            is_owner: isOwner
          }
        }
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Save device login for persistent session
        localStorage.setItem('deviceId', crypto.randomUUID());
        
        if (isOwner) {
          localStorage.setItem('ownerLogin', 'true');
          toast({
            title: "Owner Access Granted",
            description: "Welcome back, Owner! Redirecting to admin dashboard...",
          });
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        // Save device login for persistent session
        localStorage.setItem('deviceId', crypto.randomUUID());
        
        // Check if this is owner login
        if (profile?.is_owner || (email === OWNER_EMAIL)) {
          localStorage.setItem('ownerLogin', 'true');
          toast({
            title: "Owner Access Granted",
            description: "Welcome back, Owner! Redirecting to admin dashboard...",
          });
          setTimeout(() => navigate('/login'), 2000);
        } else {
          onAuthSuccess(data.user, profile);
          toast({
            title: "Welcome Back",
            description: "Successfully signed in to your account.",
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Create a guest session
      const guestId = crypto.randomUUID();
      const guestEmail = `guest_${Date.now()}@temp.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestId,
        options: {
          data: {
            name: 'Guest User',
            is_guest: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('guestLogin', 'true');
        localStorage.setItem('deviceId', crypto.randomUUID());
        
        // Create guest profile
        await supabase
          .from('customer_profiles')
          .insert({
            user_id: data.user.id,
            email: guestEmail,
            name: 'Guest User',
            is_guest: true,
            device_id: localStorage.getItem('deviceId')
          });

        onAuthSuccess(data.user, { is_guest: true, name: 'Guest User' });
        
        toast({
          title: "Guest Access",
          description: "Welcome! You're browsing as a guest.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Guest Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Shree Alankar</CardTitle>
          <CardDescription>
            Login to view your jewelry purchases and bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {email === OWNER_EMAIL && phone === OWNER_PHONE && (
                  <Alert>
                    <AlertDescription className="text-yellow-600">
                      Owner credentials detected. This will create an admin account.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <User className="mr-2 h-4 w-4" />
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};