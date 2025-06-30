
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
 * Store customer mobile number in localStorage (keeping for backward compatibility)
 */
export const saveMobileNumber = (mobileNumber: string): void => {
  const formattedNumber = formatPhoneNumber(mobileNumber);
  localStorage.setItem('customerMobileNumber', formattedNumber);
};

/**
 * Ensure phone number has +91 prefix
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.startsWith('91')) {
    cleanNumber = cleanNumber.substring(2);
  }
  
  if (cleanNumber.length !== 10) {
    return phoneNumber;
  }
  
  return `+91${cleanNumber}`;
};

/**
 * Get stored customer mobile number from localStorage (keeping for backward compatibility)
 */
export const getMobileNumber = (): string | null => {
  const number = localStorage.getItem('customerMobileNumber');
  return number ? formatPhoneNumber(number) : null;
};

/**
 * Add a new subscriber to the database
 */
export const addSubscriber = async (phoneNumber: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const { error } = await supabase
      .from('subscribers')
      .insert({ 
        phone_number: formattedNumber,
        is_active: true 
      });
    
    if (error) {
      console.error('Error adding subscriber:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false;
  }
};

/**
 * Get all active subscribers from the database
 */
export const getSubscriberDetails = async (): Promise<Array<{id: string, phone_number: string}>> => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, phone_number')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
};

/**
 * Remove a subscriber from the database
 */
export const removeSubscriber = async (phoneNumber: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('phone_number', phoneNumber);
    
    if (error) {
      console.error('Error removing subscriber:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing subscriber:', error);
    return false;
  }
};

/**
 * Update a subscriber's phone number in the database
 */
export const updateSubscriber = async (oldPhoneNumber: string, newPhoneNumber: string): Promise<boolean> => {
  try {
    const formattedNewNumber = formatPhoneNumber(newPhoneNumber);
    
    const { error } = await supabase
      .from('subscribers')
      .update({ 
        phone_number: formattedNewNumber,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', oldPhoneNumber);
    
    if (error) {
      console.error('Error updating subscriber:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return false;
  }
};

/**
 * Get additional mobile numbers (deprecated - kept for backward compatibility)
 */
export const getAdditionalNumbers = async (): Promise<string[]> => {
  try {
    const subscribers = await getSubscriberDetails();
    return subscribers.map(sub => sub.phone_number);
  } catch (error) {
    console.error('Error getting additional numbers:', error);
    return [];
  }
};

/**
 * Save additional numbers (deprecated - kept for backward compatibility)
 */
export const saveAdditionalNumbers = async (numbers: string[]): Promise<boolean> => {
  // This function is kept for backward compatibility but should use addSubscriber instead
  try {
    const currentSubscribers = await getSubscriberDetails();
    const currentNumbers = currentSubscribers.map(sub => sub.phone_number);
    
    // Add new numbers
    for (const number of numbers) {
      const formattedNumber = formatPhoneNumber(number);
      if (!currentNumbers.includes(formattedNumber)) {
        await addSubscriber(formattedNumber);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving additional numbers:', error);
    return false;
  }
};

/**
 * Send WhatsApp notification via API
 */
export const sendWhatsAppNotification = async (
  message: string, 
  phoneNumber: string
): Promise<boolean> => {
  try {
    const response = await supabase.functions.invoke('send-notification', {
      body: {
        message,
        phoneNumber: formatPhoneNumber(phoneNumber)
      }
    });

    if (response.error) {
      console.error('Error sending notification:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};

/**
 * Send bulk notifications to all active subscribers
 */
export const sendBulkWhatsAppNotifications = async (message: string): Promise<number> => {
  try {
    const response = await supabase.functions.invoke('send-bulk-notifications', {
      body: { message }
    });

    if (response.error) {
      console.error('Error sending bulk notifications:', response.error);
      return 0;
    }

    return response.data?.count || 0;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return 0;
  }
};

/**
 * Send rate update notifications to all subscribers
 */
export const sendRateUpdateNotifications = async (
  goldRate?: number,
  silverRate?: number,
  oldGoldRate?: number,
  oldSilverRate?: number
): Promise<number> => {
  try {
    let messages: string[] = [];
    
    if (goldRate !== undefined) {
      messages.push(generateRateChangeMessage('gold', oldGoldRate || null, goldRate));
    }
    
    if (silverRate !== undefined) {
      messages.push(generateRateChangeMessage('silver', oldSilverRate || null, silverRate));
    }
    
    if (messages.length === 0) {
      return 0;
    }
    
    const combinedMessage = messages.join('\n\n');
    return await sendBulkWhatsAppNotifications(combinedMessage);
  } catch (error) {
    console.error('Error sending rate update notifications:', error);
    return 0;
  }
};
