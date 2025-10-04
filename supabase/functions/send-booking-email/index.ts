import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  bookingCode: string;
  fullName: string;
  email: string;
  primaryMobile: string;
  secondaryMobile?: string;
  fullAddress: string;
  bookingType: string;
  goldWeight: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingEmailRequest = await req.json();
    console.log("Sending booking email for:", data.bookingCode);

    const bookingTypeDisplay = {
      '24k_gold_995': '24K Gold 995',
      '24k_gold_normal': '24K Gold Normal',
      'gold_jewellery': 'Gold Jewellery'
    }[data.bookingType] || data.bookingType;

    const emailResponse = await resend.emails.send({
      from: "Alankar Jewellers <onboarding@resend.dev>",
      to: ["kiranjadhav3230@gmail.com"],
      subject: `New Gold Booking - ${data.bookingCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">🪙 New Gold Booking Received</h1>
            
            <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #333; font-size: 24px; text-align: center;">Booking Code: ${data.bookingCode}</h2>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #d4af37; margin-top: 0;">Customer Details:</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${data.fullName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 8px 0;"><strong>Primary Mobile (WhatsApp):</strong> ${data.primaryMobile}</p>
              ${data.secondaryMobile ? `<p style="margin: 8px 0;"><strong>Secondary Mobile:</strong> ${data.secondaryMobile}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Address:</strong> ${data.fullAddress}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #d4af37; margin-top: 0;">Booking Details:</h3>
              <p style="margin: 8px 0;"><strong>Type:</strong> ${bookingTypeDisplay}</p>
              <p style="margin: 8px 0;"><strong>Weight:</strong> ${data.goldWeight} grams</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;"><strong>Action Required:</strong> Please contact the customer to confirm payment and complete the booking process.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending booking email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
