
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    // Simple password check - in real app, this would be handled by Supabase authentication
    if (password === 'Shreealankar3230') {
      // Success - simulate loading
      setTimeout(() => {
        // In a real app with Supabase, we'd store the session token
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoading(false);
        toast({
          title: "Login successful",
          description: "You are now logged in as the owner",
        });
        navigate('/dashboard');
      }, 1000);
    } else {
      // Failed login
      setTimeout(() => {
        setError(true);
        setIsLoading(false);
      }, 800);
    }
  };

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
                  />
                  {error && (
                    <p className="text-sm text-destructive">{t('login.error')}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : t('login.button')}
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
