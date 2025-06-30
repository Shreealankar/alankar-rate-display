
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active subscribers
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('phone_number')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching subscribers:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscribers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: 0, 
          message: 'No active subscribers found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(message);
    
    // Create WhatsApp URLs for all subscribers
    const whatsappUrls = subscribers.map(sub => ({
      phoneNumber: sub.phone_number,
      whatsappUrl: `https://wa.me/${sub.phone_number.replace('+', '')}?text=${whatsappMessage}`
    }));
    
    console.log(`Bulk notification prepared for ${subscribers.length} subscribers`);
    console.log('Message:', message);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: subscribers.length,
        whatsappUrls,
        message: `Bulk notification prepared for ${subscribers.length} subscribers` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-bulk-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
