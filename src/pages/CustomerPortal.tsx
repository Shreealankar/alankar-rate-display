import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomerAuth } from '@/components/CustomerAuth';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const CustomerPortal = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching with setTimeout to avoid recursion
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    const checkExistingSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profileData);

      // Check if owner should be redirected
      if (profileData?.is_owner || localStorage.getItem('ownerLogin') === 'true') {
        toast({
          title: "Owner Access",
          description: "Redirecting to admin dashboard...",
        });
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleAuthSuccess = (authUser: any, authProfile: any) => {
    setUser(authUser);
    setProfile(authProfile);
  };

  const handleSignOut = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {user ? (
          <CustomerDashboard 
            user={user} 
            profile={profile} 
            onSignOut={handleSignOut} 
          />
        ) : (
          <CustomerAuth onAuthSuccess={handleAuthSuccess} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerPortal;