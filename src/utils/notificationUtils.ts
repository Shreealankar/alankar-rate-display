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
    
    // Cache the numbers in localStorage for quick access
    localStorage.setItem('additionalMobileNumbers', JSON.stringify(numbers));
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
    // Try to get from cache first for better performance
    const cachedNumbers = localStorage.getItem('additionalMobileNumbers');
    if (cachedNumbers) {
      try {
        const parsed = JSON.parse(cachedNumbers);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing cached numbers:', e);
      }
    }
    
    // Otherwise fetch from Supabase
    const { data, error } = await supabase
      .from('notification_numbers')
      .select('phone_number');
    
    if (error) {
      console.error('Error fetching additional numbers:', error);
      return [];
    }
    
    const numbers = data.map(row => row.phone_number);
    
    // Update cache
    localStorage.setItem('additionalMobileNumbers', JSON.stringify(numbers));
    
    return numbers;
  } catch (e) {
    console.error('Error retrieving additional numbers:', e);
    return [];
  }
};

/**
 * Sends an SMS notification via Supabase edge function
 */
export const sendSMS = async (
  message: string, 
  phoneNumber: string, 
  fromNumber: string = "9921612155"
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        message,
        phoneNumber,
        fromNumber
      }
    });
    
    if (error) {
      console.error('Error calling send-sms function:', error);
      return false;
    }
    
    console.log('SMS sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};
