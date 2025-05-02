
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
  localStorage.setItem('customerMobileNumber', mobileNumber);
};

/**
 * Get stored customer mobile number from localStorage
 */
export const getMobileNumber = (): string | null => {
  return localStorage.getItem('customerMobileNumber');
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
    
    // Prepare the rows for insertion
    const numberRows = numbers.map(number => ({
      phone_number: number,
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
      .select('phone_number');
    
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
 * Sends a WhatsApp notification about rate changes
 */
export const sendWhatsAppNotification = (
  message: string, 
  phoneNumber: string, 
  fromNumber: string = "9921612155"
): boolean => {
  try {
    // Format the message for WhatsApp
    const whatsappMessage = encodeURIComponent(message);
    
    // Open WhatsApp in a new tab
    window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};
