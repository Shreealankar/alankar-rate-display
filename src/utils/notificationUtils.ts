
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
 * Store additional numbers in Supabase
 */
export const saveAdditionalNumbers = async (numbers: string[]): Promise<boolean> => {
  try {
    // First, delete all existing numbers
    const { error: deleteError } = await supabase
      .from('notification_numbers')
      .delete()
      .neq('phone_number', '');
    
    if (deleteError) {
      console.error('Error deleting existing numbers:', deleteError);
      return false;
    }
    
    // If there are no numbers to add, we're done
    if (!numbers || numbers.length === 0) {
      return true;
    }
    
    // Format all numbers with +91 prefix and prepare rows for insertion
    const numberRows = numbers.map(number => ({
      phone_number: formatPhoneNumber(number),
    }));
    
    // Insert the new numbers
    const { error: insertError } = await supabase
      .from('notification_numbers')
      .insert(numberRows);
    
    if (insertError) {
      console.error('Error saving additional numbers:', insertError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error processing additional numbers:', e);
    return false;
  }
};

/**
 * Get additional mobile numbers from Supabase
 */
export const getAdditionalNumbers = async (): Promise<string[]> => {
  try {
    // Fetch directly from Supabase
    const { data, error } = await supabase
      .from('notification_numbers')
      .select('id, phone_number');
    
    if (error) {
      console.error('Error fetching additional numbers:', error);
      return [];
    }
    
    const numbers = data.map(row => row.phone_number);
    return numbers;
  } catch (e) {
    console.error('Error retrieving additional numbers:', e);
    return [];
  }
};

/**
 * Remove a subscriber by ID
 */
export const removeSubscriber = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_numbers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error removing subscriber:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error removing subscriber:', e);
    return false;
  }
};

/**
 * Update a subscriber's phone number
 */
export const updateSubscriber = async (id: string, phoneNumber: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const { error } = await supabase
      .from('notification_numbers')
      .update({ phone_number: formattedNumber })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating subscriber:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error updating subscriber:', e);
    return false;
  }
};

/**
 * Get subscriber details including ID
 */
export const getSubscriberDetails = async (): Promise<Array<{id: string, phone_number: string}>> => {
  try {
    // Fetch directly from Supabase
    const { data, error } = await supabase
      .from('notification_numbers')
      .select('id, phone_number');
    
    if (error) {
      console.error('Error fetching subscriber details:', error);
      return [];
    }
    
    return data;
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
 * Send notifications to all subscribers at once
 */
export const sendBulkWhatsAppNotifications = async (message: string): Promise<number> => {
  try {
    // Get customer number from localStorage
    const customerNumber = getMobileNumber();
    
    // Get additional numbers from Supabase
    const additionalNumbers = await getAdditionalNumbers();
    
    // Combine all numbers
    const allNumbers = [
      ...(customerNumber ? [customerNumber] : []), 
      ...additionalNumbers
    ];
    
    if (allNumbers.length === 0) {
      return 0;
    }
    
    // Create a single WhatsApp link with all numbers
    const whatsappMessage = encodeURIComponent(message);
    
    // Send to each number individually (WhatsApp doesn't support bulk messages natively)
    let successCount = 0;
    
    for (const number of allNumbers) {
      const formattedNumber = formatPhoneNumber(number);
      window.open(`https://wa.me/${formattedNumber}?text=${whatsappMessage}`, '_blank');
      successCount++;
      
      // Add a small delay to avoid browser blocking multiple popups
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return successCount;
  } catch (error) {
    console.error('Error sending bulk WhatsApp notifications:', error);
    return 0;
  }
};
