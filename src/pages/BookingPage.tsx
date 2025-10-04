import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  primaryMobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  secondaryMobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number").optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  fullAddress: z.string().min(10, "Address must be at least 10 characters"),
  bookingType: z.enum(["24k_gold_995", "24k_gold_normal", "gold_jewellery"]),
  goldWeight: z.number().min(0.1, "Weight must be at least 0.1 grams"),
});

const BookingPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    fullName: "",
    primaryMobile: "",
    secondaryMobile: "",
    email: "",
    fullAddress: "",
    bookingType: "",
    goldWeight: "",
  });

  const content = {
    english: {
      title: "Gold & Jewellery Booking",
      subtitle: "Book your gold today and secure your investment",
      fullName: "Full Name",
      primaryMobile: "Primary Mobile (WhatsApp)",
      secondaryMobile: "Secondary Mobile (Optional)",
      email: "Email Address",
      address: "Full Address",
      bookingType: "Type of Booking",
      goldWeight: "Gold Weight (in grams)",
      termsLabel: "I have read and accept the Terms and Conditions",
      viewTerms: "View Terms & Conditions",
      hideTerms: "Hide Terms & Conditions",
      bookNow: "Book Now Your Gold",
      termsRequired: "Please accept the terms and conditions",
      types: {
        "24k_gold_995": "24K Gold 995",
        "24k_gold_normal": "24K Gold Normal",
        "gold_jewellery": "Gold Jewellery"
      },
      terms: {
        title: "Terms and Conditions",
        point1: "For booking 24K Gold 995 or 24K Gold Normal, 100% payment of the amount is mandatory.",
        point2: "For jewellery booking, 90% payment of the amount is mandatory.",
        point3: "For payment, we will call you on your phone number. You can pay your amount via cash by visiting our shop or via online payment - we will share the QR code on WhatsApp.",
        point4: "After payment, your booking will be confirmed.",
        point5: "For 24K 995 Gold, you will need to pay additional charges.",
        point6: "The rate used for booking will be the rate applicable when your payment is received."
      }
    },
    marathi: {
      title: "सोने आणि दागिने बुकिंग",
      subtitle: "आजच आपले सोने बुक करा आणि आपली गुंतवणूक सुरक्षित करा",
      fullName: "पूर्ण नाव",
      primaryMobile: "प्राथमिक मोबाईल (व्हाट्सअॅप)",
      secondaryMobile: "दुय्यम मोबाईल (पर्यायी)",
      email: "ईमेल पत्ता",
      address: "पूर्ण पत्ता",
      bookingType: "बुकिंगचा प्रकार",
      goldWeight: "सोन्याचे वजन (ग्रॅममध्ये)",
      termsLabel: "मी अटी व शर्ती वाचल्या आहेत आणि स्वीकारल्या आहेत",
      viewTerms: "अटी व शर्ती पहा",
      hideTerms: "अटी व शर्ती लपवा",
      bookNow: "आता आपले सोने बुक करा",
      termsRequired: "कृपया अटी व शर्ती स्वीकारा",
      types: {
        "24k_gold_995": "२४ कॅरेट सोने ९९५",
        "24k_gold_normal": "२४ कॅरेट सोने सामान्य",
        "gold_jewellery": "सोन्याचे दागिने"
      },
      terms: {
        title: "अटी व शर्ती",
        point1: "२४ कॅरेट सोने ९९५ किंवा २४ कॅरेट सोने सामान्य बुकिंगसाठी १००% रक्कम भरणे आवश्यक आहे.",
        point2: "दागिन्यांच्या बुकिंगसाठी ९०% रक्कम भरणे आवश्यक आहे.",
        point3: "पेमेंटसाठी आम्ही तुम्हाला तुमच्या फोन नंबरवर कॉल करू. तुम्ही आमच्या दुकानात येऊन रोख रक्कम किंवा ऑनलाइन पेमेंटद्वारे रक्कम भरू शकता - आम्ही व्हाट्सअॅपवर QR कोड शेअर करू.",
        point4: "पेमेंट झाल्यानंतर तुमचे बुकिंग पक्के होईल.",
        point5: "२४ कॅरेट ९९५ सोन्यासाठी तुम्हाला अतिरिक्त शुल्क भरावे लागेल.",
        point6: "बुकिंगसाठी वापरलेला दर तुमची रक्कम प्राप्त झाल्यावर लागू असलेला दर असेल."
      }
    }
  };

  const t = language && content[language as keyof typeof content] ? content[language as keyof typeof content] : content.english;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast({
        title: "Error",
        description: t.termsRequired,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const validated = bookingSchema.parse({
        ...formData,
        goldWeight: parseFloat(formData.goldWeight),
        secondaryMobile: formData.secondaryMobile || undefined,
      });

      const { data: session } = await supabase.auth.getSession();
      let customerId = null;

      if (session?.session?.user) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('user_id', session.session.user.id)
          .maybeSingle();
        
        customerId = profile?.id;
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
          customer_id: customerId,
          full_name: validated.fullName,
          primary_mobile: validated.primaryMobile,
          secondary_mobile: validated.secondaryMobile || null,
          email: validated.email,
          full_address: validated.fullAddress,
          booking_type: validated.bookingType,
          gold_weight: validated.goldWeight,
          terms_accepted: true,
          booking_code: '',
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase.functions.invoke('send-booking-email', {
        body: {
          bookingCode: booking.booking_code,
          fullName: validated.fullName,
          email: validated.email,
          primaryMobile: validated.primaryMobile,
          secondaryMobile: validated.secondaryMobile,
          fullAddress: validated.fullAddress,
          bookingType: validated.bookingType,
          goldWeight: validated.goldWeight,
        },
      });

      toast({
        title: "Booking Successful!",
        description: `Your booking code is ${booking.booking_code}. We will contact you soon.`,
      });

      navigate('/customer-portal');
    } catch (error: any) {
      console.error("Booking error:", error);
      
      if (error.name === 'ZodError') {
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          const field = issue.path[0];
          formattedErrors[field] = issue.message;
        });
        setErrors(formattedErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form and correct the errors.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-lg border">
                <CardHeader className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Sparkles className="w-6 h-6" />
                    <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <CardDescription className="text-lg">{t.subtitle}</CardDescription>
                </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.fullName}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryMobile">{t.primaryMobile}</Label>
                  <Input
                    id="primaryMobile"
                    value={formData.primaryMobile}
                    onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
                    placeholder="9876543210"
                    required
                    className={errors.primaryMobile ? "border-destructive" : ""}
                  />
                  {errors.primaryMobile && <p className="text-sm text-destructive">{errors.primaryMobile}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryMobile">{t.secondaryMobile}</Label>
                  <Input
                    id="secondaryMobile"
                    value={formData.secondaryMobile}
                    onChange={(e) => setFormData({ ...formData, secondaryMobile: e.target.value })}
                    placeholder="9876543210"
                    className={errors.secondaryMobile ? "border-destructive" : ""}
                  />
                  {errors.secondaryMobile && <p className="text-sm text-destructive">{errors.secondaryMobile}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">{t.address}</Label>
                <Textarea
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  required
                  rows={3}
                  className={errors.fullAddress ? "border-destructive" : ""}
                />
                {errors.fullAddress && <p className="text-sm text-destructive">{errors.fullAddress}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingType">{t.bookingType}</Label>
                  <Select
                    value={formData.bookingType}
                    onValueChange={(value) => setFormData({ ...formData, bookingType: value })}
                    required
                  >
                    <SelectTrigger className={errors.bookingType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24k_gold_995">{t.types["24k_gold_995"]}</SelectItem>
                      <SelectItem value="24k_gold_normal">{t.types["24k_gold_normal"]}</SelectItem>
                      <SelectItem value="gold_jewellery">{t.types["gold_jewellery"]}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bookingType && <p className="text-sm text-destructive">{errors.bookingType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goldWeight">{t.goldWeight}</Label>
                  <Input
                    id="goldWeight"
                    type="number"
                    step="0.01"
                    value={formData.goldWeight}
                    onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
                    required
                    className={errors.goldWeight ? "border-destructive" : ""}
                  />
                  {errors.goldWeight && <p className="text-sm text-destructive">{errors.goldWeight}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTerms(!showTerms)}
                  className="w-full"
                >
                  {showTerms ? t.hideTerms : t.viewTerms}
                </Button>

                {showTerms && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription>
                      <h3 className="font-bold text-lg mb-3 text-amber-900">{t.terms.title}</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>{t.terms.point1}</li>
                        <li>{t.terms.point2}</li>
                        <li>{t.terms.point3}</li>
                        <li>{t.terms.point4}</li>
                        <li>{t.terms.point5}</li>
                        <li>{t.terms.point6}</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.termsLabel}
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-bold py-6 text-lg"
                disabled={loading || !termsAccepted}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {t.bookNow}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
