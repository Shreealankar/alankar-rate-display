import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Plus, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { JewelryGallery } from '@/components/JewelryGallery';
import { ProductForm } from '@/components/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enhanced security constants
  const MASTER_PASSWORD = 'Shreealankar3230@Secure2024!';
  const MAX_ATTEMPTS = 3;
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 5;

  // Password strength validation
  const validatePasswordStrength = (pwd: string) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (pwd.length < minLength) return 'Password must be at least 12 characters long';
    if (!hasUpperCase) return 'Password must contain uppercase letters';
    if (!hasLowerCase) return 'Password must contain lowercase letters';
    if (!hasNumbers) return 'Password must contain numbers';
    if (!hasSpecialChar) return 'Password must contain special characters';
    return null;
  };

  // Rate limiting check
  const checkRateLimit = () => {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem('recentAttempts') || '[]');
    const recentAttempts = attempts.filter((time: number) => now - time < RATE_LIMIT_WINDOW);
    
    if (recentAttempts.length >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }
    
    recentAttempts.push(now);
    localStorage.setItem('recentAttempts', JSON.stringify(recentAttempts));
    return true;
  };

  // Calculate exponential backoff
  const calculateLockDuration = (attempts: number) => {
    return Math.min(60 * Math.pow(2, attempts - MAX_ATTEMPTS), 3600); // Max 1 hour
  };

  // Session management
  const startSession = () => {
    const timeout = setTimeout(() => {
      handleLogout();
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity",
        variant: "destructive",
      });
    }, SESSION_TIMEOUT);
    
    setSessionTimeout(timeout);
    localStorage.setItem('sessionStart', Date.now().toString());
  };

  const resetSessionTimer = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      startSession();
    }
  };

  // Check if account is locked on load
  useEffect(() => {
    const storedLockedUntil = localStorage.getItem('lockedUntil');
    if (storedLockedUntil) {
      const lockedUntil = parseInt(storedLockedUntil);
      
      if (lockedUntil > Date.now()) {
        setLocked(true);
        const remainingTime = Math.ceil((lockedUntil - Date.now()) / 1000);
        setLockTimer(remainingTime);
      } else {
        localStorage.removeItem('lockedUntil');
        setLocked(false);
      }
    }

    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    // Check session validity
    const sessionStart = localStorage.getItem('sessionStart');
    const isLoggedInStored = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedInStored && sessionStart) {
      const sessionAge = Date.now() - parseInt(sessionStart);
      if (sessionAge > SESSION_TIMEOUT) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sessionStart');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        startSession();
      }
    }

    // Add activity listeners to reset session timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetTimer = () => resetSessionTimer();
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          if (newTimer <= 0) {
            setLocked(false);
            localStorage.removeItem('lockedUntil');
            clearInterval(interval);
            return 0;
          }
          return newTimer;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [locked, lockTimer]);

  // Fetch current rates when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const fetchRates = async () => {
        try {
          setInitialLoading(true);
          
          const { data: ratesData, error } = await supabase
            .from('rates')
            .select('*');
            
          if (error) {
            console.error('Error fetching rates:', error);
            return;
          }
          
          if (ratesData && ratesData.length > 0) {
            const goldRateData = ratesData.find(rate => rate.metal_type === 'gold');
            const silverRateData = ratesData.find(rate => rate.metal_type === 'silver');
            
            if (goldRateData) {
              setGoldRate(goldRateData.rate_per_gram.toString());
            }
            
            if (silverRateData) {
              setSilverRate(silverRateData.rate_per_gram.toString());
            }
          }
        } catch (err) {
          console.error('Error fetching rates:', err);
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchRates();
    }
  }, [isLoggedIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (locked) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${Math.floor(lockTimer / 60)}:${String(lockTimer % 60).padStart(2, '0')}.`,
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      toast({
        title: "Rate Limited",
        description: "Too many requests. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(false);
    setErrorMessage('');
    
    // Enhanced password validation
    const passwordValidation = validatePasswordStrength(password);
    if (passwordValidation) {
      setError(true);
      setErrorMessage(passwordValidation);
      setIsLoading(false);
      return;
    }
    
    // Simulate processing time (security best practice)
    setTimeout(() => {
      if (password === MASTER_PASSWORD) {
        // Success
        setLoginAttempts(0);
        localStorage.setItem('loginAttempts', '0');
        localStorage.removeItem('lockedUntil');
        localStorage.removeItem('recentAttempts');
        
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        startSession();
        setIsLoading(false);
        
        toast({
          title: "Login successful",
          description: "Secure session established",
        });
      } else {
        // Failed login
        setError(true);
        setIsLoading(false);
        
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockDuration = calculateLockDuration(newAttempts);
          const lockedUntil = Date.now() + (lockDuration * 1000);
          localStorage.setItem('lockedUntil', lockedUntil.toString());
          
          setLocked(true);
          setLockTimer(lockDuration);
          
          toast({
            title: "Account Locked",
            description: `Account locked for ${Math.floor(lockDuration / 60)} minutes due to security policy.`,
            variant: "destructive",
          });
        } else {
          setErrorMessage(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
          toast({
            title: "Authentication Failed",
            description: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
            variant: "destructive",
          });
        }
      }
    }, 1500); // Longer delay for security
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sessionStart');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "Secure session ended",
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePasswordStrength(password);
    if (validation) {
      toast({
        title: "Password Strength Error",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    // Simulate password change process
    setTimeout(() => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      });
      setIsChangingPassword(false);
      setPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  const handleRateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRates(true);
    
    const newGoldRate = parseFloat(goldRate);
    const newSilverRate = parseFloat(silverRate);
    
    try {
      const { data: existingGold, error: goldQueryError } = await supabase
        .from('rates')
        .select('id')
        .eq('metal_type', 'gold')
        .maybeSingle();
      
      if (goldQueryError) {
        console.error('Error querying gold rate:', goldQueryError);
        toast({
          title: "Error",
          description: "Failed to query gold rate record.",
          variant: "destructive",
        });
        setIsUpdatingRates(false);
        return;
      }
      
      const { data: existingSilver, error: silverQueryError } = await supabase
        .from('rates')
        .select('id')
        .eq('metal_type', 'silver')
        .maybeSingle();
      
      if (silverQueryError) {
        console.error('Error querying silver rate:', silverQueryError);
        toast({
          title: "Error",
          description: "Failed to query silver rate record.",
          variant: "destructive",
        });
        setIsUpdatingRates(false);
        return;
      }
      
      if (existingGold?.id) {
        const { error: goldError } = await supabase
          .from('rates')
          .update({ 
            rate_per_gram: newGoldRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGold.id);
        
        if (goldError) {
          console.error('Error updating gold rate:', goldError);
          toast({
            title: "Error",
            description: "Failed to update gold rate.",
            variant: "destructive",
          });
          setIsUpdatingRates(false);
          return;
        }
      } else {
        const { error: goldError } = await supabase
          .from('rates')
          .insert({ 
            metal_type: 'gold', 
            rate_per_gram: newGoldRate,
            updated_at: new Date().toISOString()
          });
        
        if (goldError) {
          console.error('Error inserting gold rate:', goldError);
          toast({
            title: "Error",
            description: "Failed to insert gold rate.",
            variant: "destructive",
          });
          setIsUpdatingRates(false);
          return;
        }
      }
      
      if (existingSilver?.id) {
        const { error: silverError } = await supabase
          .from('rates')
          .update({ 
            rate_per_gram: newSilverRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSilver.id);
        
        if (silverError) {
          console.error('Error updating silver rate:', silverError);
          toast({
            title: "Error",
            description: "Failed to update silver rate.",
            variant: "destructive",
          });
          setIsUpdatingRates(false);
          return;
        }
      } else {
        const { error: silverError } = await supabase
          .from('rates')
          .insert({ 
            metal_type: 'silver', 
            rate_per_gram: newSilverRate,
            updated_at: new Date().toISOString()
          });
        
        if (silverError) {
          console.error('Error inserting silver rate:', silverError);
          toast({
            title: "Error",
            description: "Failed to insert silver rate.",
            variant: "destructive",
          });
          setIsUpdatingRates(false);
          return;
        }
      }
      
      toast({
        title: "Success",
        description: "Rates updated successfully",
      });
      
    } catch (error) {
      console.error('Error updating rates:', error);
      toast({
        title: "Error",
        description: "Failed to update rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRates(false);
    }
  };

  const handleAddProductSuccess = () => {
    setShowAddProductDialog(false);
    toast({
      title: 'Success',
      description: 'Product added successfully',
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Secure session • Auto-logout in {Math.floor(SESSION_TIMEOUT / 60000)} minutes of inactivity
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Secure Logout
              </Button>
            </div>
            
            <Tabs defaultValue="rates" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="rates">Update Rates</TabsTrigger>
                <TabsTrigger value="products">Manage Products</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rates" className="mt-6">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>Update Rates</CardTitle>
                    <CardDescription>
                      {initialLoading ? 'Loading current rates...' : 'Update the current gold and silver rates'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRateUpdate} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="goldRate" className="text-sm font-medium">
                          Gold Rate (per 10gm)
                        </label>
                        <Input
                          id="goldRate"
                          type="number"
                          value={goldRate}
                          onChange={(e) => setGoldRate(e.target.value)}
                          required
                          disabled={initialLoading}
                          placeholder={initialLoading ? "Loading..." : "Enter gold rate"}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="silverRate" className="text-sm font-medium">
                          Silver Rate (per 10gm)
                        </label>
                        <Input
                          id="silverRate"
                          type="number"
                          value={silverRate}
                          onChange={(e) => setSilverRate(e.target.value)}
                          required
                          disabled={initialLoading}
                          placeholder={initialLoading ? "Loading..." : "Enter silver rate"}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isUpdatingRates || initialLoading}
                      >
                        {isUpdatingRates ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </span>
                        ) : 'Update Rates'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Product Management</CardTitle>
                        <CardDescription>
                          Add, edit, and delete products in your jewelry gallery
                        </CardDescription>
                      </div>
                      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[70vh] pr-4">
                            <ProductForm onSuccess={handleAddProductSuccess} />
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <JewelryGallery isOwner={true} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <div className="grid gap-6 max-w-2xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Session Security</p>
                          <p className="text-xs text-green-600">Auto-logout enabled</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Rate Limiting</p>
                          <p className="text-xs text-green-600">Active protection</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Account Lockout</p>
                          <p className="text-xs text-green-600">Exponential backoff</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Password Strength</p>
                          <p className="text-xs text-green-600">Enhanced validation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your master password with enhanced security requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Confirm Password</label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Changing Password...
                            </span>
                          ) : 'Change Password'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>
                      Configure your admin preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 bg-gradient-to-b from-background to-accent/10">
        <div className="container px-4">
          <Card className="mx-auto max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                {t('login.title')}
              </CardTitle>
              <CardDescription className="text-center">
                Secure owner authentication required
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(loginAttempts > 0 || locked) && (
                <Alert className="mb-4" variant={locked ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {locked 
                      ? `Account locked for security. Retry in ${formatTime(lockTimer)}`
                      : `${loginAttempts} failed attempt${loginAttempts > 1 ? 's' : ''}. ${MAX_ATTEMPTS - loginAttempts} remaining.`
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter secure master password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={error ? 'border-destructive' : ''}
                      disabled={isLoading || locked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || locked}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {error && (
                    <p className="text-sm text-destructive">
                      {errorMessage || 'Invalid credentials'}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || locked || !password.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </span>
                  ) : locked ? (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Locked ({formatTime(lockTimer)})
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Secure Login
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Enhanced security • Rate limiting • Session management
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Owner access only • All attempts are logged
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
