
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
    'home.rateError': 'Unable to fetch current rates',
    'home.tryAgainLater': 'Please try again later',
    'home.rateLocked': 'Due to some technical error, the rate is locked by Shree Alankar Owner',
    'home.askOnWhatsApp': 'For Gold and Silver Rate Ask on WhatsApp',
    'home.whatsappMessage': 'Hello Shree Alankar, I would like to know the current Gold and Silver rates. Thank you!',
    
    // Notification dialog
    'notification.title': 'Get Rate Updates via SMS',
    'notification.description': 'Enter your mobile number to receive notifications when gold and silver rates change.',
    'notification.mobilePlaceholder': 'Enter your 10-digit mobile number',
    'notification.submit': 'Submit',
    'notification.skip': 'Skip',
    
    // About page
    'about.title': 'About Us',
    'about.story': 'Our Story',
    'about.story.content': 'Shree Alankar is a premier jewelry shop established in 1998, offering the finest gold and silver jewelry. We pride ourselves on quality, craftsmanship, and trusted service to our valued customers.',
    'about.vision': 'Our Vision',
    'about.vision.content': 'To be the most trusted jewelry shop in the region, offering exceptional quality and service.',
    'about.mission': 'Our Mission',
    'about.mission.content': 'To provide our customers with the highest quality gold and silver jewelry at fair prices, with transparent business practices.',
    
    // Store Information
    'store.title': 'Store Information',
    'store.address': 'Address',
    'store.addressLine1': 'Shree Alankar,',
    'store.addressLine2': 'Near Bank Of Maharashtra,',
    'store.addressLine3': 'Lohoner 423301',
    'store.contact': 'Contact',
    'store.phone': 'Phone: 9921612155',
    'store.whatsapp': 'WhatsApp: 9921612155',
    'store.hours': 'Business Hours',
    'store.mondayToSaturday': 'Monday - Saturday',
    'store.sunday': 'Sunday',
    'store.hoursWeekday': '10:00 AM - 8:00 PM',
    'store.hoursSunday': '11:00 AM - 8:00 PM',
    
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
    'dashboard.notificationTitle': 'SMS Notification Settings',
    'dashboard.notificationDescription': 'Add mobile numbers to receive rate update notifications',
    'dashboard.lockRates': 'Lock Rates',
    'dashboard.unlockRates': 'Unlock Rates',
    'dashboard.ratesLocked': 'Rates are now locked',
    'dashboard.ratesUnlocked': 'Rates are now unlocked',
    
    // Feature Section Translations
    'features.craftsmanship.title': 'Quality Craftsmanship',
    'features.craftsmanship.description': 'Exquisite jewelry crafted with precision and care for lasting beauty.',
    
    'features.rates.title': 'Live Market Rates',
    'features.rates.description': 'Stay updated with current gold and silver rates for transparent pricing.',
    
    'features.support.title': 'Dedicated Support',
    'features.support.description': 'Exceptional customer service and expert guidance for your jewelry needs.',
    
    // Diwali Festival
    'diwali.greeting': 'Happy Diwali!',
    'diwali.wish': 'May this festival of lights bring prosperity and joy',
    'diwali.blessing': 'Wishing you and your family a blessed Diwali',
    
    // Jewelry Gallery
    'gallery.title': 'Jewelry Gallery',
    'gallery.ownerMode': 'Owner Mode - You can manage products',
    'gallery.search': 'Search products by title or description...',
    'gallery.filters': 'Filters',
    'gallery.clearAll': 'Clear All',
    'gallery.category': 'Category',
    'gallery.allCategories': 'All Categories',
    'gallery.necklace': 'Necklace',
    'gallery.ring': 'Ring',
    'gallery.earring': 'Earring',
    'gallery.bracelet': 'Bracelet',
    'gallery.pendant': 'Pendant',
    'gallery.other': 'Other',
    'gallery.type': 'Type',
    'gallery.allTypes': 'All Types',
    'gallery.gold': 'Gold',
    'gallery.silver': 'Silver',
    'gallery.purity': 'Purity',
    'gallery.allPurities': 'All Purities',
    'gallery.weightRange': 'Weight Range',
    'gallery.allWeights': 'All Weights',
    'gallery.light': 'Light (Under 5g)',
    'gallery.medium': 'Medium (5-20g)',
    'gallery.heavy': 'Heavy (20g+)',
    'gallery.showing': 'Showing',
    'gallery.of': 'of',
    'gallery.products': 'products',
    'gallery.loading': 'Loading...',
    'gallery.noProducts': 'No products found',
    'gallery.addFirstProduct': 'Use the "Add Product" button above to add your first product',
    'gallery.noMatch': 'No products match your current filters',
    'gallery.clearFilters': 'Clear Filters',
    'gallery.noImage': 'No image',
    'gallery.categoryLabel': 'Category:',
    'gallery.typeLabel': 'Type:',
    'gallery.purityLabel': 'Purity:',
    'gallery.weightLabel': 'Weight:',
    'gallery.edit': 'Edit',
    'gallery.delete': 'Delete',

    // Customer Dashboard
    'customer.profile': 'Profile',
    'customer.bills': 'Bills',
    'customer.purchases': 'Purchases',
    'customer.remainingAmount': 'Remaining Amount',
    'customer.totalRemaining': 'Total remaining amount',
    'customer.totalBills': 'Total Bills',
    'customer.purchaseHistory': 'Purchase history',
    'customer.profileInfo': 'Profile Information',
    'customer.accountDetails': 'Your account details',
    'customer.editProfile': 'Edit Profile',
    'customer.editProfileDesc': 'Update your name and mobile number',
    'customer.name': 'Name',
    'customer.mobile': 'Mobile Number',
    'customer.enterName': 'Enter your name',
    'customer.enterMobile': 'Enter your mobile number',
    'customer.saveChanges': 'Save Changes',
    'customer.cancel': 'Cancel',
    'customer.customer': 'Customer',
    'customer.valuedCustomer': 'Valued Customer',
    'customer.notProvided': 'Not provided',
    'customer.joined': 'Joined',
    'customer.billsInvoices': 'Bills & Invoices',
    'customer.billsDesc': 'Your purchase bills and payment status',
    'customer.noBills': 'No bills found for your account.',
    'customer.billNumber': 'Bill',
    'customer.pending': 'Pending',
    'customer.paid': 'Paid',
    'customer.total': 'Total',
    'customer.balance': 'Balance',
    'customer.items': 'Items',
    'customer.billDetails': 'Bill Details',
    'customer.customerName': 'Customer Name',
    'customer.phone': 'Phone',
    'customer.billItems': 'Bill Items',
    'customer.noItems': 'No items found',
    'customer.totalAmount': 'Total Amount',
    'customer.paidAmount': 'Paid Amount',
    'customer.balanceAmount': 'Balance Amount',
    'customer.paymentMethod': 'Payment Method',
    'customer.purchaseHistoryDesc': 'Detailed view of your jewelry purchases',
    'customer.noPurchases': 'No purchases found.',
    'profile.updated': 'Profile Updated',
    'profile.updateSuccess': 'Your profile has been updated successfully.',
    'profile.error': 'Error',
    'profile.updateError': 'Failed to update profile. Please try again.',
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
    'home.rateError': 'सध्याचे दर आणण्यात अडचण',
    'home.tryAgainLater': 'कृपया नंतर पुन्हा प्रयत्न करा',
    'home.rateLocked': 'काही तांत्रिक त्रुटीमुळे, श्री अलंकार मालकाने दर लॉक केले आहेत',
    'home.askOnWhatsApp': 'सोने आणि चांदीचा दर WhatsApp वर विचारा',
    'home.whatsappMessage': 'नमस्कार श्री अलंकार, मला सध्याचे सोने आणि चांदीचे दर जाणून घ्यायचे आहेत. धन्यवाद!',
    
    // Notification dialog
    'notification.title': 'एसएमएस द्वारे दर अपडेट्स मिळवा',
    'notification.description': 'सोने आणि चांदीचे दर बदलल्यावर सूचना प्राप्त करण्यासाठी आपला मोबाईल नंबर प्रविष्ट करा.',
    'notification.mobilePlaceholder': 'आपला १० अंकी मोबाईल नंबर प्रविष्ट करा',
    'notification.submit': 'सबमिट करा',
    'notification.skip': 'वगळा',
    
    // About page
    'about.title': 'आमच्याबद्दल',
    'about.story': 'आमची कहाणी',
    'about.story.content': 'श्री अलंकार हे १९९८ मध्ये स्थापित एक प्रमुख दागिने दुकान आहे, जे उत्कृष्ट सोने आणि चांदीचे दागिने ऑफर करते. आम्ही गुणवत्ता, कारागिरी आणि आमच्या मूल्यवान ग्राहकांना विश्वासार्ह सेवा देण्यावर गर्व करतो.',
    'about.vision': 'आमची दृष्टी',
    'about.vision.content': 'प्रदेशातील सर्वात विश्वासार्ह दागिन्यांचे दुकान होणे, उत्कृष्ट गुणवत्ता आणि सेवा देणे.',
    'about.mission': 'आमचे ध्येय',
    'about.mission.content': 'आमच्या ग्राहकांना वाजवी किंमतीत, पारदर्शक व्यावसायिक पद्धतींसह, सर्वोच्च गुणवत्तेचे सोने आणि चांदीचे दागिने प्रदान करणे.',
    
    // Store Information
    'store.title': 'दुकान माहिती',
    'store.address': 'पत्ता',
    'store.addressLine1': 'श्री अलंकार,',
    'store.addressLine2': 'बँक ऑफ महाराष्ट्र जवळ,',
    'store.addressLine3': 'लोहोनेर ४२३३०१',
    'store.contact': 'संपर्क',
    'store.phone': 'फोन: ९९२१६१२१५५',
    'store.whatsapp': 'व्हाट्सएप: ९९२१६१२१५५',
    'store.hours': 'व्यावसायिक वेळा',
    'store.mondayToSaturday': 'सोमवार - शनिवार',
    'store.sunday': 'रविवार',
    'store.hoursWeekday': 'सकाळी १०:०० - संध्याकाळी ८:००',
    'store.hoursSunday': 'सकाळी ११:०० - संध्याकाळी ८:००',
    
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
    'dashboard.notificationTitle': 'एसएमएस सूचना सेटिंग्ज',
    'dashboard.notificationDescription': 'दर अपडेट सूचना प्राप्त करण्यासाठी मोबाईल नंबर जोडा',
    'dashboard.lockRates': 'दर लॉक करा',
    'dashboard.unlockRates': 'दर अनलॉक करा',
    'dashboard.ratesLocked': 'दर आता लॉक केले आहेत',
    'dashboard.ratesUnlocked': 'दर आता अनलॉक केले आहेत',
    
    // Feature Section Translations
    'features.craftsmanship.title': 'उच्च दर्जाची कारागिरी',
    'features.craftsmanship.description': 'काळजीपूर्वक बनविलेले सुंदर दागिने जे कायमस्वरूपी सुंदर दिसतात.',
    
    'features.rates.title': 'थेट बाजार दर',
    'features.rates.description': 'पारदर्शक किंमत करिता सोने आणि चांदीचे सध्याचे दर जाणून घ्या.',
    
    'features.support.title': 'समर्पित ग्राहक सेवा',
    'features.support.description': 'तुमच्या दागिने आवश्यकतांसाठी असाधारण ग्राहक सेवा आणि तज्ञांचे मार्गदर्शन.',
    
    // Diwali Festival
    'diwali.greeting': 'दिवाळीच्या हार्दिक शुभेच्छा!',
    'diwali.wish': 'या प्रकाशाच्या सणात तुमच्या जीवनात समृद्धी आणि आनंद येवो',
    'diwali.blessing': 'तुम्हाला आणि तुमच्या कुटुंबाला दिवाळीच्या शुभेच्छा',
    
    // Jewelry Gallery
    'gallery.title': 'दागिने गॅलरी',
    'gallery.ownerMode': 'मालक मोड - तुम्ही उत्पादने व्यवस्थापित करू शकता',
    'gallery.search': 'शीर्षक किंवा वर्णनाद्वारे उत्पादने शोधा...',
    'gallery.filters': 'फिल्टर',
    'gallery.clearAll': 'सर्व साफ करा',
    'gallery.category': 'श्रेणी',
    'gallery.allCategories': 'सर्व श्रेणी',
    'gallery.necklace': 'हार',
    'gallery.ring': 'अंगठी',
    'gallery.earring': 'कानातले',
    'gallery.bracelet': 'बांगडी',
    'gallery.pendant': 'लटकन',
    'gallery.other': 'इतर',
    'gallery.type': 'प्रकार',
    'gallery.allTypes': 'सर्व प्रकार',
    'gallery.gold': 'सोने',
    'gallery.silver': 'चांदी',
    'gallery.purity': 'शुद्धता',
    'gallery.allPurities': 'सर्व शुद्धता',
    'gallery.weightRange': 'वजन श्रेणी',
    'gallery.allWeights': 'सर्व वजन',
    'gallery.light': 'हलके (५ ग्रॅम पेक्षा कमी)',
    'gallery.medium': 'मध्यम (५-२० ग्रॅम)',
    'gallery.heavy': 'जड (२० ग्रॅम+)',
    'gallery.showing': 'दाखवत आहे',
    'gallery.of': 'पैकी',
    'gallery.products': 'उत्पादने',
    'gallery.loading': 'लोड होत आहे...',
    'gallery.noProducts': 'कोणतेही उत्पादन सापडले नाही',
    'gallery.addFirstProduct': 'तुमचे पहिले उत्पादन जोडण्यासाठी वरील "उत्पादन जोडा" बटण वापरा',
    'gallery.noMatch': 'तुमच्या सध्याच्या फिल्टरशी कोणतेही उत्पादन जुळत नाही',
    'gallery.clearFilters': 'फिल्टर साफ करा',
    'gallery.noImage': 'चित्र नाही',
    'gallery.categoryLabel': 'श्रेणी:',
    'gallery.typeLabel': 'प्रकार:',
    'gallery.purityLabel': 'शुद्धता:',
    'gallery.weightLabel': 'वजन:',
    'gallery.edit': 'संपादित करा',
    'gallery.delete': 'हटवा',

    // Customer Dashboard
    'customer.profile': 'प्रोफाइल',
    'customer.bills': 'बिले',
    'customer.purchases': 'खरेदी',
    'customer.remainingAmount': 'उर्वरित रक्कम',
    'customer.totalRemaining': 'एकूण उर्वरित रक्कम',
    'customer.totalBills': 'एकूण बिले',
    'customer.purchaseHistory': 'खरेदीचा इतिहास',
    'customer.profileInfo': 'प्रोफाइल माहिती',
    'customer.accountDetails': 'तुमच्या खात्याचे तपशील',
    'customer.editProfile': 'प्रोफाइल संपादित करा',
    'customer.editProfileDesc': 'तुमचे नाव आणि मोबाइल नंबर अपडेट करा',
    'customer.name': 'नाव',
    'customer.mobile': 'मोबाइल नंबर',
    'customer.enterName': 'तुमचे नाव प्रविष्ट करा',
    'customer.enterMobile': 'तुमचा मोबाइल नंबर प्रविष्ट करा',
    'customer.saveChanges': 'बदल साठवा',
    'customer.cancel': 'रद्द करा',
    'customer.customer': 'ग्राहक',
    'customer.valuedCustomer': 'मूल्यवान ग्राहक',
    'customer.notProvided': 'प्रदान केले नाही',
    'customer.joined': 'सामील झाले',
    'customer.billsInvoices': 'बिले आणि चलने',
    'customer.billsDesc': 'तुमच्या खरेदीच्या बिली आणि पेमेंट स्थिती',
    'customer.noBills': 'तुमच्या खात्यासाठी कोणतीही बिले सापडली नाहीत.',
    'customer.billNumber': 'बिल',
    'customer.pending': 'प्रलंबित',
    'customer.paid': 'भरले',
    'customer.total': 'एकूण',
    'customer.balance': 'शिल्लक',
    'customer.items': 'वस्तू',
    'customer.billDetails': 'बिल तपशील',
    'customer.customerName': 'ग्राहकाचे नाव',
    'customer.phone': 'फोन',
    'customer.billItems': 'बिल आयटम',
    'customer.noItems': 'कोणत्याही वस्तू सापडल्या नाहीत',
    'customer.totalAmount': 'एकूण रक्कम',
    'customer.paidAmount': 'भरलेली रक्कम',
    'customer.balanceAmount': 'शिल्लक रक्कम',
    'customer.paymentMethod': 'पेमेंट पद्धत',
    'customer.purchaseHistoryDesc': 'तुमच्या दागिन्यांच्या खरेदीचे तपशीलवार दृश्य',
    'customer.noPurchases': 'कोणतीही खरेदी सापडली नाही.',
    'profile.updated': 'प्रोफाइल अपडेट केले',
    'profile.updateSuccess': 'तुमचे प्रोफाइल यशस्वीरित्या अपडेट केले गेले आहे.',
    'profile.error': 'त्रुटी',
    'profile.updateError': 'प्रोफाइल अपडेट करण्यात अपयश. कृपया पुन्हा प्रयत्न करा.',
  }
};

// Create the context with undefined as initial value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component properly as a function component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Translation function
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
