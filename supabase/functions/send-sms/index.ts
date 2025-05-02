
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendSMSRequest {
  message: string;
  phoneNumber: string;
  fromNumber?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, phoneNumber, fromNumber = "9921612155" }: SendSMSRequest = await req.json();

    // Log the request
    console.log(`Sending SMS from ${fromNumber} to ${phoneNumber}: ${message}`);

    // This is where we'll integrate with a real SMS service API
    // For this example, we'll use a basic HTTP request to an SMS gateway
    // You would replace this URL with your actual SMS provider's API endpoint
    const smsApiUrl = "https://api.textlocal.in/send/";
    
    // Get API key from environment variable
    const apiKey = Deno.env.get("TEXTLOCAL_API_KEY");
    
    if (!apiKey) {
      throw new Error("SMS API key not configured");
    }

    // Prepare the payload for the SMS provider
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("numbers", phoneNumber.replace(/^0/, "91")); // Ensure phone number has country code
    formData.append("sender", fromNumber);
    formData.append("message", message);
    
    // Send the request to the SMS API
    const smsResponse = await fetch(smsApiUrl, {
      method: "POST",
      body: formData,
    });
    
    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      throw new Error(`SMS API error: ${smsResponse.status} - ${errorText}`);
    }
    
    const responseData = await smsResponse.json();
    
    // Return the response from the SMS provider
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData 
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
