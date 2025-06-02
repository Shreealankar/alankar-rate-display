
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
import { Loader2, Shield } from 'lucide-react';
import { JewelryGallery } from '@/components/JewelryGallery';

const LoginPage = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        // Lock period expired
        localStorage.removeItem('lockedUntil');
        setLocked(false);
      }
    }

    // Restore attempt count
    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (locked) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${lockTimer} seconds.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(false);
    
    // Simple password check 
    if (password === 'Shreealankar3230') {
      // Success - simulate loading
      setTimeout(() => {
        // Reset failed attempts on successful login
        setLoginAttempts(0);
        localStorage.setItem('loginAttempts', '0');
        localStorage.removeItem('lockedUntil');
        
        // Store login status
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        setIsLoading(false);
        toast({
          title: "Login successful",
          description: "You are now logged in as the owner",
        });
      }, 1000);
    } else {
      // Failed login
      setTimeout(() => {
        setError(true);
        setIsLoading(false);
        
        // Increment and store failed attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockDuration = 60; // seconds
          const lockedUntil = Date.now() + (lockDuration * 1000);
          localStorage.setItem('lockedUntil', lockedUntil.toString());
          
          setLocked(true);
          setLockTimer(lockDuration);
          
          toast({
            title: "Account Locked",
            description: `Too many failed attempts. Try again in ${lockDuration} seconds.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: `Incorrect password. ${5 - newAttempts} attempts remaining.`,
            variant: "destructive",
          });
        }
      }, 800);
    }
  };

  // Check if already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  if (isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
            
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">Manage Products</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>
                      Add, edit, and delete products in your jewelry gallery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JewelryGallery isOwner={true} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dashboard" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Overview</CardTitle>
                    <CardDescription>
                      View your business analytics and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Dashboard features coming soon...</p>
                  </CardContent>
                </Card>
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
              <CardTitle className="text-2xl text-center">{t('login.title')}</CardTitle>
              <CardDescription className="text-center">
                Enter your password to access the owner dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('login.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={error ? 'border-destructive' : ''}
                    disabled={isLoading || locked}
                  />
                  {error && (
                    <p className="text-sm text-destructive">{t('login.error')}</p>
                  )}
                  {locked && (
                    <p className="text-sm text-destructive">
                      Account locked. Try again in {lockTimer} seconds.
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || locked}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : locked ? (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Locked ({lockTimer}s)
                    </span>
                  ) : (
                    t('login.button')
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                This login is only for the shop owner
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
