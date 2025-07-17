import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jewelryContext = {
  en: {
    greeting: "Hello! I'm your jewelry assistant. I can help you with gold rates, jewelry types, and shopping advice.",
    goldRateInfo: "Current gold rates vary daily. Please check our rate display for the most up-to-date prices.",
    jewelryTypes: "We offer various jewelry types including necklaces, rings, earrings, bracelets, and pendants in different purities.",
    shopInfo: "Our shop specializes in quality jewelry for Indian customers with competitive rates and authentic products.",
  },
  mr: {
    greeting: "नमस्कार! मी तुमचा दागिने सहायक आहे. मी तुम्हाला सोन्याच्या दरांबद्दल, दागिन्यांच्या प्रकारांबद्दल आणि खरेदीच्या सल्ल्यांबद्दल मदत करू शकतो.",
    goldRateInfo: "सोन्याचे दर दररोज बदलतात. अद्ययावत किमतींसाठी कृपया आमचे दर प्रदर्शन पहा.",
    jewelryTypes: "आमच्याकडे विविध दागिने आहेत ज्यात हार, अंगठी, कानातले, बांगडी आणि पेंडंट विविध शुद्धतेमध्ये आहेत.",
    shopInfo: "आमचे दुकान भारतीय ग्राहकांसाठी गुणवत्तापूर्ण दागिन्यांमध्ये तज्ञ आहे आणि स्पर्धात्मक दरांसह खरे उत्पादने देते.",
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received message:', message, 'Language:', language);

    // Simple rule-based responses for common queries
    const lowerMessage = message.toLowerCase();
    const context = jewelryContext[language as keyof typeof jewelryContext] || jewelryContext.en;
    
    let response = '';

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('नमस्कार')) {
      response = context.greeting;
    } else if (lowerMessage.includes('gold rate') || lowerMessage.includes('price') || lowerMessage.includes('दर') || lowerMessage.includes('किंमत')) {
      response = context.goldRateInfo;
    } else if (lowerMessage.includes('jewelry') || lowerMessage.includes('necklace') || lowerMessage.includes('ring') || lowerMessage.includes('दागिने')) {
      response = context.jewelryTypes;
    } else if (lowerMessage.includes('shop') || lowerMessage.includes('store') || lowerMessage.includes('दुकान')) {
      response = context.shopInfo;
    } else {
      // Default helpful response
      response = language === 'mr' 
        ? "मला तुमचा प्रश्न समजला नाही. कृपया सोन्याच्या दरांबद्दल, दागिन्यांबद्दल किंवा आमच्या दुकानाबद्दल विचारा."
        : "I didn't understand your question. Please ask about gold rates, jewelry types, or our shop information.";
    }

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process message',
      response: 'Sorry, I encountered an error. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});