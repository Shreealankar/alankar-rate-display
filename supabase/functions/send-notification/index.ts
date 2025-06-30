
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, phoneNumber } = await req.json();

    if (!message || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Message and phone number are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL (this opens WhatsApp web/app)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`;
    
    console.log(`Notification sent to ${phoneNumber}: ${message}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappUrl,
        message: 'Notification prepared successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
