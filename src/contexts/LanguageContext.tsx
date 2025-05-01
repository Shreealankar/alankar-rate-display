
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'Shree Alankar',
    'app.tagline': 'Fine Jewelry Since 1998',
    'language': 'Language',
    
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.terms': 'Terms & Conditions',
    'nav.help': 'Help',
    'nav.login': 'Owner Login',
    
    // Home page
    'home.title': 'Welcome to Shree Alankar',
    'home.subtitle': 'Gold & Silver Jewelry',
    'home.rates': 'Today\'s Rates',
    'home.gold': 'Gold',
    'home.silver': 'Silver',
    'home.per10gm': 'per 10gm',
    'home.per1kg': 'per 1kg',
    'home.address': 'Near Bank Of Maharashtra, Lohoner 423301',
    'home.contact': 'Contact: 9921612155',
    'home.lastUpdated': 'Last updated',
    
    // About page
    'about.title': 'About Us',
    'about.story': 'Our Story',
    'about.story.content': 'Shree Alankar is a premier jewelry shop established in 1998, offering the finest gold and silver jewelry. We pride ourselves on quality, craftsmanship, and trusted service to our valued customers.',
    'about.vision': 'Our Vision',
    'about.vision.content': 'To be the most trusted jewelry shop in the region, offering exceptional quality and service.',
    'about.mission': 'Our Mission',
    'about.mission.content': 'To provide our customers with the highest quality gold and silver jewelry at fair prices, with transparent business practices.',
    
    // Terms page
    'terms.title': 'Terms & Conditions',
    'terms.subtitle': 'Please read our terms and conditions carefully',
    'terms.scan': 'Scan QR code for detailed terms',
    
    // Help page
    'help.title': 'Help & Support',
    'help.contact': 'Contact Us',
    'help.complaint': 'Submit a Complaint',
    'help.name': 'Your Name',
    'help.mobile': 'Mobile Number',
    'help.message': 'Your Complaint',
    'help.submit': 'Submit via WhatsApp',
    'help.faq': 'Frequently Asked Questions',
    
    // Login page
    'login.title': 'Owner Login',
    'login.password': 'Password',
    'login.button': 'Login',
    'login.error': 'Invalid password',
    
    // Dashboard
    'dashboard.title': 'Rate Management',
    'dashboard.update': 'Update Rates',
    'dashboard.goldRate': 'Gold Rate (per 10gm)',
    'dashboard.silverRate': 'Silver Rate (per 10gm)',
    'dashboard.save': 'Save Changes',
    'dashboard.logout': 'Logout',
    'dashboard.success': 'Rates updated successfully',
    
    // Feature Section Translations
    'features.craftsmanship.title': 'Quality Craftsmanship',
    'features.craftsmanship.description': 'Exquisite jewelry crafted with precision and care for lasting beauty.',
    
    'features.rates.title': 'Live Market Rates',
    'features.rates.description': 'Stay updated with current gold and silver rates for transparent pricing.',
    
    'features.support.title': 'Dedicated Support',
    'features.support.description': 'Exceptional customer service and expert guidance for your jewelry needs.',
  },
  mr: {
    // Common
    'app.name': 'श्री अलंकार',
    'app.tagline': '१९९८ पासून उत्तम दागिने',
    'language': 'भाषा',
    
    // Navigation
    'nav.home': 'मुख्यपृष्ठ',
    'nav.about': 'आमच्याबद्दल',
    'nav.terms': 'नियम व अटी',
    'nav.help': 'मदत',
    'nav.login': 'मालक लॉगिन',
    
    // Home page
    'home.title': 'श्री अलंकार मध्ये आपले स्वागत आहे',
    'home.subtitle': 'सोने आणि चांदीचे दागिने',
    'home.rates': 'आजचे दर',
    'home.gold': 'सोने',
    'home.silver': 'चांदी',
    'home.per10gm': 'प्रति १० ग्रॅम',
    'home.per1kg': 'प्रति १ किलो',
    'home.address': 'बँक ऑफ महाराष्ट्र जवळ, लोहोनेर ४२३३०१',
    'home.contact': 'संपर्क: ९९२१६१२१५५',
    'home.lastUpdated': 'शेवटचे अपडेट',
    
    // About page
    'about.title': 'आमच्याबद्दल',
    'about.story': 'आमची कहाणी',
    'about.story.content': 'श्री अलंकार हे १९९८ मध्ये स्थापित एक प्रमुख दागिने दुकान आहे, जे उत्कृष्ट सोने आणि चांदीचे दागिने ऑफर करते. आम्ही गुणवत्ता, कारागिरी आणि आमच्या मूल्यवान ग्राहकांना विश्वासार्ह सेवा देण्यावर गर्व करतो.',
    'about.vision': 'आमची दृष्टी',
    'about.vision.content': 'प्रदेशातील सर्वात विश्वासार्ह दागिन्यांचे दुकान होणे, उत्कृष्ट गुणवत्ता आणि सेवा देणे.',
    'about.mission': 'आमचे ध्येय',
    'about.mission.content': 'आमच्या ग्राहकांना वाजवी किंमतीत, पारदर्शक व्यावसायिक पद्धतींसह, सर्वोच्च गुणवत्तेचे सोने आणि चांदीचे दागिने प्रदान करणे.',
    
    // Terms page
    'terms.title': 'नियम व अटी',
    'terms.subtitle': 'कृपया आमचे नियम व अटी काळजीपूर्वक वाचा',
    'terms.scan': 'तपशीलवार अटींसाठी संपर्क साधा',
    
    // Help page
    'help.title': 'मदत आणि समर्थन',
    'help.contact': 'आमच्याशी संपर्क साधा',
    'help.complaint': 'तक्रार दाखल करा',
    'help.name': 'तुमचे नाव',
    'help.mobile': 'मोबाईल नंबर',
    'help.message': 'तुमची तक्रार',
    'help.submit': 'WhatsApp द्वारे पाठवा',
    'help.faq': 'वारंवार विचारले जाणारे प्रश्न',
    
    // Login page
    'login.title': 'मालक लॉगिन',
    'login.password': 'पासवर्ड',
    'login.button': 'लॉगिन',
    'login.error': 'अवैध पासवर्ड',
    
    // Dashboard
    'dashboard.title': 'दर व्यवस्थापन',
    'dashboard.update': 'दर अपडेट करा',
    'dashboard.goldRate': 'सोन्याचा दर (प्रति १० ग्रॅम)',
    'dashboard.silverRate': 'चांदीचा दर (प्रति १० ग्रॅम)',
    'dashboard.save': 'बदल साठवा',
    'dashboard.logout': 'लॉगआउट',
    'dashboard.success': 'दर यशस्वीरित्या अपडेट केले',
    
    // Feature Section Translations
    'features.craftsmanship.title': 'उच्च दर्जाची कारागिरी',
    'features.craftsmanship.description': 'काळजीपूर्वक बनविलेले सुंदर दागिने जे कायमस्वरूपी सुंदर दिसतात.',
    
    'features.rates.title': 'थेट बाजार दर',
    'features.rates.description': 'पारदर्शक किंमत करिता सोने आणि चांदीचे सध्याचे दर जाणून घ्या.',
    
    'features.support.title': 'समर्पित ग्राहक सेवा',
    'features.support.description': 'तुमच्या दागिने आवश्यकतांसाठी असाधारण ग्राहक सेवा आणि तज्ञांचे मार्गदर्शन.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Translation function
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
