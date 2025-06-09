
import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a message about rate changes
 */
export const generateRateChangeMessage = (
  metalType: string,
  oldRate: number | null,
  newRate: number
): string => {
  if (!oldRate) return `Current ${metalType} rate: ₹${newRate.toLocaleString()} per 10gm`;
  
  const difference = newRate - oldRate;
  const changeDirection = difference > 0 ? 'up' : 'down';
  const absDifference = Math.abs(difference);
  
  return `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} rate is ${changeDirection} by ₹${absDifference.toLocaleString()}. Current rate: ₹${newRate.toLocaleString()} per 10gm`;
};

/**
 * Store customer mobile number in localStorage
 */
export const saveMobileNumber = (mobileNumber: string): void => {
  // Ensure number has +91 prefix
  const formattedNumber = formatPhoneNumber(mobileNumber);
  localStorage.setItem('customerMobileNumber', formattedNumber);
};

/**
 * Ensure phone number has +91 prefix
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any existing country code or non-numeric characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Remove 91 from beginning if present
  if (cleanNumber.startsWith('91')) {
    cleanNumber = cleanNumber.substring(2);
  }
  
  // Ensure the number is 10 digits
  if (cleanNumber.length !== 10) {
    return phoneNumber; // Return original if not valid
  }
  
  // Add +91 prefix
  return `+91${cleanNumber}`;
};

/**
 * Get stored customer mobile number from localStorage
 */
export const getMobileNumber = (): string | null => {
  const number = localStorage.getItem('customerMobileNumber');
  return number ? formatPhoneNumber(number) : null;
};

/**
 * Store additional numbers in localStorage (temporary solution)
 */
export const saveAdditionalNumbers = async (numbers: string[]): Promise<boolean> => {
  try {
    // Format all numbers with +91 prefix
    const formattedNumbers = numbers.map(number => formatPhoneNumber(number));
    
    // Store in localStorage as JSON
    localStorage.setItem('additionalNotificationNumbers', JSON.stringify(formattedNumbers));
    
    return true;
  } catch (e) {
    console.error('Error saving additional numbers:', e);
    return false;
  }
};

/**
 * Get additional mobile numbers from localStorage (temporary solution)
 */
export const getAdditionalNumbers = async (): Promise<string[]> => {
  try {
    const stored = localStorage.getItem('additionalNotificationNumbers');
    if (!stored) return [];
    
    const numbers = JSON.parse(stored);
    return Array.isArray(numbers) ? numbers : [];
  } catch (e) {
    console.error('Error retrieving additional numbers:', e);
    return [];
  }
};

/**
 * Remove a subscriber by phone number (temporary solution using localStorage)
 */
export const removeSubscriber = async (phoneNumber: string): Promise<boolean> => {
  try {
    const currentNumbers = await getAdditionalNumbers();
    const updatedNumbers = currentNumbers.filter(num => num !== phoneNumber);
    await saveAdditionalNumbers(updatedNumbers);
    return true;
  } catch (e) {
    console.error('Error removing subscriber:', e);
    return false;
  }
};

/**
 * Update a subscriber's phone number (temporary solution using localStorage)
 */
export const updateSubscriber = async (oldPhoneNumber: string, newPhoneNumber: string): Promise<boolean> => {
  try {
    const currentNumbers = await getAdditionalNumbers();
    const formattedNewNumber = formatPhoneNumber(newPhoneNumber);
    
    const updatedNumbers = currentNumbers.map(num => 
      num === oldPhoneNumber ? formattedNewNumber : num
    );
    
    await saveAdditionalNumbers(updatedNumbers);
    return true;
  } catch (e) {
    console.error('Error updating subscriber:', e);
    return false;
  }
};

/**
 * Get subscriber details (temporary solution using localStorage)
 */
export const getSubscriberDetails = async (): Promise<Array<{id: string, phone_number: string}>> => {
  try {
    const numbers = await getAdditionalNumbers();
    
    // Create mock subscriber objects with phone numbers as IDs
    return numbers.map(number => ({
      id: number, // Using phone number as ID for now
      phone_number: number
    }));
  } catch (e) {
    console.error('Error retrieving subscriber details:', e);
    return [];
  }
};

/**
 * Sends a WhatsApp notification about rate changes
 */
export const sendWhatsAppNotification = (
  message: string, 
  phoneNumber: string
): boolean => {
  try {
    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(message);
    
    // Format the phone number
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Open WhatsApp in a new tab
    window.open(`https://wa.me/${formattedNumber}?text=${whatsappMessage}`, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};

/**
 * Send notifications to all subscribers at once - disabled functionality
 */
export const sendBulkWhatsAppNotifications = async (message: string): Promise<number> => {
  console.log('Bulk messaging has been disabled');
  return 0;
};
